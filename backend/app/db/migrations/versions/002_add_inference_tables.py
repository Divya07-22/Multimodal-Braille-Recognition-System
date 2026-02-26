"""002 add inference tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-18 12:34:00
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "inference_results",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("document_id", sa.Integer, sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recognized_text", sa.Text, nullable=True),
        sa.Column("detected_cells", sa.Integer, default=0, nullable=False),
        sa.Column("confidence_score", sa.Float, default=0.0, nullable=False),
        sa.Column("processing_time_ms", sa.Float, default=0.0, nullable=False),
        sa.Column("model_version", sa.String(50), default="1.0.0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("inference_results")