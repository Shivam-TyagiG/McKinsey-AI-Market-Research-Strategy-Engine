import json
import logging
import math

from ai.browser.tavily_search import TavilySearchEngine
from ai.llm.gemini import GeminiLLM
from ai.schemas.evidence import Evidence
from ai.schemas.source import Source

logger = logging.getLogger(__name__)

# Limit content sent to Gemini to reduce token usage
MAX_CONTENT_LENGTH = 4000
MIN_SEARCH_CONTENT_LENGTH = 300


class ExtractionAgent:

    def __init__(self, llm=None, browser=None):
        self.llm = llm or GeminiLLM()
        self.browser = browser or TavilySearchEngine()

    # -------------------------------------------------------
    # Extract evidence from a single source
    # -------------------------------------------------------

    def extract(self, source: Source) -> list[Evidence]:

        content = (source.content or "").strip()

        if len(content) < MIN_SEARCH_CONTENT_LENGTH:
            try:
                extracted = self.browser.extract([source.url])
                if extracted:
                    content = (extracted[0].get("raw_content") or "").strip()
            except Exception as error:
                logger.warning(
                    "Source extraction failed for %s; using search snippet if available: %s",
                    source.source_id,
                    error,
                )

        if not content:
            logger.warning("No extractable content for source %s.", source.source_id)
            return []

        # Reduce token usage
        content = content[:MAX_CONTENT_LENGTH]

        prompt = f"""
You are an evidence extraction agent.

Analyze the following source.

SOURCE ID:
{source.source_id}

SOURCE TITLE:
{source.title}

SOURCE URL:
{source.url}

CONTENT:
{content}

Extract ONLY the 3 most important factual claims supported by this content.

Return ONLY valid JSON.

[
  {{
    "claim": "Short factual claim",
    "excerpt": "Short supporting excerpt",
    "entity": "Main entity",
    "topic": "Research topic",
    "relevance_score": 0.95
  }}
]

Rules:
- Maximum 3 evidence items.
- Excerpts must come directly from the content.
- Do not invent facts.
- relevance_score between 0 and 1.
- Return only JSON.
"""

        response = self.llm.generate(prompt)

        if not response:
            raise ValueError("Extraction agent received an empty response.")

        cleaned_response = self._clean_response(response)

        try:
            data = json.loads(cleaned_response)
        except json.JSONDecodeError:
            logger.warning(
                "Extraction returned invalid JSON for source %s; skipping source.",
                source.source_id,
            )
            return []

        if isinstance(data, dict):
            data = data.get("evidence", data.get("items", []))

        if not isinstance(data, list):
            logger.warning(
                "Extraction returned an unexpected response shape for source %s.",
                source.source_id,
            )
            return []

        evidences = []

        required_fields = [
            "claim",
            "excerpt",
            "entity",
            "topic",
            "relevance_score",
        ]

        for index, item in enumerate(data, start=1):

            if not isinstance(item, dict):
                continue

            if any(
                field not in item or not isinstance(item[field], str)
                for field in required_fields[:-1]
            ) or "relevance_score" not in item:
                continue

            try:
                score = float(item["relevance_score"])
            except (TypeError, ValueError):
                continue

            if not math.isfinite(score):
                continue

            score = max(0.0, min(score, 1.0))

            claim = item["claim"].strip()
            excerpt = item["excerpt"].strip()
            entity = item["entity"].strip()
            topic = item["topic"].strip()
            if not claim or not excerpt or not entity or not topic:
                continue

            try:
                evidences.append(
                    Evidence(
                        evidence_id=f"{source.source_id}_evidence_{index:03d}",
                        claim=claim,
                        excerpt=excerpt,
                        entity=entity,
                        topic=topic,
                        relevance_score=score,
                        source_id=source.source_id,
                    )
                )
            except (TypeError, ValueError):
                logger.warning(
                    "Skipping invalid evidence item %d from source %s.",
                    index,
                    source.source_id,
                )

        if not evidences:
            logger.warning(
                "Extraction returned no valid evidence for source %s; skipping source.",
                source.source_id,
            )
            return []

        logger.info(
            "Extraction completed: %d evidence items from source %s.",
            len(evidences),
            source.source_id,
        )

        return evidences

    # -------------------------------------------------------
    # Clean Gemini response
    # -------------------------------------------------------

    @staticmethod
    def _clean_response(response: str) -> str:

        cleaned = response.strip()

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]

            cleaned = "\n".join(lines).strip()

        start = min(
            (index for index in (cleaned.find("["), cleaned.find("{")) if index >= 0),
            default=-1,
        )
        if start >= 0:
            try:
                _, end = json.JSONDecoder().raw_decode(cleaned[start:])
                cleaned = cleaned[start:start + end]
            except json.JSONDecodeError:
                pass

        return cleaned
