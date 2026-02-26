import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.conversion_job import ConversionJob
from app.api.deps import get_current_user
from app.schemas.job import JobResponse, JobListResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=JobListResponse)
async def list_jobs(
    skip: int = 0,
    limit: int = 20,
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(ConversionJob).where(ConversionJob.user_id == current_user.id)
    count_query = select(func.count()).select_from(ConversionJob).where(
        ConversionJob.user_id == current_user.id
    )
    if status:
        query = query.where(ConversionJob.status == status)
        count_query = count_query.where(ConversionJob.status == status)

    total_result = await db.execute(count_query)
    total = total_result.scalar()
    result = await db.execute(
        query.offset(skip).limit(limit).order_by(ConversionJob.created_at.desc())
    )
    jobs = result.scalars().all()
    return JobListResponse(
        jobs=[
            JobResponse(
                id=j.id,
                document_id=j.document_id,
                status=j.status,
                job_type=j.job_type,
                result_text=j.result_text,
                error_message=j.error_message,
                created_at=j.created_at,
                completed_at=j.completed_at,
            )
            for j in jobs
        ],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConversionJob).where(
            ConversionJob.id == job_id,
            ConversionJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(
        id=job.id,
        document_id=job.document_id,
        status=job.status,
        job_type=job.job_type,
        result_text=job.result_text,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at,
    )


@router.delete("/{job_id}")
async def cancel_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConversionJob).where(
            ConversionJob.id == job_id,
            ConversionJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status in ("completed", "failed"):
        raise HTTPException(status_code=400, detail="Cannot cancel a finished job")
    job.status = "cancelled"
    await db.commit()
    return {"message": "Job cancelled"}