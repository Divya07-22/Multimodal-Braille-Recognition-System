"""
Lightweight MobileNetV3 cell classifier for fast edge inference.
"""
import logging
import numpy as np
import torch
import torch.nn as nn
from torchvision import models
import os
import cv2
from typing import List, Dict, Any

from app.ml.inference.postprocess import PATTERN_TO_CHAR

logger = logging.getLogger(__name__)

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def build_mobilenet_classifier(num_classes: int = 64) -> nn.Module:
    model = models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


class CellClassifierCNN:
    """MobileNetV3 based braille cell classifier for fast inference."""

    def __init__(
        self,
        model_path: str = "app/ml/artifacts/cell_classifier_best.pt",
        num_classes: int = 64,
        cell_size: int = 32,
    ):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.cell_size = cell_size
        self.model = build_mobilenet_classifier(num_classes).to(self.device)
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            logger.info(f"Loaded CellClassifierCNN from {model_path}")
        else:
            logger.warning(f"Cell classifier weights not found at {model_path}")
        self.model.eval()

    def preprocess(self, images: List[np.ndarray]) -> np.ndarray:
        batch = []
        for img in images:
            if len(img.shape) == 2:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            else:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (self.cell_size, self.cell_size))
            img = img.astype(np.float32) / 255.0
            img = (img - MEAN) / STD
            batch.append(img.transpose(2, 0, 1))
        return np.stack(batch)

    def predict(self, images: List[np.ndarray]) -> List[Dict[str, Any]]:
        if not images:
            return []
        batch = self.preprocess(images)
        tensor = torch.from_numpy(batch).float().to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=-1).cpu().numpy()

        results = []
        for prob in probs:
            pattern = int(np.argmax(prob))
            results.append({
                "pattern": pattern,
                "confidence": float(prob[pattern]),
                "character": PATTERN_TO_CHAR.get(pattern, "?"),
            })
        return results