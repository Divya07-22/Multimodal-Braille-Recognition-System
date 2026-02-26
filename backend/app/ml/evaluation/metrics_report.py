import json
import os
import numpy as np
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
    accuracy_score,
)
from typing import List, Dict


def generate_classification_report(
    y_true: List[int],
    y_pred: List[int],
    class_names: List[str] = None,
    output_path: str = "app/ml/artifacts/classification_report.json",
) -> Dict:
    report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
    accuracy = accuracy_score(y_true, y_pred)
    cm = confusion_matrix(y_true, y_pred)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, average="macro"
    )

    full_report = {
        "accuracy": float(accuracy),
        "macro_precision": float(precision),
        "macro_recall": float(recall),
        "macro_f1": float(f1),
        "per_class": report,
        "confusion_matrix": cm.tolist(),
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(full_report, f, indent=2)

    return full_report


def print_metric_summary(report: Dict):
    print("=" * 60)
    print("BRAILLE CLASSIFIER EVALUATION REPORT")
    print("=" * 60)
    print(f"Accuracy:         {report['accuracy']:.4f}")
    print(f"Macro Precision:  {report['macro_precision']:.4f}")
    print(f"Macro Recall:     {report['macro_recall']:.4f}")
    print(f"Macro F1:         {report['macro_f1']:.4f}")
    print("=" * 60)