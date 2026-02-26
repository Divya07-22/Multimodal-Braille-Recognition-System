import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import BrailleBaseException
from app.api.v1.router import api_router
from app.db.session import engine
from app.db.base import Base

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Braille Conversion Tool API")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"ML Artifacts Dir: {settings.MODEL_ARTIFACTS_DIR}")
    yield
    logger.info("Shutting down Braille Conversion Tool API")
    await engine.dispose()


app = FastAPI(
    title="Braille Conversion Tool API",
    description=(
        "AI-powered Braille to Text conversion system "
        "using real CNN-based ML models with ONNX inference."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)


@app.exception_handler(BrailleBaseException)
async def braille_exception_handler(request, exc: BrailleBaseException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": exc.error_code,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_code": "INTERNAL_ERROR",
        },
    )


app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def root_health():
    return {"status": "healthy", "version": "1.0.0"}