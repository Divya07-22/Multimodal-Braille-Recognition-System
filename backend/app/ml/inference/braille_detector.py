import logging
import numpy as np
import torch
import cv2
from typing import List
from torchvision.models.detection import fasterrcnn_resnet50_fpn, FasterRCNN_ResNet50_FPN_Weights
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
import os

from app.core.config import settings

logger = logging.getLogger(__name__)


class BrailleDetector:
    """
    Detects Braille cells in a full page image using Faster R-CNN.
    Falls back to connected-component analysis if model not available.
    """

    def __init__(self, use_onnx: bool = False):
        self.use_onnx = use_onnx
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.onnx_session = None
        self._load_model()

    def _load_model(self):
        if self.use_onnx:
            try:
                from app.ml.inference.model_loader import load_onnx_detector
                self.onnx_session = load_onnx_detector()
                logger.info("Loaded ONNX Braille detector.")
            except Exception as e:
                logger.warning(f"ONNX detector not available: {e}. Using fallback.")
        else:
            try:
                model = fasterrcnn_resnet50_fpn(weights=None)
                in_features = model.roi_heads.box_predictor.cls_score.in_features
                model.roi_heads.box_predictor = FastRCNNPredictor(in_features, 2)
                path = settings.DETECTOR_MODEL_PATH
                if os.path.exists(path):
                    model.load_state_dict(torch.load(path, map_location=self.device))
                    logger.info(f"Loaded Faster R-CNN detector from {path}")
                else:
                    logger.warning("Detector weights missing, using fallback detection.")
                    self.model = None
                    return
                model.to(self.device).eval()
                self.model = model
            except Exception as e:
                logger.warning(f"Detector load failed: {e}. Using fallback.")
                self.model = None

    def detect(self, image: np.ndarray, confidence_threshold: float = None) -> List[np.ndarray]:
        threshold = confidence_threshold or settings.DETECTOR_CONFIDENCE_THRESHOLD

        if self.model is not None:
            return self._detect_pytorch(image, threshold)
        elif self.onnx_session is not None:
            return self._detect_onnx(image, threshold)
        else:
            return self._detect_fallback(image)

    def _detect_pytorch(self, image: np.ndarray, threshold: float) -> List[np.ndarray]:
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) if len(image.shape) == 3 else image
        tensor = torch.from_numpy(rgb).permute(2, 0, 1).float() / 255.0
        tensor = tensor.unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)

        boxes = outputs[0]["boxes"].cpu().numpy()
        scores = outputs[0]["scores"].cpu().numpy()
        mask = scores >= threshold
        return list(boxes[mask])

    def _detect_onnx(self, image: np.ndarray, threshold: float) -> List[np.ndarray]:
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        input_tensor = rgb.transpose(2, 0, 1).astype(np.float32) / 255.0
        input_tensor = np.expand_dims(input_tensor, 0)
        inp_name = self.onnx_session.get_inputs()[0].name
        outputs = self.onnx_session.run(None, {inp_name: input_tensor})
        boxes, scores = outputs[0][0], outputs[2][0]
        mask = scores >= threshold
        return list(boxes[mask])

    def _detect_fallback(self, image: np.ndarray) -> List[np.ndarray]:
        """
        Fallback: Connected component analysis on binarized image.
        Groups components into Braille cell-sized bounding boxes.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (settings.CELL_SIZE, settings.CELL_SIZE // 2))
        dilated = cv2.dilate(binary, kernel, iterations=1)

        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(dilated, connectivity=8)
        boxes = []
        min_area = (settings.CELL_SIZE ** 2) * 0.3
        for i in range(1, num_labels):
            x = stats[i, cv2.CC_STAT_LEFT]
            y = stats[i, cv2.CC_STAT_TOP]
            w = stats[i, cv2.CC_STAT_WIDTH]
            h = stats[i, cv2.CC_STAT_HEIGHT]
            area = stats[i, cv2.CC_STAT_AREA]
            if area >= min_area:
                boxes.append(np.array([x, y, x + w, y + h, 1.0]))

        boxes.sort(key=lambda b: (b[1] // (settings.CELL_SIZE * 2), b[0]))
        return boxes