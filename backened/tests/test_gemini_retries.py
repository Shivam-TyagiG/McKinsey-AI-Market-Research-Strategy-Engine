import unittest

from ai.llm.gemini import GeminiLLM


class FakeResponse:
    def __init__(self, text):
        self.text = text


class FakeError(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__(f"HTTP {code}")


class FakeChat:
    def __init__(self, outcomes):
        self.outcomes = outcomes

    def send_message(self, prompt):
        outcome = self.outcomes.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return FakeResponse(outcome)


class FakeChats:
    def __init__(self, outcomes):
        self.outcomes = outcomes
        self.models = []

    def create(self, model):
        self.models.append(model)
        return FakeChat(self.outcomes[model])


class FakeClient:
    def __init__(self, outcomes):
        self.chats = FakeChats(outcomes)


class GeminiRetryTests(unittest.TestCase):
    def test_unavailable_model_falls_back_without_retrying_404(self):
        client = FakeClient({
            "missing-model": [FakeError(404)],
            "working-model": ["ok"],
        })
        llm = GeminiLLM(
            client=client,
            primary_model="missing-model",
            fallback_models=["working-model"],
            sleep=lambda _: None,
        )

        self.assertEqual(llm.generate("prompt"), "ok")
        self.assertEqual(client.chats.models, ["missing-model", "working-model"])

    def test_temporary_error_retries_once_then_succeeds(self):
        client = FakeClient({"model": [FakeError(503), "ok"]})
        delays = []
        llm = GeminiLLM(
            client=client,
            primary_model="model",
            fallback_models=[],
            sleep=delays.append,
        )

        self.assertEqual(llm.generate("prompt"), "ok")
        self.assertEqual(client.chats.models, ["model", "model"])
        self.assertEqual(len(delays), 1)
        self.assertLessEqual(delays[0], 2.4)

    def test_auth_error_does_not_try_fallback_models(self):
        client = FakeClient({
            "model": [FakeError(403)],
            "fallback": ["must not be called"],
        })
        llm = GeminiLLM(
            client=client,
            primary_model="model",
            fallback_models=["fallback"],
            sleep=lambda _: None,
        )

        with self.assertRaisesRegex(RuntimeError, "rejected the request"):
            llm.generate("prompt")
        self.assertEqual(client.chats.models, ["model"])


if __name__ == "__main__":
    unittest.main()