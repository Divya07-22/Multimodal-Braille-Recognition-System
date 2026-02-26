import re
from typing import Optional

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB
MIN_IMAGE_DIMENSION = 32
MAX_IMAGE_DIMENSION = 8000

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\-]+\.[a-z]{2,}$", re.IGNORECASE)
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]{3,32}$")


def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email))


def validate_username(username: str) -> bool:
    return bool(USERNAME_REGEX.match(username))


def validate_password(password: str) -> tuple[bool, Optional[str]]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, None


def validate_file_size(size_bytes: int) -> tuple[bool, Optional[str]]:
    if size_bytes <= 0:
        return False, "File is empty"
    if size_bytes > MAX_FILE_SIZE_BYTES:
        return False, f"File exceeds max size of {MAX_FILE_SIZE_BYTES // (1024*1024)} MB"
    return True, None


def validate_image_dimensions(
    width: int,
    height: int,
) -> tuple[bool, Optional[str]]:
    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        return False, f"Image too small. Min dimension: {MIN_IMAGE_DIMENSION}px"
    if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
        return False, f"Image too large. Max dimension: {MAX_IMAGE_DIMENSION}px"
    return True, None


def validate_mime_type(mime_type: str) -> tuple[bool, Optional[str]]:
    allowed = {
        "image/jpeg", "image/png", "image/tiff",
        "image/bmp", "image/webp", "application/pdf",
    }
    if mime_type not in allowed:
        return False, f"Unsupported file type: {mime_type}. Allowed: {allowed}"
    return True, None


def validate_export_format(fmt: str) -> tuple[bool, Optional[str]]:
    allowed = {"txt", "pdf", "docx", "json"}
    if fmt not in allowed:
        return False, f"Invalid format: {fmt}. Allowed: {allowed}"
    return True, None


def validate_braille_grade(grade: int) -> tuple[bool, Optional[str]]:
    if grade not in (1, 2):
        return False, "Braille grade must be 1 or 2"
    return True, None


def validate_pagination(skip: int, limit: int) -> tuple[bool, Optional[str]]:
    if skip < 0:
        return False, "skip must be >= 0"
    if limit < 1 or limit > 100:
        return False, "limit must be between 1 and 100"
    return True, None