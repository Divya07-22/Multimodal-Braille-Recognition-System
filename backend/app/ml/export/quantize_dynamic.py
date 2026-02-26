"""Dynamic quantization for PyTorch models — reduces model size ~4x."""
import os
import logging
import torch
import torch.nn as nn
from app.ml.training.train_classifier import build_classifier
from app.core.config import settings

logger = logging.getLogger(__name__)


def quantize_classifier(
    weights_path: str = None,
    output_path: str = None,
    num_classes: int = 64,
) -> str:
    weights_path = weights_path or settings.CLASSIFIER_MODEL_PATH
    output_path = output_path or settings.CLASSIFIER_QUANTIZED_PATH

    model = build_classifier(num_classes=num_classes)
    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        logger.info(f"Loaded model for quantization: {weights_path}")
    model.eval()

    quantized = torch.quantization.quantize_dynamic(
        model,
        {nn.Linear, nn.Conv2d},
        dtype=torch.qint8,
    )
    torch.save(quantized.state_dict(), output_path)
    orig_size = os.path.getsize(weights_path) / 1e6 if os.path.exists(weights_path) else 0
    quant_size = os.path.getsize(output_path) / 1e6
    logger.info(f"Quantized classifier: {orig_size:.2f}MB -> {quant_size:.2f}MB")
    logger.info(f"Saved quantized model to {output_path}")
    return output_path


if __name__ == "__main__":
    quantize_classifier()