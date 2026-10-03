import json

from ai.llm.gemini import GeminiLLM
from ai.schemas.research_task import ResearchTask


class PlannerAgent:
    def __init__(self, llm=None):
        self.llm = llm or GeminiLLM()

    def create_plan(self, query: str) -> list[ResearchTask]:
        prompt = f"""
You are a research planning agent.

Your job is to break the user's research question into clear,
logical and independent research tasks.

User research question:
{query}

Create focused research tasks.

Each task must contain:
- task_id: a unique identifier such as task_001
- query: the specific research question to investigate
- purpose: why this research task is needed

Return ONLY valid JSON.

The JSON must be an array in this exact format:

[
    {{
        "task_id": "task_001",
        "query": "Specific research question",
        "purpose": "Purpose of this research task"
    }}
]

Do not include markdown.
Do not include explanations outside the JSON.
"""
#here we call the LLM to generate the plan based on the prompt
        response = self.llm.generate(prompt).strip()
#here we clean up the response to ensure it is valid JSON and parse it into ResearchTask objects
        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()
#here we attempt to parse the response as JSON and validate it against the ResearchTask schema
        try:
            data = json.loads(response)
        except json.JSONDecodeError as e:
            raise ValueError("Planner returned invalid JSON") from e

        if not isinstance(data, list):
            raise ValueError("Planner response must be a JSON list")
#here we validate each task in the list to ensure it conforms to the ResearchTask schema
        try:
            return [
                ResearchTask.model_validate(task)
                for task in data
            ]
        except Exception as e:
            raise ValueError("Planner returned invalid research tasks") from e