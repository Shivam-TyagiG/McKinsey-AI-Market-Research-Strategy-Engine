import json
import logging
import math

from ai.llm.gemini import GeminiLLM
from ai.schemas.evidence import Evidence
from ai.schemas.source import Source
from ai.schemas.validation import ValidationResult

logger = logging.getLogger(__name__)

# -------------------------------------------------------
# Validation Configuration
# -------------------------------------------------------

VALIDATION_BATCH_SIZE = 15


class ValidationAgent:

    def __init__(self, llm=None):
        self.llm = llm or GeminiLLM()

    # -------------------------------------------------------
    # Public Validation Method
    # -------------------------------------------------------

    def validate(
        self,
        evidences: list[Evidence],
        sources: list[Source],
    ) -> list[ValidationResult]:
        """
        Validate evidence in batches to reduce Gemini token usage.
        """

        if not evidences:
            return []

        source_map = {
            source.source_id: source
            for source in sources
        }

        results = []

        for start in range(0, len(evidences), VALIDATION_BATCH_SIZE):

            batch = evidences[start:start + VALIDATION_BATCH_SIZE]

            logger.info(
                "Validating evidence batch %d-%d of %d",
                start + 1,
                start + len(batch),
                len(evidences),
            )

            try:
                batch_results = self._validate_batch(batch, source_map)
                results.extend(batch_results)
            except Exception as error:
                logger.warning(
                    "Skipping failed validation batch %d-%d: %s",
                    start + 1,
                    start + len(batch),
                    error,
                )

        logger.info(
            "Validation completed: %d validation results.",
            len(results),
        )

        return results

    # -------------------------------------------------------
    # Batch Validation
    # -------------------------------------------------------

    def _validate_batch(
        self,
        evidences: list[Evidence],
        source_map: dict,
    ) -> list[ValidationResult]:

        evidence_payload = []

        for evidence in evidences:

            source = source_map.get(evidence.source_id)

            evidence_payload.append(
                {
                    "evidence_id": evidence.evidence_id,
                    "claim": evidence.claim,
                    "excerpt": evidence.excerpt,
                    "entity": evidence.entity,
                    "topic": evidence.topic,
                    "source_title": source.title if source else "",
                    "publisher": source.publisher if source else "",
                    "published_date": (
                        source.published_date if source else ""
                    ),
                }
            )

        prompt = f"""
You are a research evidence validator.

Evaluate each evidence item using ONLY the supplied excerpt.

Return ONLY valid JSON.

Evidence:
{json.dumps(evidence_payload, indent=2)}

Return:

[
  {{
    "evidence_id": "...",
    "is_valid": true,
    "credibility_score": 0.85,
    "recency_score": 0.90,
    "is_duplicate": false,
    "has_conflict": false,
    "reason": "One short sentence."
  }}
]

Rules:
- One result per evidence item.
- Use only provided information.
- credibility_score and recency_score between 0 and 1.
- Keep reason under 20 words.
- Return JSON only.
"""

        response = self.llm.generate(prompt)

        cleaned_response = self._clean_response(response)

        try:
            data = json.loads(cleaned_response)

        except json.JSONDecodeError:
            logger.warning("Gemini returned invalid validation JSON; skipping batch.")
            return []

        if not isinstance(data, list):
            logger.warning("Validation response was not a JSON array; skipping batch.")
            return []

        results = []
        batch_evidence_ids = {evidence.evidence_id for evidence in evidences}
        seen_evidence_ids = set()

        for item in data:

            if not isinstance(item, dict):
                continue

            required_fields = [
                "evidence_id",
                "is_valid",
                "credibility_score",
                "recency_score",
                "is_duplicate",
                "has_conflict",
                "reason",
            ]

            if any(field not in item for field in required_fields):
                logger.warning(
                    "Skipping malformed validation item: %s",
                    item,
                )
                continue

            evidence_id = item["evidence_id"]
            if (
                not isinstance(evidence_id, str)
                or evidence_id not in batch_evidence_ids
                or evidence_id in seen_evidence_ids
                or not isinstance(item["is_valid"], bool)
                or not isinstance(item["is_duplicate"], bool)
                or not isinstance(item["has_conflict"], bool)
                or not isinstance(item["reason"], str)
            ):
                logger.warning("Skipping validation item with invalid fields or evidence id.")
                continue

            try:
                if isinstance(item["credibility_score"], bool) or isinstance(item["recency_score"], bool):
                    continue
                raw_credibility = float(item["credibility_score"])
                raw_recency = float(item["recency_score"])

            except (TypeError, ValueError):
                continue

            if not math.isfinite(raw_credibility) or not math.isfinite(raw_recency):
                continue

            credibility = max(0.0, min(raw_credibility, 1.0))
            recency = max(0.0, min(raw_recency, 1.0))

            results.append(
                ValidationResult(
                    evidence_id=evidence_id,
                    is_valid=item["is_valid"],
                    credibility_score=credibility,
                    recency_score=recency,
                    is_duplicate=item["is_duplicate"],
                    has_conflict=item["has_conflict"],
                    reason=item["reason"].strip()[:120],
                )
            )
            seen_evidence_ids.add(evidence_id)

        if not results:
            logger.warning("Validation batch contained no valid results.")

        return results

    # -------------------------------------------------------
    # Response Cleaner
    # -------------------------------------------------------

    @staticmethod
    def _clean_response(response: str) -> str:
        """
        Remove Markdown fences and extract JSON array.
        """

        cleaned = response.strip()

        if cleaned.startswith("```"):
            lines = cleaned.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]

            cleaned = "\n".join(lines).strip()

        start = cleaned.find("[")
        end = cleaned.rfind("]")

        if start != -1 and end != -1 and start < end:
            cleaned = cleaned[start:end + 1]

        return cleaned
