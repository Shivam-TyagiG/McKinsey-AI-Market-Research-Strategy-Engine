import unittest
from datetime import datetime, timezone

from ai.pipeline.research_pipeline import ResearchPipeline
from ai.schemas.evidence import Evidence
from ai.schemas.research_task import ResearchTask
from ai.schemas.source import Source


def make_source(source_id, url):
    return Source(
        source_id=source_id,
        url=url,
        title=f"Title for {source_id}",
        source_type="web",
        retrieved_at=datetime.now(timezone.utc),
        content="Market evidence. " * 30,
    )


class FakePlanner:
    def __init__(self, fail=False):
        self.fail = fail

    def create_plan(self, query):
        if self.fail:
            raise RuntimeError("planner unavailable")
        return [
            ResearchTask(task_id="task_1", query="First angle", purpose="First"),
            ResearchTask(task_id="task_2", query="Second angle", purpose="Second"),
            ResearchTask(task_id="task_3", query=" first   angle ", purpose="Duplicate"),
        ]


class FakeResearcher:
    def __init__(self):
        self.calls = []

    def research(self, task):
        self.calls.append(task.task_id)
        if task.task_id == "task_1":
            return [
                make_source("source_1", "https://example.com/report#first"),
                make_source("source_2", "https://example.com/other"),
            ]
        return [make_source("source_duplicate", "https://EXAMPLE.com/report")]


class FakeExtractor:
    def __init__(self, fail_all=False):
        self.calls = []
        self.fail_all = fail_all

    def extract(self, source):
        self.calls.append(source.source_id)
        if self.fail_all or source.source_id == "source_2":
            raise RuntimeError("temporary extraction failure")
        return [Evidence(
            evidence_id="evidence_1",
            claim="EV adoption is growing.",
            excerpt="EV adoption is growing.",
            entity="EV market",
            topic="demand",
            relevance_score=0.8,
            source_id=source.source_id,
        )]


class FailingValidator:
    def validate(self, evidences, sources):
        raise RuntimeError("validation service unavailable")


class FailingReporter:
    def generate_report(self, **kwargs):
        raise RuntimeError("report model unavailable")


class PipelineResilienceTests(unittest.TestCase):
    def make_pipeline(self, extractor=None):
        researcher = FakeResearcher()
        extractor = extractor or FakeExtractor()
        pipeline = ResearchPipeline(
            planner=FakePlanner(),
            researcher=researcher,
            extractor=extractor,
            validator=FailingValidator(),
            reporter=FailingReporter(),
        )
        return pipeline, researcher, extractor

    def test_partial_results_produce_fallback_report_and_deduplicate_sources(self):
        pipeline, researcher, extractor = self.make_pipeline()

        result = pipeline.run("EV market outlook")

        self.assertEqual(len(researcher.calls), 2)
        self.assertEqual([source.source_id for source in result.sources], ["source_1", "source_2"])
        self.assertEqual(extractor.calls, ["source_1", "source_2"])
        self.assertEqual(len(result.evidences), 1)
        self.assertIn("Evidence Brief (Fallback)", result.report.title)
        self.assertEqual(result.validations, [])
        self.assertTrue(any("not independently validated" in warning for warning in result.warnings))
        self.assertTrue(any("evidence-only fallback" in warning for warning in result.warnings))
        self.assertTrue(any("temporary extraction failure" in warning for warning in result.warnings))

    def test_planner_failure_uses_original_brief(self):
        researcher = FakeResearcher()
        pipeline = ResearchPipeline(
            planner=FakePlanner(fail=True),
            researcher=researcher,
            extractor=FakeExtractor(),
            validator=FailingValidator(),
            reporter=FailingReporter(),
        )

        result = pipeline.run("EV market outlook")

        self.assertEqual(len(result.tasks), 1)
        self.assertEqual(result.tasks[0].query, "EV market outlook")
        self.assertTrue(any("Planning was unavailable" in warning for warning in result.warnings))

    def test_source_results_survive_when_all_extractions_fail(self):
        pipeline, _, _ = self.make_pipeline(FakeExtractor(fail_all=True))

        result = pipeline.run("EV market outlook")

        self.assertEqual(len(result.sources), 2)
        self.assertEqual(result.evidences, [])
        self.assertEqual(result.report.key_findings, [])
        self.assertEqual(len(result.report.citations), 2)
        self.assertIn("no usable claims", result.report.executive_summary)


if __name__ == "__main__":
    unittest.main()