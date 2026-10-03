import json
import unittest
from datetime import datetime, timezone

from ai.schemas.evidence import Evidence
from ai.schemas.source import Source
from ai.validation.validation_agent import ValidationAgent


class BatchLLM:
    def __init__(self, first_response):
        self.first_response = first_response
        self.calls = 0

    def generate(self, prompt):
        self.calls += 1
        if self.calls == 1:
            return self.first_response
        raise RuntimeError("temporary provider failure")


class ValidationResilienceTests(unittest.TestCase):
    def test_failed_batch_does_not_discard_prior_validation_results(self):
        evidences = [
            Evidence(
                evidence_id=f"evidence_{index}",
                claim=f"Claim {index}",
                excerpt=f"Excerpt {index}",
                entity="Market",
                topic="Demand",
                relevance_score=0.8,
                source_id="source_1",
            )
            for index in range(16)
        ]
        source = Source(
            source_id="source_1",
            url="https://example.com",
            title="Source",
            source_type="web",
            retrieved_at=datetime.now(timezone.utc),
        )
        first_batch_response = json.dumps([
            {
                "evidence_id": evidence.evidence_id,
                "is_valid": True,
                "credibility_score": 0.8,
                "recency_score": 0.7,
                "is_duplicate": False,
                "has_conflict": False,
                "reason": "Supported by the excerpt.",
            }
            for evidence in evidences[:15]
        ])
        llm = BatchLLM(first_batch_response)

        results = ValidationAgent(llm=llm).validate(evidences, [source])

        self.assertEqual(len(results), 15)
        self.assertEqual(llm.calls, 2)


if __name__ == "__main__":
    unittest.main()