# Architecture

## Overview

McKinsey AI Market Research Engine is an AI-powered market research and strategy engine designed to convert a research query into a structured, evidence-backed report.

The system uses a multi-agent architecture where each agent performs a specific stage of the research workflow.

## Research Pipeline

The main workflow is:

**Planner → Research → Extraction → Validation → Citation Builder → Report Agent → Report Linker**

Each stage contributes to building the final research output.

### 1. Planner Agent

Receives the user's research query and breaks it into smaller research tasks.

### 2. Research Agent

Searches the web for relevant information and collects useful sources for each research task.

### 3. Extraction Agent

Processes the collected sources and extracts relevant evidence, facts, and claims.

### 4. Validation Agent

Checks the extracted evidence for relevance, validity, credibility, and consistency.

### 5. Citation Builder

Organizes source and evidence information so that findings can be connected to their supporting sources.

### 6. Report Agent

Uses the validated evidence to generate a structured research report with findings, insights, and strategic recommendations.

### 7. Report Linker

Links the generated report findings back to their supporting evidence and citations, providing traceability between the report and the underlying research.

## Backend Architecture

The backend is built with FastAPI and contains:

* API layer
* Service layer
* Repository layer
* Database integration
* AI research pipeline

The repository layer manages research jobs, planner tasks, sources, evidence, validations, and reports.

## Database

Supabase is used for database storage.

The system maintains information related to:

* Research Jobs
* Planner Tasks
* Sources
* Evidence
* Validation Records
* Reports
* Feedback
* Memory

## AI and External Services

McKinsey AI Market Research Engine integrates:

* **Google Gemini** for AI-powered planning, extraction, validation, and report generation.
* **Tavily** for web search and source discovery.
* **Supabase** for persistent data storage.

## Frontend and Backend

The frontend provides the user interface for submitting research queries and viewing results.

The FastAPI backend handles API requests and connects them to the research pipeline and database.

## Traceability

A key part of the architecture is the connection between the final report and its supporting evidence.

The Report Linker ensures that important report findings can be traced back to the evidence and sources collected during the research process.
