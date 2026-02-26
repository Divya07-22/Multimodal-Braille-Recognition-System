import base64
import hashlib
import json
import logging
import os
import platform
import random
import re
import secrets
import string
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# ID / Token Generators
# ---------------------------------------------------------------------------

def generate_uuid() -> str:
    return str(uuid.uuid4())


def generate_short_id(length: int = 8) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_secure_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)


def generate_job_id() -> str:
    ts = int(time.time() * 1000)
    rand = generate_short_id(6)
    return f"job_{ts}_{rand}"


def generate_file_id() -> str:
    return f"file_{uuid.uuid4().hex}"


# ---------------------------------------------------------------------------
# Timestamp Helpers
# ---------------------------------------------------------------------------

def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def utcnow_iso() -> str:
    return utcnow().isoformat()


def timestamp_ms() -> int:
    return int(time.time() * 1000)


def elapsed_ms(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 3)


def format_duration(ms: float) -> str:
    if ms < 1000:
        return f"{ms:.1f} ms"
    elif ms < 60_000:
        return f"{ms / 1000:.2f} s"
    else:
        minutes = int(ms // 60_000)
        seconds = (ms % 60_000) / 1000
        return f"{minutes}m {seconds:.1f}s"


# ---------------------------------------------------------------------------
# Hashing
# ---------------------------------------------------------------------------

def md5_hash(data: Union[str, bytes]) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.md5(data).hexdigest()


def sha256_hash(data: Union[str, bytes]) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def sha1_hash(data: Union[str, bytes]) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha1(data).hexdigest()


# ---------------------------------------------------------------------------
# Encoding / Decoding
# ---------------------------------------------------------------------------

def encode_base64(data: Union[str, bytes]) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return base64.b64encode(data).decode("utf-8")


def decode_base64(data: str) -> bytes:
    return base64.b64decode(data.encode("utf-8"))


def encode_base64_url(data: Union[str, bytes]) -> str:
    if isinstance(data, str):
        data = data.encode("utf-8")
    return base64.urlsafe_b64encode(data).decode("utf-8")


def decode_base64_url(data: str) -> bytes:
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def bytes_to_base64_image(content: bytes, mime: str = "image/png") -> str:
    b64 = encode_base64(content)
    return f"data:{mime};base64,{b64}"


# ---------------------------------------------------------------------------
# Dict / JSON Helpers
# ---------------------------------------------------------------------------

def flatten_dict(
    d: Dict[str, Any],
    parent_key: str = "",
    sep: str = ".",
) -> Dict[str, Any]:
    items: List[Tuple[str, Any]] = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def deep_merge(base: Dict, override: Dict) -> Dict:
    result = base.copy()
    for k, v in override.items():
        if k in result and isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = deep_merge(result[k], v)
        else:
            result[k] = v
    return result


def safe_json_dumps(obj: Any, indent: int = 2) -> str:
    def default(o: Any) -> Any:
        if isinstance(o, np.integer):
            return int(o)
        if isinstance(o, np.floating):
            return float(o)
        if isinstance(o, np.ndarray):
            return o.tolist()
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, bytes):
            return encode_base64(o)
        return str(o)
    return json.dumps(obj, indent=indent, default=default)


def safe_json_loads(text: str) -> Optional[Any]:
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError) as e:
        logger.warning(f"JSON parse failed: {e}")
        return None


def filter_none(d: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in d.items() if v is not None}


def pick_keys(d: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    return {k: d[k] for k in keys if k in d}


def omit_keys(d: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    return {k: v for k, v in d.items() if k not in keys}


# ---------------------------------------------------------------------------
# List Helpers
# ---------------------------------------------------------------------------

def chunk_list(lst: List[Any], size: int) -> List[List[Any]]:
    return [lst[i:i + size] for i in range(0, len(lst), size)]


def flatten_list(nested: List[List[Any]]) -> List[Any]:
    return [item for sublist in nested for item in sublist]


def deduplicate(lst: List[Any]) -> List[Any]:
    seen = set()
    result = []
    for item in lst:
        key = str(item)
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result


def safe_index(lst: List[Any], idx: int, default: Any = None) -> Any:
    try:
        return lst[idx]
    except IndexError:
        return default


def moving_average(values: List[float], window: int = 5) -> List[float]:
    result = []
    for i in range(len(values)):
        start = max(0, i - window + 1)
        result.append(float(np.mean(values[start:i + 1])))
    return result


# ---------------------------------------------------------------------------
# String Helpers
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


def truncate(text: str, max_len: int = 100, suffix: str = "...") -> str:
    if len(text) <= max_len:
        return text
    return text[:max_len - len(suffix)] + suffix


def camel_to_snake(name: str) -> str:
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


def snake_to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def mask_email(email: str) -> str:
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    masked = local[0] + "***" if len(local) > 1 else "***"
    return f"{masked}@{domain}"


def mask_token(token: str, visible: int = 6) -> str:
    if len(token) <= visible:
        return "***"
    return token[:visible] + "***"


# ---------------------------------------------------------------------------
# Math / Numeric Helpers
# ---------------------------------------------------------------------------

def clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(max_val, value))


def round_to(value: float, decimals: int = 4) -> float:
    return round(value, decimals)


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    if denominator == 0:
        return default
    return numerator / denominator


def percentage(part: float, total: float) -> float:
    return round(safe_divide(part, total) * 100, 2)


def normalize_scores(scores: List[float]) -> List[float]:
    arr = np.array(scores, dtype=np.float32)
    mn, mx = arr.min(), arr.max()
    if mx == mn:
        return [0.0] * len(scores)
    return ((arr - mn) / (mx - mn)).tolist()


# ---------------------------------------------------------------------------
# System / Environment Helpers
# ---------------------------------------------------------------------------

def get_system_info() -> Dict[str, Any]:
    return {
        "os":             platform.system(),
        "os_version":     platform.version(),
        "python_version": platform.python_version(),
        "cpu_count":      os.cpu_count(),
        "machine":        platform.machine(),
        "processor":      platform.processor(),
    }


def is_gpu_available() -> bool:
    try:
        import torch
        return torch.cuda.is_available()
    except ImportError:
        return False


def get_torch_device() -> str:
    return "cuda" if is_gpu_available() else "cpu"


def get_env(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


def set_random_seed(seed: int = 42) -> None:
    random.seed(seed)
    np.random.seed(seed)
    try:
        import torch
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
    except ImportError:
        pass
    logger.debug(f"Random seed set to {seed}")


# ---------------------------------------------------------------------------
# Retry Helper
# ---------------------------------------------------------------------------

def retry(
    func,
    retries: int = 3,
    delay: float = 1.0,
    exceptions: Tuple = (Exception,),
):
    last_exc = None
    for attempt in range(1, retries + 1):
        try:
            return func()
        except exceptions as e:
            last_exc = e
            logger.warning(f"Retry {attempt}/{retries} failed: {e}")
            if attempt < retries:
                time.sleep(delay)
    raise last_exc


# ---------------------------------------------------------------------------
# Batch Processing Helper
# ---------------------------------------------------------------------------

def batch_process(
    items: List[Any],
    processor,
    batch_size: int = 32,
) -> List[Any]:
    results = []
    for chunk in chunk_list(items, batch_size):
        batch_result = processor(chunk)
        results.extend(batch_result)
    return results