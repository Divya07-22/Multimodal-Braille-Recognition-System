from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class JobResponse(BaseModel):
    id: int
    document_id: int
    status: str
    job_type: str
    result_text: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    skip: int
    limit: int