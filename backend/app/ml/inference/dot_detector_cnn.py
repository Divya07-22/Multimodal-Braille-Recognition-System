import logging
import numpy as np
import torch
import torch.nn as nn
import os
import cv2
from typing import List, Tuple

logger = logging.getLogger(__name__)


class DotDetectorCNNModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.4),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(64, 6),
        )

    def forward(self, x):
        return self.classifier(self.features(x))


class DotDetectorInference:
    """Run dot presence detection per Braille cell using trained CNN."""

    def __init__(self, model_path: str = "app/ml/artifacts/dot_detector_best.pt"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DotDetectorCNNModel().to(self.device)
        if os.path.exists(model_path):
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            logger.info(f"Loaded dot detector from {model_path}")
        else:
            logger.warning(f"Dot detector weights not found at {model_path}")
        self.model.eval()

    def predict(self, cell_images: List[np.ndarray], threshold: float = 0.5) -> List[Tuple[int, List[bool]]]:
        if not cell_images:
            return []

        batch = []
        for img in cell_images:
            if len(img.shape) == 2:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            img = cv2.resize(img, (32, 32)).astype(np.float32) / 255.0
            img = (img - [0.5, 0.5, 0.5]) / [0.5, 0.5, 0.5]
            batch.append(img.transpose(2, 0, 1))

        tensor = torch.from_numpy(np.stack(batch)).float().to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.sigmoid(logits).cpu().numpy()

        results = []
        for prob_row in probs:
            dot_presence = [bool(p > threshold) for p in prob_row]
            pattern = sum(int(d) << i for i, d in enumerate(dot_presence))
            results.append((pattern, dot_presence))

        return results