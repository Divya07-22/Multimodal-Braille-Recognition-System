"""
Benchmark latency for PyTorch vs ONNX vs Quantized models.
Produces a detailed JSON report saved to artifacts/latency_benchmark.json
"""

import json
import logging
import os
import time
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import torch
import onnxruntime as ort
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(settings.MODEL_ARTIFACTS_DIR)
WARMUP_RUNS = 10
BENCHMARK_RUNS = 100
IMAGE_SIZE = settings.IMAGE_SIZE
CELL_SIZE = settings.CELL_SIZE


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_dummy_image_tensor(batch: int = 1, c: int = 3, h: int = IMAGE_SIZE, w: int = IMAGE_SIZE) -> torch.Tensor:
    return torch.randn(batch, c, h, w, dtype=torch.float32)


def _make_dummy_cell_tensor(batch: int = 1, c: int = 1, h: int = CELL_SIZE, w: int = CELL_SIZE) -> torch.Tensor:
    return torch.randn(batch, c, h, w, dtype=torch.float32)


def _make_dummy_numpy(batch: int = 1, c: int = 3, h: int = IMAGE_SIZE, w: int = IMAGE_SIZE) -> np.ndarray:
    return np.random.randn(batch, c, h, w).astype(np.float32)


def _make_dummy_cell_numpy(batch: int = 1, c: int = 1, h: int = CELL_SIZE, w: int = CELL_SIZE) -> np.ndarray:
    return np.random.randn(batch, c, h, w).astype(np.float32)


# ---------------------------------------------------------------------------
# Benchmark runners
# ---------------------------------------------------------------------------

def benchmark_pytorch_model(
    model_path: Path,
    dummy_input: torch.Tensor,
    model_class,
    device: str = "cpu",
    warmup: int = WARMUP_RUNS,
    runs: int = BENCHMARK_RUNS,
) -> Dict:
    """Load a .pt model and benchmark forward pass latency."""
    if not model_path.exists():
        logger.warning(f"PyTorch model not found: {model_path}")
        return {"error": f"Model not found: {model_path}"}

    try:
        model = model_class()
        state = torch.load(str(model_path), map_location=device)
        if "model_state_dict" in state:
            model.load_state_dict(state["model_state_dict"])
        else:
            model.load_state_dict(state)
        model.to(device)
        model.eval()
    except Exception as e:
        logger.error(f"Failed to load PyTorch model {model_path}: {e}")
        return {"error": str(e)}

    inp = dummy_input.to(device)

    # Warmup
    with torch.no_grad():
        for _ in range(warmup):
            _ = model(inp)

    # Benchmark
    latencies: List[float] = []
    with torch.no_grad():
        for _ in range(runs):
            t0 = time.perf_counter()
            _ = model(inp)
            latencies.append((time.perf_counter() - t0) * 1000)

    return _compute_stats(latencies, model_path.name, "pytorch", device)


def benchmark_pytorch_quantized_model(
    model_path: Path,
    dummy_input: torch.Tensor,
    device: str = "cpu",
    warmup: int = WARMUP_RUNS,
    runs: int = BENCHMARK_RUNS,
) -> Dict:
    """Benchmark a torch.save'd quantized scripted model."""
    if not model_path.exists():
        logger.warning(f"Quantized model not found: {model_path}")
        return {"error": f"Model not found: {model_path}"}

    try:
        model = torch.load(str(model_path), map_location=device)
        model.eval()
    except Exception as e:
        logger.error(f"Failed to load quantized model {model_path}: {e}")
        return {"error": str(e)}

    inp = dummy_input.to(device)

    with torch.no_grad():
        for _ in range(warmup):
            _ = model(inp)

    latencies: List[float] = []
    with torch.no_grad():
        for _ in range(runs):
            t0 = time.perf_counter()
            _ = model(inp)
            latencies.append((time.perf_counter() - t0) * 1000)

    return _compute_stats(latencies, model_path.name, "pytorch_quantized", device)


def benchmark_onnx_model(
    onnx_path: Path,
    dummy_input: np.ndarray,
    input_name: str = "input",
    warmup: int = WARMUP_RUNS,
    runs: int = BENCHMARK_RUNS,
) -> Dict:
    """Benchmark ONNX Runtime inference latency."""
    if not onnx_path.exists():
        logger.warning(f"ONNX model not found: {onnx_path}")
        return {"error": f"ONNX model not found: {onnx_path}"}

    try:
        sess_options = ort.SessionOptions()
        sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        sess_options.intra_op_num_threads = os.cpu_count() or 4
        session = ort.InferenceSession(
            str(onnx_path),
            sess_options=sess_options,
            providers=["CPUExecutionProvider"],
        )
        input_name = session.get_inputs()[0].name
    except Exception as e:
        logger.error(f"Failed to load ONNX model {onnx_path}: {e}")
        return {"error": str(e)}

    feed = {input_name: dummy_input}

    # Warmup
    for _ in range(warmup):
        session.run(None, feed)

    latencies: List[float] = []
    for _ in range(runs):
        t0 = time.perf_counter()
        session.run(None, feed)
        latencies.append((time.perf_counter() - t0) * 1000)

    return _compute_stats(latencies, onnx_path.name, "onnx_runtime", "cpu")


# ---------------------------------------------------------------------------
# Stats helper
# ---------------------------------------------------------------------------

def _compute_stats(latencies: List[float], model_name: str, backend: str, device: str) -> Dict:
    arr = np.array(latencies)
    return {
        "model_name": model_name,
        "backend": backend,
        "device": device,
        "runs": len(latencies),
        "mean_ms": float(np.mean(arr)),
        "median_ms": float(np.median(arr)),
        "std_ms": float(np.std(arr)),
        "min_ms": float(np.min(arr)),
        "max_ms": float(np.max(arr)),
        "p90_ms": float(np.percentile(arr, 90)),
        "p95_ms": float(np.percentile(arr, 95)),
        "p99_ms": float(np.percentile(arr, 99)),
        "throughput_fps": float(1000.0 / np.mean(arr)),
    }


# ---------------------------------------------------------------------------
# Speedup comparison
# ---------------------------------------------------------------------------

def _speedup(baseline_ms: float, target_ms: float) -> float:
    if target_ms <= 0:
        return 0.0
    return round(baseline_ms / target_ms, 3)


# ---------------------------------------------------------------------------
# Main benchmark orchestrator
# ---------------------------------------------------------------------------

def run_full_benchmark() -> Dict:
    logger.info("=" * 60)
    logger.info("Starting full latency benchmark")
    logger.info(f"Warmup runs : {WARMUP_RUNS}")
    logger.info(f"Benchmark runs: {BENCHMARK_RUNS}")
    logger.info("=" * 60)

    # Lazy import to avoid circular deps at module level
    from app.ml.inference.dot_detector_cnn import DotDetectorCNN
    from app.ml.inference.cell_classifier_cnn import CellClassifierCNN

    results: Dict = {
        "benchmark_config": {
            "warmup_runs": WARMUP_RUNS,
            "benchmark_runs": BENCHMARK_RUNS,
            "image_size": IMAGE_SIZE,
            "cell_size": CELL_SIZE,
            "device": "cpu",
        },
        "detector": {},
        "classifier": {},
        "speedups": {},
        "summary": {},
    }

    # ------------------------------------------------------------------
    # DETECTOR benchmarks
    # ------------------------------------------------------------------
    logger.info("Benchmarking detector models ...")
    det_pt_input = _make_dummy_image_tensor()
    det_np_input = _make_dummy_numpy()

    det_pytorch = benchmark_pytorch_model(
        model_path=ARTIFACTS_DIR / "detector_best.pt",
        dummy_input=det_pt_input,
        model_class=DotDetectorCNN,
    )
    det_quantized = benchmark_pytorch_quantized_model(
        model_path=ARTIFACTS_DIR / "detector_quantized.pt",
        dummy_input=det_pt_input,
    )
    det_onnx = benchmark_onnx_model(
        onnx_path=ARTIFACTS_DIR / "detector.onnx",
        dummy_input=det_np_input,
    )

    results["detector"] = {
        "pytorch": det_pytorch,
        "quantized": det_quantized,
        "onnx": det_onnx,
    }

    # ------------------------------------------------------------------
    # CLASSIFIER benchmarks
    # ------------------------------------------------------------------
    logger.info("Benchmarking classifier models ...")
    cls_pt_input = _make_dummy_cell_tensor()
    cls_np_input = _make_dummy_cell_numpy()

    cls_pytorch = benchmark_pytorch_model(
        model_path=ARTIFACTS_DIR / "classifier_best.pt",
        dummy_input=cls_pt_input,
        model_class=CellClassifierCNN,
    )
    cls_quantized = benchmark_pytorch_quantized_model(
        model_path=ARTIFACTS_DIR / "classifier_quantized.pt",
        dummy_input=cls_pt_input,
    )
    cls_onnx = benchmark_onnx_model(
        onnx_path=ARTIFACTS_DIR / "classifier.onnx",
        dummy_input=cls_np_input,
    )

    results["classifier"] = {
        "pytorch": cls_pytorch,
        "quantized": cls_quantized,
        "onnx": cls_onnx,
    }

    # ------------------------------------------------------------------
    # Speedups
    # ------------------------------------------------------------------
    def safe_mean(r: Dict) -> float:
        return r.get("mean_ms", 0.0)

    det_base = safe_mean(det_pytorch)
    cls_base = safe_mean(cls_pytorch)

    results["speedups"] = {
        "detector_quantized_vs_pytorch": _speedup(det_base, safe_mean(det_quantized)),
        "detector_onnx_vs_pytorch": _speedup(det_base, safe_mean(det_onnx)),
        "classifier_quantized_vs_pytorch": _speedup(cls_base, safe_mean(cls_quantized)),
        "classifier_onnx_vs_pytorch": _speedup(cls_base, safe_mean(cls_onnx)),
    }

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    best_detector = min(
        [("pytorch", safe_mean(det_pytorch)),
         ("quantized", safe_mean(det_quantized)),
         ("onnx", safe_mean(det_onnx))],
        key=lambda x: x[1] if x[1] > 0 else float("inf"),
    )
    best_classifier = min(
        [("pytorch", safe_mean(cls_pytorch)),
         ("quantized", safe_mean(cls_quantized)),
         ("onnx", safe_mean(cls_onnx))],
        key=lambda x: x[1] if x[1] > 0 else float("inf"),
    )

    results["summary"] = {
        "best_detector_backend": best_detector[0],
        "best_detector_mean_ms": best_detector[1],
        "best_classifier_backend": best_classifier[0],
        "best_classifier_mean_ms": best_classifier[1],
        "recommendation": (
            f"Use '{best_detector[0]}' for detector "
            f"and '{best_classifier[0]}' for classifier in production."
        ),
    }

    # ------------------------------------------------------------------
    # Save report
    # ------------------------------------------------------------------
    out_path = ARTIFACTS_DIR / "latency_benchmark.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Latency benchmark saved to: {out_path}")
    logger.info("Summary:")
    logger.info(f"  Best detector  : {best_detector[0]} @ {best_detector[1]:.2f} ms")
    logger.info(f"  Best classifier: {best_classifier[0]} @ {best_classifier[1]:.2f} ms")

    return results


# ---------------------------------------------------------------------------
# Batch throughput benchmark
# ---------------------------------------------------------------------------

def benchmark_batch_throughput(batch_sizes: List[int] = None) -> Dict:
    """Test throughput at different batch sizes for ONNX models."""
    if batch_sizes is None:
        batch_sizes = [1, 2, 4, 8, 16]

    logger.info("Running batch throughput benchmark ...")
    report: Dict = {"detector": {}, "classifier": {}}

    det_onnx_path = ARTIFACTS_DIR / "detector.onnx"
    cls_onnx_path = ARTIFACTS_DIR / "classifier.onnx"

    for bs in batch_sizes:
        det_np = _make_dummy_numpy(batch=bs)
        cls_np = _make_dummy_cell_numpy(batch=bs)

        det_r = benchmark_onnx_model(det_onnx_path, det_np, runs=50)
        cls_r = benchmark_onnx_model(cls_onnx_path, cls_np, runs=50)

        report["detector"][f"batch_{bs}"] = {
            "mean_ms": det_r.get("mean_ms", 0),
            "throughput_fps": det_r.get("throughput_fps", 0) * bs,
        }
        report["classifier"][f"batch_{bs}"] = {
            "mean_ms": cls_r.get("mean_ms", 0),
            "throughput_fps": cls_r.get("throughput_fps", 0) * bs,
        }

    out_path = ARTIFACTS_DIR / "batch_throughput_benchmark.json"
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Batch throughput benchmark saved to: {out_path}")
    return report


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO)

    mode = sys.argv[1] if len(sys.argv) > 1 else "full"

    if mode == "full":
        run_full_benchmark()
    elif mode == "batch":
        benchmark_batch_throughput()
    elif mode == "both":
        run_full_benchmark()
        benchmark_batch_throughput()
    else:
        print(f"Unknown mode: {mode}. Use: full | batch | both")
        sys.exit(1)