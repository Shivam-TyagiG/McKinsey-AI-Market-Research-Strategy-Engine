import unittest

from ai.browser.tavily_search import TavilySearchEngine


class TemporaryTavilyError(Exception):
    status_code = 503


class FakeTavilyClient:
    def __init__(self):
        self.calls = 0

    def search(self, **kwargs):
        self.calls += 1
        if self.calls == 1:
            raise TemporaryTavilyError("service unavailable")
        return {"results": [{"url": "https://example.com", "title": "Example"}]}


class TavilyRetryTests(unittest.TestCase):
    def test_search_retries_one_transient_failure(self):
        client = FakeTavilyClient()
        delays = []
        search = TavilySearchEngine(client=client, sleep=delays.append)

        results = search.search("market outlook")

        self.assertEqual(len(results), 1)
        self.assertEqual(client.calls, 2)
        self.assertEqual(len(delays), 1)
        self.assertLessEqual(delays[0], 2.0)


if __name__ == "__main__":
    unittest.main()