"""Tesseract OCR baseline for comparison against our ML pipeline."""
import logging
import cv2
import numpy as np
from typing import Dict, List
from app.ml.evaluation.evaluate_pipeline import character_error_rate, word_error_rate

logger = logging.getLogger(__name__)


def run_tesseract_baseline(image_path: str, lang: str = "eng") -> Dict:
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang=lang)
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        confidences = [int(c) for c in data["conf"] if str(c).isdigit() and int(c) >= 0]
        mean_conf = float(np.mean(confidences)) / 100.0 if confidences else 0.0
        return {"text": text.strip(), "confidence": mean_conf}
    except Exception as e:
        logger.error(f"Tesseract baseline failed: {e}")
        return {"text": "", "confidence": 0.0}


def compare_with_baseline(
    test_samples: List[Dict],
    our_pipeline,
    output_path: str = "app/ml/artifacts/baseline_comparison.json",
) -> Dict:
    import json
    our_cer, our_wer = [], []
    tess_cer, tess_wer = [], []

    for sample in test_samples:
        gt = sample["ground_truth"]
        our_result = our_pipeline.run_from_path(sample["image_path"])
        tess_result = run_tesseract_baseline(sample["image_path"])

        our_cer.append(character_error_rate(gt, our_result["text"]))
        our_wer.append(word_error_rate(gt, our_result["text"]))
        tess_cer.append(character_error_rate(gt, tess_result["text"]))
        tess_wer.append(word_error_rate(gt, tess_result["text"]))

    comparison = {
        "our_model": {
            "mean_cer": float(np.mean(our_cer)),
            "mean_wer": float(np.mean(our_wer)),
        },
        "tesseract_baseline": {
            "mean_cer": float(np.mean(tess_cer)),
            "mean_wer": float(np.mean(tess_wer)),
        },
        "improvement": {
            "cer_reduction": float(np.mean(tess_cer) - np.mean(our_cer)),
            "wer_reduction": float(np.mean(tess_wer) - np.mean(our_wer)),
        },
    }
    with open(output_path, "w") as f:
        json.dump(comparison, f, indent=2)
    logger.info(f"Baseline comparison saved to {output_path}")
    return comparison