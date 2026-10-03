import os
import time
import logging

from dotenv import load_dotenv
from google import genai

from ai.llm.base import LLM
from ai.reliability import get_status_code, is_retryable_error, retry_delay

# =======================================================
# Load Environment Variables
# =======================================================

load_dotenv()

logger = logging.getLogger(__name__)

# =======================================================
# Retry Configuration
# =======================================================

MAX_MODEL_ATTEMPTS = 2

# =======================================================
# Gemini LLM Wrapper
# =======================================================


class GeminiLLM(LLM):
    """
    Shared Gemini client used across all AI agents.

    Features
    --------
    - Uses Gemini Chat API.
    - Primary model + multiple fallback models.
    - Automatic retry for temporary Gemini failures.
    - Handles 429 quota errors using Gemini RetryInfo delay.
    - Handles 503 unavailable errors with exponential backoff.
    """

    def __init__(
        self,
        client=None,
        api_key: str | None = None,
        primary_model: str | None = None,
        fallback_models: list[str] | None = None,
        sleep=time.sleep,
    ):
        api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.client = client or (genai.Client(api_key=api_key) if api_key else None)
        self.sleep = sleep

        # -------------------------------------------------------
        # Model Configuration (Best → Weakest)
        # -------------------------------------------------------

        self.primary_model = primary_model or os.getenv(
            "GEMINI_MODEL", "gemini-3.5-flash"
        )
        configured_fallbacks = os.getenv(
            "GEMINI_FALLBACK_MODELS", "gemini-2.5-flash,gemini-2.5-flash-lite"
        )
        self.fallback_models = fallback_models or [
            model.strip()
            for model in configured_fallbacks.split(",")
            if model.strip() and model.strip() != self.primary_model
        ]

        logger.info(
            "Primary Gemini model: %s | Fallback models: %s",
            self.primary_model,
            ", ".join(self.fallback_models),
        )

    # =======================================================
    # Internal Chat API Call
    # =======================================================

    def _chat_generate(self, model: str, prompt: str) -> str:
        """Send prompt using Gemini Chat API."""

        if self.client is None:
            raise RuntimeError("GOOGLE_API_KEY is not configured.")

        chat = self.client.chats.create(model=model)

        response = chat.send_message(prompt)

        if not response.text:
            raise RuntimeError("Gemini returned an empty response.")

        return response.text.strip()

    # =======================================================
    # Retry Wrapper
    # =======================================================

    def _generate_with_retry(self, model: str, prompt: str) -> str:
        last_error = None

        for attempt in range(1, MAX_MODEL_ATTEMPTS + 1):
            try:
                logger.info(
                    "Using Gemini model: %s (Attempt %d/%d)",
                    model,
                    attempt,
                    MAX_MODEL_ATTEMPTS,
                )
                return self._chat_generate(model=model, prompt=prompt)
            except Exception as error:
                last_error = error
                status_code = get_status_code(error)

                if status_code in {400, 401, 403}:
                    raise RuntimeError(
                        "Gemini rejected the request; check API access and request configuration."
                    ) from error

                if not is_retryable_error(error) or attempt == MAX_MODEL_ATTEMPTS:
                    logger.warning(
                        "Gemini model %s failed on attempt %d: %s",
                        model,
                        attempt,
                        error,
                    )
                    break

                delay = retry_delay(error, attempt)
                logger.warning(
                    "Gemini model %s had a temporary failure; retrying in %.2fs.",
                    model,
                    delay,
                )
                self.sleep(delay)

        raise RuntimeError(f"Gemini model {model} failed.") from last_error

    # =======================================================
    # Public Generate Method
    # =======================================================

    def generate(self, prompt: str) -> str:
        """
        Generate text using primary model and fallback models.

        Each model is attempted at most twice; only transient failures are retried.
        """

        models = [self.primary_model] + self.fallback_models

        if self.client is None:
            raise RuntimeError("GOOGLE_API_KEY is not configured.")

        unique_models = list(dict.fromkeys(models))
        last_error = None

        for model in unique_models:
            try:
                return self._generate_with_retry(model, prompt)

            except Exception as e:
                last_error = e
                if (
                    get_status_code(e) in {400, 401, 403}
                    or str(e).startswith("Gemini rejected the request")
                ):
                    raise
                logger.warning(
                    "Model %s failed. Trying next fallback model...",
                    model,
                )

        raise RuntimeError(
            "All configured Gemini models failed; check model availability and API quota."
        ) from last_error
