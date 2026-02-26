import datetime
import logging
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models.conversion_job import ConversionJob

logger = logging.getLogger(__name__)


class JobService:
    async def get_by_id(
        self, db: AsyncSession, job_id: int, user_id: int
    ) -> Optional[ConversionJob]:
        result = await db.execute(
            select(ConversionJob).where(
                ConversionJob.id == job_id,
                ConversionJob.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
    ) -> Tuple[List[ConversionJob], int]:
        query = select(ConversionJob).where(ConversionJob.user_id == user_id)
        count_q = select(func.count()).select_from(ConversionJob).where(
            ConversionJob.user_id == user_id
        )
        if status:
            query = query.where(ConversionJob.status == status)
            count_q = count_q.where(ConversionJob.status == status)
        total_r = await db.execute(count_q)
        total = total_r.scalar()
        result = await db.execute(
            query.offset(skip).limit(limit).order_by(ConversionJob.created_at.desc())
        )
        return result.scalars().all(), total

    async def update_status(
        self,
        db: AsyncSession,
        job_id: int,
        status: str,
        result_text: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> Optional[ConversionJob]:
        result = await db.execute(
            select(ConversionJob).where(ConversionJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        if job:
            job.status = status
            if result_text is not None:
                job.result_text = result_text
            if error_message is not None:
                job.error_message = error_message
            if status in ("completed", "failed", "cancelled"):
                job.completed_at = datetime.datetime.utcnow()
            await db.commit()
            await db.refresh(job)
        return job