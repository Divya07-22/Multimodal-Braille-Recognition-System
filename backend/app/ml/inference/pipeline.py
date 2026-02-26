import time
import logging
import numpy as np
import cv2
import torch
from typing import Dict, Any, List
from PIL import Image

from app.ml.preprocessing.binarize import binarize_image
from app.ml.preprocessing.denoise import denoise_image, enhance_contrast
from app.ml.preprocessing.perspective import correct_perspective
from app.ml.preprocessing.resize import resize_image, resize_cell
from app.ml.inference.braille_detector import BrailleDetector
from app.ml.inference.braille_classifier import BrailleClassifier
from app.ml.inference.postprocess import PostProcessor
from app.ml.nlp.nlp_postprocess import NLPPostProcessor
from app.core.config import settings

logger = logging.getLogger(__name__)


class BraillePipeline:
    """
    End-to-end Braille recognition pipeline:
    Image -> Preprocess -> Detect Cells -> Classify Cells -> Decode -> NLP Postprocess
    """

    def __init__(self, use_onnx: bool = False):
        self.use_onnx = use_onnx
        self.detector = BrailleDetector(use_onnx=use_onnx)
        self.classifier = BrailleClassifier(use_onnx=use_onnx)
        self.postprocessor = PostProcessor()
        self.nlp = NLPPostProcessor()
        logger.info(f"BraillePipeline initialized (ONNX={use_onnx})")

    def run(self, image: np.ndarray) -> Dict[str, Any]:
        t0 = time.time()

        # Step 1: Preprocess
        image = correct_perspective(image)
        image = denoise_image(image, method="bilateral")
        image = enhance_contrast(image)
        binary = binarize_image(image, method="adaptive")

        # Step 2: Detect Braille cells
        cell_boxes = self.detector.detect(image)
        logger.info(f"Detected {len(cell_boxes)} braille cells")

        if not cell_boxes:
            return {
                "text": "",
                "detected_cells": 0,
                "confidence": 0.0,
                "processing_time_ms": round((time.time() - t0) * 1000, 2),
                "model_version": "1.0.0",
                "cells": [],
            }

        # Step 3: Crop and classify each cell
        cell_crops = []
        for box in cell_boxes:
            x1, y1, x2, y2 = [int(c) for c in box[:4]]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(image.shape[1], x2), min(image.shape[0], y2)
            crop = image[y1:y2, x1:x2]
            cell_crops.append(resize_cell(crop, settings.CELL_SIZE))

        class_results = self.classifier.classify_batch(cell_crops)

        # Step 4: Post-process and decode to text
        cells_with_position = []
        for box, result in zip(cell_boxes, class_results):
            cells_with_position.append({
                "box": box[:4].tolist() if hasattr(box, "tolist") else list(box[:4]),
                "pattern": result["pattern"],
                "confidence": result["confidence"],
                "character": result["character"],
            })

        raw_text = self.postprocessor.decode(cells_with_position)
        corrected_text, nlp_confidence = self.nlp.correct(raw_text)

        confidences = [c["confidence"] for c in cells_with_position]
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0
        overall_confidence = avg_confidence * nlp_confidence

        processing_time_ms = round((time.time() - t0) * 1000, 2)

        return {
            "text": corrected_text,
            "raw_text": raw_text,
            "detected_cells": len(cell_boxes),
            "confidence": overall_confidence,
            "processing_time_ms": processing_time_ms,
            "model_version": "1.0.0",
            "cells": cells_with_position,
        }

    def run_from_path(self, image_path: str) -> Dict[str, Any]:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Cannot read image: {image_path}")
        return self.run(image)

    def run_from_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Cannot decode image bytes")
        return self.run(image)