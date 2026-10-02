# API Documentation

## Overview

McKinsey AI Market Research Engine exposes a FastAPI backend for creating and managing AI-powered market research jobs.

The API connects the frontend with the research pipeline and provides access to research jobs, sources, evidence, validations, and generated reports.

## Authentication

Protected endpoints use an authenticated access token.

```text
Authorization: Bearer <supabase_access_token>
```

---

## POST /research

Starts a new research pipeline for the provided query.

### Request

```json
{
  "query": "Impact of Generative AI on education."
}
```

### Response

Creates a research job and starts the McKinsey AI Market Research Engine research pipeline.

The pipeline processes the query through planning, research, evidence extraction, validation, report generation, and citation linking.

---

## GET /research/{job_id}/tasks

Returns the planner tasks associated with a research job.

---

## GET /research/{job_id}/sources

Returns the sources collected during the research process.

---

## GET /research/{job_id}/evidence

Returns the evidence extracted from the collected sources.

---

## GET /research/{job_id}/validations

Returns the validation records associated with the research evidence.

---

## GET /research/{job_id}/report

Returns the generated report for a research job.

---

## GET /docs

FastAPI Swagger UI for exploring and testing the available API endpoints.

```text
http://127.0.0.1:8000/docs
```

---

## Backend Services

The backend uses repository and service components to manage research data and pipeline execution.

* ResearchJobRepository
* PlannerTaskRepository
* SourceRepository
* EvidenceRepository
* ValidationRepository
* ReportRepository
* ResearchService

## Research Pipeline

The API connects to the following research workflow:

**Planner → Research → Extraction → Validation → Citation Builder → Report Agent → Report Linker**

The final output is a structured, evidence-backed research report with traceable citations.
