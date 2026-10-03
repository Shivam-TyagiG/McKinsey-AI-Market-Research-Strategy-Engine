import json
import unittest
from datetime import datetime, timezone

from ai.extraction.extraction_agent import ExtractionAgent
from ai.schemas.source import Source


class FakeLLM:
    def __init__(self, response):
        self.response = response

    def generate(self, prompt):
        return self.response


class FakeBrowser:
    def __init__(self, extracted=None):
        self.extracted = extracted or []
        self.calls = 0

    def extract(self, urls):
        self.calls += 1
        return self.extracted


def make_source(content=None):
    return Source(
        source_id="source_001",
        url="https://example.com/report",
        title="Market report",
        source_type="web",
        retrieved_at=datetime.now(timezone.utc),
        content=content,
    )


class ExtractionResilienceTests(unittest.TestCase):
    def test_malformed_model_output_skips_only_this_source(self):
        browser = FakeBrowser()
        agent = ExtractionAgent(
            llm=FakeLLM("not json"),
            browser=browser,
        )

        self.assertEqual(agent.extract(make_source("Useful source content. " * 20)), [])
        self.assertEqual(browser.calls, 0)

    def test_search_content_avoids_extra_extract_request(self):
        response = json.dumps([{
            "claim": "EV demand is growing.",
            "excerpt": "EV demand is growing.",
            "entity": "EV market",
            "topic": "demand",
            "relevance_score": 0.8,
        }])
        browser = FakeBrowser()
        agent = ExtractionAgent(llm=FakeLLM(response), browser=browser)

        evidence = agent.extract(make_source("Useful source content. " * 20))

        self.assertEqual(len(evidence), 1)
        self.assertEqual(browser.calls, 0)


if __name__ == "__main__":
    unittest.main()