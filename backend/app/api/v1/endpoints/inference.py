import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.document import Document
from app.db.models.inference_result import InferenceResult
from app.api.deps import get_current_user
from app.services.inference_service import InferenceService
from app.schemas.inference import InferenceRequest, InferenceResponse, InferenceResultDetail

router = APIRouter()
logger = logging.getLogger(__name__)
inference_service = InferenceService()


@router.post("/run", response_model=InferenceResponse)
async def run_inference(
    payload: InferenceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(
            Document.id == payload.document_id,
            Document.user_id == current_user.id,
        )
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        inference_result = await inference_service.run_full_pipeline(
            image_path=document.file_path,
            use_onnx=payload.use_onnx,
        )
        db_result = InferenceResult(
            document_id=document.id,
            user_id=current_user.id,
            detected_cells=inference_result["detected_cells"],
            recognized_text=inference_result["text"],
            confidence_score=inference_result["confidence"],
            processing_time_ms=inference_result["processing_time_ms"],
            model_version=inference_result["model_version"],
        )
        db.add(db_result)
        await db.commit()
        await db.refresh(db_result)

        return InferenceResponse(
            inference_id=db_result.id,
            document_id=document.id,
            recognized_text=inference_result["text"],
            detected_cells=inference_result["detected_cells"],
            confidence_score=inference_result["confidence"],
            processing_time_ms=inference_result["processing_time_ms"],
            model_version=inference_result["model_version"],
        )
    except Exception as e:
        logger.error(f"Inference failed: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


@router.get("/{inference_id}", response_model=InferenceResultDetail)
async def get_inference_result(
    inference_id: int,
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
        raise HTTPException(status_code=404, detail="Inference result not found")
    return InferenceResultDetail(
        id=inf.id,
        document_id=inf.document_id,
        recognized_text=inf.recognized_text,
        detected_cells=inf.detected_cells,
        confidence_score=inf.confidence_score,
        processing_time_ms=inf.processing_time_ms,
        model_version=inf.model_version,
        created_at=inf.created_at,
    )