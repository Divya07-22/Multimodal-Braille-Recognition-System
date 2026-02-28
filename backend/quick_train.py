import os
import logging
import torch
import torch.nn as nn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── STEP 1: Generate Synthetic Data ──────────────────────────────────────
logger.info("\n🔵 Step 1: Generating Synthetic Data...")
from app.ml.training.generate_synthetic_data import generate_dataset
generate_dataset(
    output_dir="app/ml/data/synthetic/cells",
    samples_per_class=500,
    cell_size=32,
)
logger.info("✅ Step 1 Done!")

# ── STEP 2: Train Dot Detector ────────────────────────────────────────────
logger.info("\n🔵 Step 2: Training Dot Detector...")
from app.ml.training.train_dot_detector import train_dot_detector
train_dot_detector(
    artifacts_dir="app/ml/artifacts",
    num_epochs=20,
    batch_size=64,
    dataset_size=20000,
    num_workers=0,
)
logger.info("✅ Step 2 Done!")

# ── STEP 3: Train Main Classifier ─────────────────────────────────────────
logger.info("\n🔵 Step 3: Training Main Classifier...")
from app.ml.training.train_classifier import train_classifier
train_classifier(
    data_dir="app/ml/data/synthetic/cells",
    artifacts_dir="app/ml/artifacts",
    num_epochs=20,
    batch_size=32,
    num_workers=0,
    epochs=20,
    num_classes=256,
)
logger.info("✅ Step 3 Done!")

# ── STEP 4: Train Cell Classifier (Knowledge Distillation) ────────────────
logger.info("\n🔵 Step 4: Training Cell Classifier...")
from app.ml.training.train_cell_classifier import train_cell_classifier_with_distillation
train_cell_classifier_with_distillation(
    data_dir="app/ml/data/synthetic/cells",
    artifacts_dir="app/ml/artifacts",
    teacher_path="app/ml/artifacts/classifier_best.pt",
    num_epochs=20,
    batch_size=64,
    num_classes=256,
    num_workers=0,
)
logger.info("✅ Step 4 Done!")

# ── STEP 5: Train Detector ────────────────────────────────────────────────
logger.info("\n🔵 Step 5: Training Detector...")
from app.ml.training.train_detector import train_detector
train_detector(
    images_dir="app/ml/data/dot_detector/images",
    targets_dir="app/ml/data/dot_detector/targets",
    artifacts_dir="app/ml/artifacts",
    num_epochs=20,
    batch_size=2,
    num_workers=0,
)
logger.info("✅ Step 5 Done!")

# ── STEP 6: Export to ONNX ────────────────────────────────────────────────
logger.info("\n🔵 Step 6: Exporting to ONNX...")
from app.ml.export.export_to_onnx import export_classifier_to_onnx, export_detector_to_onnx
export_classifier_to_onnx(
    weights_path="app/ml/artifacts/classifier_best.pt",
    output_path="app/ml/artifacts/classifier.onnx",
    num_classes=256,
)
export_detector_to_onnx(
    weights_path="app/ml/artifacts/detector_best.pt",
    output_path="app/ml/artifacts/detector.onnx",
)
logger.info("✅ Step 6 Done!")

# ── STEP 7: Quantize Models ───────────────────────────────────────────────
logger.info("\n🔵 Step 7: Quantizing Models...")
from app.ml.export.quantize_dynamic import quantize_classifier
quantize_classifier(
    weights_path="app/ml/artifacts/classifier_best.pt",
    output_path="app/ml/artifacts/classifier_quantized.pt",
    num_classes=256,
)
logger.info("✅ Step 7 Done!")

# ── STEP 8: Evaluate Pipeline ─────────────────────────────────────────────
logger.info("\n🔵 Step 8: Evaluating Pipeline...")
from app.ml.evaluation.evaluate_pipeline import evaluate_full_pipeline
evaluate_full_pipeline(
    test_data=[],
    pipeline=None,
    output_path="app/ml/artifacts/evaluation_report.json",
)
logger.info("✅ Step 8 Done!")

logger.info("\n🎉 ALL TRAINING COMPLETE!")