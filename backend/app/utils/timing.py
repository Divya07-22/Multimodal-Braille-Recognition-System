import functools
import logging
import time
from contextlib import contextmanager
from typing import Any, Callable, Generator

logger = logging.getLogger(__name__)


@contextmanager
def timer(label: str = "Block") -> Generator[None, None, None]:
    """Context manager to time a code block."""
    t0 = time.perf_counter()
    try:
        yield
    finally:
        elapsed = (time.perf_counter() - t0) * 1000
        logger.debug(f"[TIMER] {label}: {elapsed:.2f} ms")


def timeit(func: Callable) -> Callable:
    """Decorator to log execution time of a function."""
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        t0 = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = (time.perf_counter() - t0) * 1000
        logger.debug(f"[TIMEIT] {func.__qualname__}: {elapsed:.2f} ms")
        return result
    return wrapper


def async_timeit(func: Callable) -> Callable:
    """Decorator to log execution time of an async function."""
    @functools.wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        t0 = time.perf_counter()
        result = await func(*args, **kwargs)
        elapsed = (time.perf_counter() - t0) * 1000
        logger.debug(f"[ASYNC TIMEIT] {func.__qualname__}: {elapsed:.2f} ms")
        return result
    return wrapper