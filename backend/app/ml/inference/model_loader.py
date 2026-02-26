import os
import logging
import torch
import onnxruntime as ort
from torchvision import models
import torch.nn as nn
from app.core.config import settings

logger = logging.getLogger(__name__)

_cached_models = {}


def _build_classifier_arch(num_classes: int = 64) -> nn.Module:
    model = models.resnet18(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes),
    )
    return model


def load_pytorch_classifier(device: torch.device = None) -> nn.Module:
    global _cached_models
    if "classifier_pt" in _cached_models:
        return _cached_models["classifier_pt"]

    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = _build_classifier_arch(num_classes=settings.NUM_BRAILLE_CLASSES)
    path = settings.CLASSIFIER_MODEL_PATH
    if os.path.exists(path):
        state = torch.load(path, map_location=device)
        model.load_state_dict(state)
        logger.info(f"Loaded classifier from {path}")
    else:
        logger.warning(f"Classifier weights not found at {path}, using random weights.")

    model.to(device).eval()
    _cached_models["classifier_pt"] = model
    return model


def load_onnx_classifier() -> ort.InferenceSession:
    global _cached_models
    if "classifier_onnx" in _cached_models:
        return _cached_models["classifier_onnx"]

    providers = (
        ["CUDAExecutionProvider", "CPUExecutionProvider"]
        if ort.get_device() == "GPU"
        else ["CPUExecutionProvider"]
    )
    path = settings.CLASSIFIER_ONNX_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"ONNX classifier not found: {path}")

    session = ort.InferenceSession(path, providers=providers)
    _cached_models["classifier_onnx"] = session
    logger.info(f"Loaded ONNX classifier from {path}")
    return session


def load_onnx_detector() -> ort.InferenceSession:
    global _cached_models
    if "detector_onnx" in _cached_models:
        return _cached_models["detector_onnx"]

    providers = (
        ["CUDAExecutionProvider", "CPUExecutionProvider"]
        if ort.get_device() == "GPU"
        else ["CPUExecutionProvider"]
    )
    path = settings.DETECTOR_ONNX_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"ONNX detector not found: {path}")

    session = ort.InferenceSession(path, providers=providers)
    _cached_models["detector_onnx"] = session
    logger.info(f"Loaded ONNX detector from {path}")
    return session


def clear_model_cache():
    global _cached_models
    _cached_models.clear()
    logger.info("Model cache cleared.")