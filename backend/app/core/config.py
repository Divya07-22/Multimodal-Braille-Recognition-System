import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Braille Conversion Tool"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/braille_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-must-be-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "bmp", "tiff", "pdf"]

    # ML Model Paths
    MODEL_ARTIFACTS_DIR: str = "./app/ml/artifacts"
    DETECTOR_MODEL_PATH: str = "./app/ml/artifacts/detector_best.pt"
    CLASSIFIER_MODEL_PATH: str = "./app/ml/artifacts/classifier_best.pt"
    DETECTOR_QUANTIZED_PATH: str = "./app/ml/artifacts/detector_quantized.pt"
    CLASSIFIER_QUANTIZED_PATH: str = "./app/ml/artifacts/classifier_quantized.pt"
    DETECTOR_ONNX_PATH: str = "./app/ml/artifacts/detector.onnx"
    CLASSIFIER_ONNX_PATH: str = "./app/ml/artifacts/classifier.onnx"

    # ML Hyperparameters
    DETECTOR_CONFIDENCE_THRESHOLD: float = 0.5
    CLASSIFIER_CONFIDENCE_THRESHOLD: float = 0.7
    IMAGE_SIZE: int = 640
    CELL_SIZE: int = 32
    DOT_GRID_ROWS: int = 3
    DOT_GRID_COLS: int = 2
    DOT_DETECTION_MIN_RADIUS: int = 2
    DOT_DETECTION_MAX_RADIUS: int = 15
    NUM_BRAILLE_CLASSES: int = 64

    # Tesseract
    TESSERACT_PATH: str = "/usr/bin/tesseract"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    ALLOWED_HOSTS: List[str] = ["*"]

    @field_validator("UPLOAD_DIR", "MODEL_ARTIFACTS_DIR", mode="before")
    @classmethod
    def create_dirs(cls, v):
        os.makedirs(v, exist_ok=True)
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()