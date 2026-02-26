from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    braille,
    documents,
    export,
    health,
    history,
    inference,
    jobs,
    ocr,
    recognition,
    upload,
    users,
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(braille.router, prefix="/braille", tags=["Braille"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
api_router.include_router(inference.router, prefix="/inference", tags=["Inference"])
api_router.include_router(recognition.router, prefix="/recognition", tags=["Recognition"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(history.router, prefix="/history", tags=["History"])