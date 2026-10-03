import os
import logging
import time

from dotenv import load_dotenv
from tavily import TavilyClient

from ai.browser.search import SearchEngine
from ai.reliability import is_retryable_error, retry_delay


load_dotenv()

logger = logging.getLogger(__name__)


class TavilySearchEngine(SearchEngine):

    def __init__(self, client=None, sleep=time.sleep):
        self.api_key = os.getenv("TAVILY_API_KEY")
        self.client = client
        self.sleep = sleep

    def _get_client(self):
        if self.client is None:
            if not self.api_key:
                raise RuntimeError("TAVILY_API_KEY is not configured.")
            self.client = TavilyClient(api_key=self.api_key)
        return self.client

    def _request(self, operation, operation_name: str):
        for attempt in range(1, 3):
            try:
                return operation(self._get_client())
            except Exception as error:
                if not is_retryable_error(error) or attempt == 2:
                    logger.warning(
                        "Tavily %s failed on attempt %d: %s",
                        operation_name,
                        attempt,
                        error,
                    )
                    raise

                delay = retry_delay(error, attempt, base=0.25)
                logger.warning(
                    "Tavily %s had a temporary failure; retrying in %.2fs.",
                    operation_name,
                    delay,
                )
                self.sleep(delay)

    def search(self, query: str) -> list[dict]:
        response = self._request(
            lambda client: client.search(
                query=query,
                search_depth="basic",
                max_results=2,
            ),
            "search",
        )

        return response.get("results", []) if isinstance(response, dict) else []

    def extract(self, urls: list[str]) -> list[dict]:
        response = self._request(
            lambda client: client.extract(urls),
            "extract",
        )

        return response.get("results", []) if isinstance(response, dict) else []