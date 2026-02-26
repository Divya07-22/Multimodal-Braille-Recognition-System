from typing import Any, Dict, List
from pydantic import BaseModel


class RecognitionResponse(BaseModel):
    recognized_text: str
    braille_cells: List[Dict[str, Any]]
    confidence: float
    cell_count: int