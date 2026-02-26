from pydantic import BaseModel, field_validator


class ExportRequest(BaseModel):
    inference_id: int
    format: str = "txt"

    @field_validator("format")
    @classmethod
    def validate_format(cls, v: str) -> str:
        allowed = {"txt", "pdf", "docx", "json"}
        if v not in allowed:
            raise ValueError(f"Format must be one of {allowed}")
        return v


class ExportResponse(BaseModel):
    file_path: str
    format: str
    download_url: str