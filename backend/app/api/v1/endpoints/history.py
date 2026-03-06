import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.conversion_history import ConversionHistoryItem
from app.db.models.document import Document
from app.api.deps import get_current_user

from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)


class HistoryItemCreate(BaseModel):
    conversion_type: str
    input_text: str | None = None
    output_text: str | None = None
    braille_output: str | None = None
    document_id: int | None = None
    processing_time_ms: float | None = None


# ────────────────────────────────────────────────────────────────────────────
# IMPORTANT: Fixed routes (/stats, /clear) MUST be registered BEFORE the
# parameterised route (/{item_id}) otherwise FastAPI tries to cast the fixed
# path segments "stats" / "clear" as integers and returns 422.
# ────────────────────────────────────────────────────────────────────────────


@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return aggregate stats for the current user."""
    total_conversions = await db.execute(
        select(func.count()).select_from(ConversionHistoryItem).where(
            ConversionHistoryItem.user_id == current_user.id
        )
    )
    total_docs = await db.execute(
        select(func.count()).select_from(Document).where(
            Document.user_id == current_user.id
        )
    )
    avg_time = await db.execute(
        select(func.avg(ConversionHistoryItem.processing_time_ms)).where(
            ConversionHistoryItem.user_id == current_user.id
        )
    )
    return {
        "total_conversions": total_conversions.scalar() or 0,
        "total_documents": total_docs.scalar() or 0,
        "average_processing_time_ms": round(float(avg_time.scalar() or 0), 4),
    }


@router.post("/")
async def create_history_item(
    payload: HistoryItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = ConversionHistoryItem(
        user_id=current_user.id,
        conversion_type=payload.conversion_type,
        input_text=payload.input_text,
        output_text=payload.output_text,
        braille_output=payload.braille_output,
        document_id=payload.document_id,
        processing_time_ms=payload.processing_time_ms,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)  # FIX: ensure item.id is populated after commit
    return {"message": "History saved", "id": item.id}


@router.get("/")
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    skip = (page - 1) * limit
    total_result = await db.execute(
        select(func.count()).select_from(ConversionHistoryItem).where(
            ConversionHistoryItem.user_id == current_user.id
        )
    )
    total = total_result.scalar()

    result = await db.execute(
        select(ConversionHistoryItem)
        .where(ConversionHistoryItem.user_id == current_user.id)
        .order_by(ConversionHistoryItem.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    db_items = result.scalars().all()

    items = []
    for item in db_items:
        items.append({
            "id": item.id,
            "document_id": item.document_id,
            "conversion_type": item.conversion_type,
            "input_text": item.input_text,
            "output_text": item.output_text,
            "braille_output": item.braille_output,
            "processing_time": item.processing_time_ms,
            "is_favorite": item.is_favorite,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
    }


# FIX: /clear must be registered BEFORE /{item_id} so it is not swallowed by
# the path-param route. "clear" is not a valid integer → previously 422.
@router.delete("/clear")
async def clear_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConversionHistoryItem).where(ConversionHistoryItem.user_id == current_user.id)
    )
    items = result.scalars().all()
    for item in items:
        await db.delete(item)
    await db.commit()
    return {"message": "History cleared"}


@router.patch("/{item_id}/favorite")
async def toggle_favorite(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConversionHistoryItem).where(
            ConversionHistoryItem.id == item_id,
            ConversionHistoryItem.user_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.is_favorite = not item.is_favorite
    await db.commit()
    return {"message": "Favorite status updated", "is_favorite": item.is_favorite}


@router.delete("/{item_id}")
async def delete_history_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ConversionHistoryItem).where(
            ConversionHistoryItem.id == item_id,
            ConversionHistoryItem.user_id == current_user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    await db.commit()
    return {"message": "Item deleted"}