import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "BrailleConversionTool"
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 2
    RELOAD: bool = True

    # Database
    DATABASE_URL: str = "mysql+aiomysql://braille_user:divdev123@localhost:3306/braille_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: int = 30

    # MySQL
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "braille_db"
    MYSQL_USER: str = "braille_user"
    MYSQL_PASSWORD: str = "divdev123"
    MYSQL_ROOT_PASSWORD: str = "divdev123"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # JWT
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    CELERY_CONCURRENCY: int = 4

    # File Upload
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "outputs"
    MAX_UPLOAD_SIZE_MB: int = 20
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "tiff", "tif", "bmp", "webp", "pdf"]

    # ML Model Paths
    MODEL_DIR: str = "app/ml/artifacts"
    MODEL_ARTIFACTS_DIR: str = "./app/ml/artifacts"
    DETECTOR_MODEL_PATH: str = "./app/ml/artifacts/detector_best.pt"
    CLASSIFIER_MODEL_PATH: str = "./app/ml/artifacts/classifier_best.pt"
    DETECTOR_QUANTIZED_PATH: str = "./app/ml/artifacts/detector_quantized.pt"
    CLASSIFIER_QUANTIZED_PATH: str = "./app/ml/artifacts/classifier_quantized.pt"
    DETECTOR_ONNX_PATH: str = "./app/ml/artifacts/detector.onnx"
    CLASSIFIER_ONNX_PATH: str = "./app/ml/artifacts/classifier.onnx"
    DOT_DETECTOR_WEIGHTS: str = "./app/ml/artifacts/detector_best.pt"
    CELL_CLASSIFIER_WEIGHTS: str = "./app/ml/artifacts/classifier_best.pt"

    # ML Hyperparameters
    DETECTOR_CONFIDENCE_THRESHOLD: float = 0.5
    CLASSIFIER_CONFIDENCE_THRESHOLD: float = 0.7
    CONFIDENCE_THRESHOLD: float = 0.5
    IMAGE_SIZE: int = 512
    CELL_SIZE: int = 32
    DOT_GRID_ROWS: int = 3
    DOT_GRID_COLS: int = 2
    DOT_DETECTION_MIN_RADIUS: int = 2
    DOT_DETECTION_MAX_RADIUS: int = 15
    NUM_BRAILLE_CLASSES: int = 64
    DEVICE: str = "cpu"

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
        extra = "allow"


settings = Settings()