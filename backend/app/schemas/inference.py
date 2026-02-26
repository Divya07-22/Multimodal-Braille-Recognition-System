from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class InferenceRequest(BaseModel):
    document_id: int
    use_onnx: bool = True


class InferenceResponse(BaseModel):
    inference_id: int
    document_id: int
    recognized_text: str
    detected_cells: int
    confidence_score: float
    processing_time_ms: float
    model_version: str


class InferenceResultDetail(BaseModel):
    id: int
    document_id: int
    recognized_text: Optional[str]
    detected_cells: int
    confidence_score: float
    processing_time_ms: float
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True