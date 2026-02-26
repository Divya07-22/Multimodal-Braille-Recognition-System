import logging
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models.inference_result import InferenceResult
from app.db.models.document import Document
from app.db.models.conversion_job import ConversionJob

logger = logging.getLogger(__name__)


class AnalyticsService:
    async def get_platform_stats(self, db: AsyncSession) -> Dict[str, Any]:
        total_docs = await db.execute(select(func.count()).select_from(Document))
        total_jobs = await db.execute(select(func.count()).select_from(ConversionJob))
        total_inf = await db.execute(select(func.count()).select_from(InferenceResult))
        avg_conf = await db.execute(select(func.avg(InferenceResult.confidence_score)))
        avg_time = await db.execute(select(func.avg(InferenceResult.processing_time_ms)))

        return {
            "total_documents": total_docs.scalar() or 0,
            "total_jobs": total_jobs.scalar() or 0,
            "total_inferences": total_inf.scalar() or 0,
            "average_confidence": round(float(avg_conf.scalar() or 0), 4),
            "average_processing_time_ms": round(float(avg_time.scalar() or 0), 2),
        }

    async def get_user_stats(self, db: AsyncSession, user_id: int) -> Dict[str, Any]:
        total_docs = await db.execute(
            select(func.count()).select_from(Document).where(Document.user_id == user_id)
        )
        total_inf = await db.execute(
            select(func.count()).select_from(InferenceResult).where(
                InferenceResult.user_id == user_id
            )
        )
        avg_conf = await db.execute(
            select(func.avg(InferenceResult.confidence_score)).where(
                InferenceResult.user_id == user_id
            )
        )
        return {
            "total_documents": total_docs.scalar() or 0,
            "total_inferences": total_inf.scalar() or 0,
            "average_confidence": round(float(avg_conf.scalar() or 0), 4),
        }