import logging
import os
import shutil
import uuid
from typing import Tuple

from app.core.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self):
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    def save_file(self, content: bytes, original_filename: str) -> Tuple[str, str]:
        """Save bytes to disk. Returns (stored_filename, full_path)."""
        ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "bin"
        stored_name = f"{uuid.uuid4()}.{ext}"
        full_path = os.path.join(settings.UPLOAD_DIR, stored_name)
        with open(full_path, "wb") as f:
            f.write(content)
        logger.info(f"Saved file: {stored_name} ({len(content)} bytes)")
        return stored_name, full_path

    def delete_file(self, file_path: str) -> bool:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")
            return True
        return False

    def file_exists(self, file_path: str) -> bool:
        return os.path.exists(file_path)

    def get_file_size(self, file_path: str) -> int:
        return os.path.getsize(file_path) if os.path.exists(file_path) else 0