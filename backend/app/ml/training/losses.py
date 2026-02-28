import torch
import torch.nn as nn
import torch.nn.functional as F


class FocalLoss(nn.Module):
    """
    Focal Loss for dealing with class imbalance in braille classification.
    FL(pt) = -alpha_t * (1 - pt)^gamma * log(pt)
    """

    def __init__(self, alpha: float = 0.25, gamma: float = 2.0, reduction: str = "mean"):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        ce_loss = F.cross_entropy(logits, targets, reduction="none")
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss

        if self.reduction == "mean":
            return focal_loss.mean()
        elif self.reduction == "sum":
            return focal_loss.sum()
        return focal_loss


class LabelSmoothingLoss(nn.Module):
    def __init__(self, num_classes: int = 256, smoothing: float = 0.1):
        super().__init__()
        self.smoothing = smoothing
        self.num_classes = num_classes

    def forward(self, logits, targets):
        # Guard: clamp targets to valid range
        targets = targets.clamp(0, self.num_classes - 1)

        smooth_targets = torch.zeros_like(logits).scatter_(
            1, targets.unsqueeze(1), 1.0 - self.smoothing
        )
        smooth_targets += self.smoothing / self.num_classes
        log_probs = torch.nn.functional.log_softmax(logits, dim=1)
        return -(smooth_targets * log_probs).sum(dim=1).mean()


# Alias for backward compatibility
LabelSmoothingCrossEntropy = LabelSmoothingLoss


class DotDetectionLoss(nn.Module):
    """
    Combined loss for dot detection:
    = BCE loss for objectness + Smooth L1 for bbox regression + Focal for class
    """

    def __init__(self, lambda_obj: float = 1.0, lambda_bbox: float = 5.0, lambda_cls: float = 1.0):
        super().__init__()
        self.lambda_obj = lambda_obj
        self.lambda_bbox = lambda_bbox
        self.lambda_cls = lambda_cls
        self.bce = nn.BCEWithLogitsLoss()
        self.smooth_l1 = nn.SmoothL1Loss()
        self.focal = FocalLoss()

    def forward(
        self,
        pred_boxes: torch.Tensor,
        pred_obj: torch.Tensor,
        pred_cls: torch.Tensor,
        target_boxes: torch.Tensor,
        target_obj: torch.Tensor,
        target_cls: torch.Tensor,
    ) -> torch.Tensor:
        obj_loss = self.bce(pred_obj, target_obj.float())
        bbox_loss = self.smooth_l1(pred_boxes, target_boxes)
        cls_loss = self.focal(pred_cls, target_cls.long())
        total = (
            self.lambda_obj * obj_loss
            + self.lambda_bbox * bbox_loss
            + self.lambda_cls * cls_loss
        )
        return total, obj_loss, bbox_loss, cls_loss


class ContrastiveLoss(nn.Module):
    """
    Contrastive loss for metric learning on braille embeddings.
    Used for few-shot learning of rare braille patterns.
    """

    def __init__(self, margin: float = 1.0):
        super().__init__()
        self.margin = margin

    def forward(
        self,
        emb1: torch.Tensor,
        emb2: torch.Tensor,
        label: torch.Tensor,
    ) -> torch.Tensor:
        dist = F.pairwise_distance(emb1, emb2)
        pos_loss = label * dist ** 2
        neg_loss = (1 - label) * F.relu(self.margin - dist) ** 2
        return (pos_loss + neg_loss).mean()