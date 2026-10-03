# FastAPI and project imports used for the research routes

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.core.auth import get_current_user
from backend.services.research_service import ResearchService


# 
from backend.repositories.research_job_repository import (ResearchJobRepository)
from backend.repositories.planner_task_repository import (PlannerTaskRepository)
from backend.repositories.source_repository import (SourceRepository)
from backend.repositories.evidence_repository import (EvidenceRepository)
from backend.repositories.validation_repository import (ValidationRepository)
from backend.repositories.report_repository import (ReportRepository)



# Router
router = APIRouter(prefix="/api/research",tags=["Research"])
logger = logging.getLogger(__name__)




class ResearchRequest(BaseModel):
    query: str
    target_market: str | None = None
    geography: str | None = None
    timeframe: str | None = None
    competitors: str | None = None
    deliverable_format: str = "Executive brief"
    report_depth: str = "Standard"
    source_preference: str = "Public sources and credible industry reports"
    use_case: str = "Internal review"


class ResearchResponse(BaseModel):
    job_id: str
    status: str
    title: str
    executive_summary: str
    warnings: list[str] = Field(default_factory=list)


def _ensure_owner(job: dict, user) -> None:
    """Ensures the authenticated user owns this job (when ownership is set)."""

    owner = job.get("created_by")

    if owner and owner != user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this research job.",
        )


def _build_research_brief(payload: ResearchRequest) -> str:
    """Formats the user request and scoping context into a single research brief."""

    query = (payload.query or "").strip()
    target_market = (payload.target_market or "").strip()
    geography = (payload.geography or "").strip()
    timeframe = (payload.timeframe or "").strip()
    competitors = (payload.competitors or "").strip()
    deliverable_format = (payload.deliverable_format or "Executive brief").strip()
    report_depth = (payload.report_depth or "Standard").strip()
    source_preference = (
        payload.source_preference or "Public sources and credible industry reports"
    ).strip()
    use_case = (payload.use_case or "Internal review").strip()

    if not query:
        raise ValueError("Research question cannot be empty.")

    if len(query.split()) < 8:
        raise ValueError(
            "Research question is too vague. Please provide a clearer objective with enough context."
        )

    if not target_market or not geography or not timeframe:
        raise ValueError(
            "Please provide the target market, geography, and timeframe before starting the research job."
        )

    parts = [
        query,
        f"Target market: {target_market}",
        f"Geography: {geography}",
        f"Timeframe: {timeframe}",
    ]

    if competitors:
        parts.append(f"Competitors / peer set: {competitors}")

    parts.extend(
        [
            f"Deliverable format: {deliverable_format}",
            f"Report depth: {report_depth}",
            f"Source preference: {source_preference}",
            f"Intended output use: {use_case}",
        ]
    )

    return "\n".join(parts)


research_job_repository = ResearchJobRepository()

planner_task_repository = PlannerTaskRepository()

source_repository = SourceRepository()

evidence_repository = EvidenceRepository()

validation_repository = ValidationRepository()

report_repository = ReportRepository()

research_service = ResearchService()





@router.get("/")
def list_research_jobs(user=Depends(get_current_user)):
    jobs = research_job_repository.list_jobs(created_by=user.id)

    return {
        "count": len(jobs),
        "jobs": jobs,
    }


@router.post("/",response_model=ResearchResponse)
def create_research(request: ResearchRequest,user=Depends(get_current_user)):
    try:
        research_brief = _build_research_brief(request)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e

    job_id = None
    try:
        job = research_job_repository.create_job(
            research_brief,
            created_by=user.id,
        )

        job_id = job["id"]

        # Mark job as researching

        research_job_repository.update_status(job_id, "researching",)

        print(f"Research job created: {job_id}")

        # Runing AI pipeline

        result = research_service.run_research(
            query=research_brief,
            job_id=job_id,
        )

        # Marking job completed

        research_job_repository.update_status(job_id,"completed",)

        print(f"Research job completed: {job_id}")

        # Return result

        return ResearchResponse(
            job_id=job_id,
            status="completed",
            title=result.report.title,
            executive_summary=(
                result.report.executive_summary
            ),
            warnings=result.warnings,
        )

    except Exception as e:

       
        # Mark job as fail
        try:

            if job_id:
                research_job_repository.update_status(
                    job_id,
                    "failed",
                )

        except Exception:
            logger.exception("Failed to mark research job %s as failed.", job_id)

        logger.exception("Research pipeline failed for job %s: %s", job_id, e)

        raise HTTPException(
            status_code=500,
            detail="Research pipeline failed.",
        )





# GET - Research Jov

@router.get("/{job_id}")
def get_research_job(
    job_id: str,
    user=Depends(get_current_user),
):

    job = research_job_repository.get_job(job_id)

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    _ensure_owner(job, user)

    return job




# GET - Research Taskd

@router.get("/{job_id}/tasks")
def get_research_tasks(
    job_id: str,
    user=Depends(get_current_user),
):

    job = research_job_repository.get_job(job_id)

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    _ensure_owner(job, user)

    tasks = planner_task_repository.get_tasks(
        job_id
    )

    return {
        "job_id": job_id,
        "count": len(tasks),
        "tasks": tasks,
    }




# GET - Research Sources

@router.get("/{job_id}/sources")

def get_research_sources(
    job_id: str,
    user=Depends(get_current_user),
):

    job = research_job_repository.get_job(job_id)

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    _ensure_owner(job, user)

    sources = source_repository.get_sources(
        job_id
    )

    return {
        "job_id": job_id,
        "count": len(sources),
        "sources": sources,
    }




# GET - research Evidence

@router.get("/{job_id}/evidence")
def get_research_evidence(
    job_id: str,
    user=Depends(get_current_user),
):

    job = research_job_repository.get_job(job_id)

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    _ensure_owner(job, user)

    evidence = evidence_repository.get_evidence(
        job_id
    )

    return {
        "job_id": job_id,
        "count": len(evidence),
        "evidence": evidence,
    }




# GET - Research Validations

@router.get("/{job_id}/validations")
def get_research_validations(
    job_id: str,
    user=Depends(get_current_user),
):

    job = research_job_repository.get_job(job_id)

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    _ensure_owner(job, user)

    evidence = evidence_repository.get_evidence(job_id)

    validations = []

    for item in evidence:

        item_validations = (
            validation_repository.get_validations(
                item["id"]
            )
        )

        validations.extend(
            item_validations
        )

    return {
        "job_id": job_id,
        "count": len(validations),
        "validations": validations,
    }




# GET - Final Research Report

@router.get("/{job_id}/report")
def get_research_report(
    job_id: str,
    user=Depends(get_current_user),
):

    job = research_job_repository.get_job(job_id)

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    _ensure_owner(job, user)
    # _ensure_owner(job)

    reports = report_repository.get_reports(
        job_id
    )

    if not reports:

        raise HTTPException(
            status_code=404,
            detail="Research report not found.",
        )

    return {
        "job_id": job_id,
        "report": reports[0],
    }