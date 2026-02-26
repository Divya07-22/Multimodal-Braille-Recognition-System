import logging
import numpy as np
import torch
import torch.nn.functional as F
import cv2
from typing import List, Dict, Any
import os

from app.ml.inference.model_loader import load_pytorch_classifier, load_onnx_classifier
from app.ml.preprocessing.resize import resize_cell
from app.core.config import settings
from app.ml.inference.postprocess import PATTERN_TO_CHAR

logger = logging.getLogger(__name__)

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


class BrailleClassifier:
    """Classify Braille cell crops into 64 dot patterns."""

    def __init__(self, use_onnx: bool = False):
        self.use_onnx = use_onnx
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.onnx_session = None
        self._load()

    def _load(self):
        if self.use_onnx:
            try:
                self.onnx_session = load_onnx_classifier()
            except Exception as e:
                logger.warning(f"ONNX classifier not available: {e}, falling back to PyTorch.")
                self.model = load_pytorch_classifier(self.device)
        else:
            self.model = load_pytorch_classifier(self.device)

    def _preprocess(self, cell_images: List[np.ndarray]) -> np.ndarray:
        batch = []
        for img in cell_images:
            if len(img.shape) == 2:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            elif img.shape[2] == 4:
                img = cv2.cvtColor(img, cv2.COLOR_BGRA2RGB)
            else:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = resize_cell(img, settings.CELL_SIZE)
            img = img.astype(np.float32) / 255.0
            img = (img - MEAN) / STD
            batch.append(img.transpose(2, 0, 1))
        return np.stack(batch, axis=0)

    def classify_batch(self, cell_images: List[np.ndarray]) -> List[Dict[str, Any]]:
        if not cell_images:
            return []

        batch_np = self._preprocess(cell_images)
        results = []

        if self.onnx_session is not None:
            inp_name = self.onnx_session.get_inputs()[0].name
            logits = self.onnx_session.run(None, {inp_name: batch_np})[0]
            probs = self._softmax(logits)
        else:
            tensor = torch.from_numpy(batch_np).to(self.device)
            with torch.no_grad():
                logits = self.model(tensor)
                probs = F.softmax(logits, dim=-1).cpu().numpy()

        for prob_row in probs:
            pattern = int(np.argmax(prob_row))
            confidence = float(prob_row[pattern])
            character = PATTERN_TO_CHAR.get(pattern, "?")
            results.append({
                "pattern": pattern,
                "confidence": confidence,
                "character": character,
                "probabilities": prob_row.tolist(),
            })

        return results

    @staticmethod
    def _softmax(x: np.ndarray) -> np.ndarray:
        e = np.exp(x - x.max(axis=-1, keepdims=True))
        return e / e.sum(axis=-1, keepdims=True)