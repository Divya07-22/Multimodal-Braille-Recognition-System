import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.inference_result import InferenceResult
from app.db.models.document import Document
from app.api.deps import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def get_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_result = await db.execute(
        select(func.count()).select_from(InferenceResult).where(
            InferenceResult.user_id == current_user.id
        )
    )
    total = total_result.scalar()
    result = await db.execute(
        select(InferenceResult)
        .where(InferenceResult.user_id == current_user.id)
        .order_by(InferenceResult.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return {
        "history": [
            {
                "id": item.id,
                "document_id": item.document_id,
                "recognized_text": item.recognized_text,
                "confidence_score": item.confidence_score,
                "processing_time_ms": item.processing_time_ms,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_inferences = await db.execute(
        select(func.count()).select_from(InferenceResult).where(
            InferenceResult.user_id == current_user.id
        )
    )
    total_docs = await db.execute(
        select(func.count()).select_from(Document).where(
            Document.user_id == current_user.id
        )
    )
    avg_conf = await db.execute(
        select(func.avg(InferenceResult.confidence_score)).where(
            InferenceResult.user_id == current_user.id
        )
    )
    return {
        "total_inferences": total_inferences.scalar() or 0,
        "total_documents": total_docs.scalar() or 0,
        "average_confidence": round(float(avg_conf.scalar() or 0), 4),
    }