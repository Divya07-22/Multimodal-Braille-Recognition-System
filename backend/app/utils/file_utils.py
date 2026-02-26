import hashlib
import logging
import mimetypes
import os
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Tuple

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/tiff",
    "image/bmp", "image/webp", "application/pdf",
}

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".tiff", ".tif",
    ".bmp", ".webp", ".pdf",
}


def generate_file_id() -> str:
    """Generate a unique file ID."""
    return str(uuid.uuid4())


def get_extension(filename: str) -> str:
    """Get lowercase file extension."""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return get_extension(filename) in ALLOWED_EXTENSIONS


def get_mime_type(filename: str) -> str:
    """Guess MIME type from filename."""
    mime, _ = mimetypes.guess_type(filename)
    return mime or "application/octet-stream"


def is_allowed_mime(mime_type: str) -> bool:
    """Check MIME type is in allowed set."""
    return mime_type in ALLOWED_MIME_TYPES


def compute_md5(content: bytes) -> str:
    """Compute MD5 hash of file content."""
    return hashlib.md5(content).hexdigest()


def compute_sha256(content: bytes) -> str:
    """Compute SHA-256 hash of file content."""
    return hashlib.sha256(content).hexdigest()


def safe_filename(filename: str) -> str:
    """Sanitize filename to remove unsafe characters."""
    name = Path(filename).name
    safe = "".join(
        c if (c.isalnum() or c in "._-") else "_"
        for c in name
    )
    return safe or "uploaded_file"


def build_upload_path(upload_dir: str, file_id: str, filename: str) -> str:
    """Build full path for uploaded file."""
    ext = get_extension(filename)
    return os.path.join(upload_dir, f"{file_id}{ext}")


def ensure_dir(path: str) -> None:
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)


def delete_file(path: str) -> bool:
    """Delete a file safely. Returns True if deleted."""
    try:
        if os.path.exists(path):
            os.remove(path)
            logger.debug(f"Deleted: {path}")
            return True
        return False
    except OSError as e:
        logger.error(f"Failed to delete {path}: {e}")
        return False


def get_file_size(path: str) -> int:
    """Get file size in bytes."""
    return os.path.getsize(path) if os.path.exists(path) else 0


def list_files(
    directory: str,
    extensions: Optional[List[str]] = None,
) -> List[str]:
    """List files in a directory filtered by extension."""
    if not os.path.isdir(directory):
        return []
    files = []
    for f in os.listdir(directory):
        full = os.path.join(directory, f)
        if os.path.isfile(full):
            if extensions is None or get_extension(f) in extensions:
                files.append(full)
    return sorted(files)


def copy_file(src: str, dst: str) -> bool:
    """Copy file from src to dst."""
    try:
        ensure_dir(os.path.dirname(dst))
        shutil.copy2(src, dst)
        return True
    except OSError as e:
        logger.error(f"Copy failed {src} -> {dst}: {e}")
        return False


def read_bytes(path: str) -> bytes:
    """Read file as bytes."""
    with open(path, "rb") as f:
        return f.read()


def write_bytes(path: str, content: bytes) -> None:
    """Write bytes to file."""
    ensure_dir(os.path.dirname(path))
    with open(path, "wb") as f:
        f.write(content)


def get_file_info(path: str) -> dict:
    """Get metadata about a file."""
    p = Path(path)
    if not p.exists():
        return {}
    stat = p.stat()
    return {
        "name": p.name,
        "extension": p.suffix.lower(),
        "size_bytes": stat.st_size,
        "mime_type": get_mime_type(p.name),
        "absolute_path": str(p.resolve()),
    }