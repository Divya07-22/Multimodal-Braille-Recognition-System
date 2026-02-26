from pydantic import BaseModel


class UploadResponse(BaseModel):
    document_id: int
    filename: str
    file_id: str
    size: int
    status: str
    message: str