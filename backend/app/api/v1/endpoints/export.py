import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.inference_result import InferenceResult
from app.api.deps import get_current_user
from app.services.export_service import ExportService
from app.schemas.export import ExportRequest, ExportResponse

router = APIRouter()
logger = logging.getLogger(__name__)
export_service = ExportService()


@router.post("/", response_model=ExportResponse)
async def export_result(
    payload: ExportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InferenceResult).where(
            InferenceResult.id == payload.inference_id,
            InferenceResult.user_id == current_user.id,
        )
    )
    inf = result.scalar_one_or_none()
    if not inf:
        raise HTTPException(status_code=404, detail="Inference result not found")

    try:
        file_path = await export_service.export(
            text=inf.recognized_text,
            format=payload.format,
            filename=f"braille_result_{inf.id}",
        )
        return ExportResponse(
            file_path=file_path,
            format=payload.format,
            download_url=f"/api/v1/export/download/{inf.id}?format={payload.format}",
        )
    except Exception as e:
        logger.error(f"Export failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{inference_id}")
async def download_export(
    inference_id: int,
    format: str = "txt",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InferenceResult).where(
            InferenceResult.id == inference_id,
            InferenceResult.user_id == current_user.id,
        )
    )
    inf = result.scalar_one_or_none()
    if not inf:
        raise HTTPException(status_code=404, detail="Not found")

    file_path = await export_service.export(
        text=inf.recognized_text,
        format=format,
        filename=f"braille_result_{inf.id}",
    )
    return FileResponse(
        path=file_path,
        filename=f"braille_result_{inference_id}.{format}",
    )