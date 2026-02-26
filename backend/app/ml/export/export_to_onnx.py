"""Export PyTorch models to ONNX format with dynamic axes."""
import os
import logging
import torch
import torch.nn as nn
import onnx
import onnxruntime as ort
import numpy as np
from app.ml.training.train_classifier import build_classifier
from app.core.config import settings

logger = logging.getLogger(__name__)


def export_classifier_to_onnx(
    weights_path: str = None,
    output_path: str = None,
    num_classes: int = 64,
    image_size: int = 32,
    opset: int = 17,
) -> str:
    weights_path = weights_path or settings.CLASSIFIER_MODEL_PATH
    output_path = output_path or settings.CLASSIFIER_ONNX_PATH

    device = torch.device("cpu")
    model = build_classifier(num_classes=num_classes)
    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location=device))
        logger.info(f"Loaded classifier from {weights_path}")
    model.eval().to(device)

    dummy_input = torch.randn(1, 3, image_size, image_size)
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        opset_version=opset,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "logits": {0: "batch_size"},
        },
        do_constant_folding=True,
    )

    # Validate
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)

    # Verify output matches PyTorch
    sess = ort.InferenceSession(output_path, providers=["CPUExecutionProvider"])
    inp = dummy_input.numpy()
    ort_out = sess.run(None, {"input": inp})[0]
    with torch.no_grad():
        pt_out = model(dummy_input).numpy()
    max_diff = float(np.abs(ort_out - pt_out).max())
    logger.info(f"ONNX export verified. Max output diff: {max_diff:.6f}")
    logger.info(f"Saved ONNX classifier to {output_path}")
    return output_path


def export_detector_to_onnx(
    weights_path: str = None,
    output_path: str = None,
    image_size: int = 640,
    opset: int = 17,
) -> str:
    from torchvision.models.detection import fasterrcnn_resnet50_fpn
    from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

    weights_path = weights_path or settings.DETECTOR_MODEL_PATH
    output_path = output_path or settings.DETECTOR_ONNX_PATH

    model = fasterrcnn_resnet50_fpn(weights=None)
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, 2)

    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        logger.info(f"Loaded detector from {weights_path}")
    model.eval()

    dummy = [torch.randn(3, image_size, image_size)]
    torch.onnx.export(
        model, dummy, output_path,
        opset_version=opset,
        input_names=["input"],
        output_names=["boxes", "labels", "scores"],
        dynamic_axes={"input": {0: "batch"}},
        do_constant_folding=True,
    )
    logger.info(f"Saved ONNX detector to {output_path}")
    return output_path


if __name__ == "__main__":
    export_classifier_to_onnx()
    export_detector_to_onnx()