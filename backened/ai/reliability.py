import random
import re


RETRYABLE_STATUS_CODES = {408, 425, 429, 500, 502, 503, 504}
MAX_BACKOFF_SECONDS = 2.0


def get_status_code(error: Exception) -> int | None:
    for candidate in (
        getattr(error, "status_code", None),
        getattr(error, "code", None),
        getattr(getattr(error, "response", None), "status_code", None),
    ):
        try:
            if candidate is not None:
                return int(candidate)
        except (TypeError, ValueError):
            continue

    match = re.search(r"\b(?:HTTP/\S+\s+|status(?:\s+code)?[=: ]+)(\d{3})\b", str(error), re.I)
    return int(match.group(1)) if match else None


def is_retryable_error(error: Exception) -> bool:
    if isinstance(error, (TimeoutError, ConnectionError)):
        return True

    if get_status_code(error) in RETRYABLE_STATUS_CODES:
        return True

    message = str(error).lower()
    if any(
        marker in message
        for marker in (
            "resource_exhausted",
            "service unavailable",
            "temporarily unavailable",
            "connection reset",
            "timed out",
        )
    ):
        return True

    return re.search(r"\b(?:408|425|429|500|502|503|504)\b", message) is not None


def retry_delay(error: Exception, attempt: int, base: float = 0.25) -> float:
    message = str(error)
    match = re.search(r"retryDelay['\"]?:\s*['\"]?([0-9.]+)s", message, re.I)
    if not match:
        match = re.search(r"retry in ([0-9.]+)s", message, re.I)

    suggested = float(match.group(1)) if match else 0.0
    backoff = base * (2 ** max(0, attempt - 1))
    delay = min(max(suggested, backoff), MAX_BACKOFF_SECONDS)
    return min(delay * random.uniform(0.8, 1.2), MAX_BACKOFF_SECONDS)