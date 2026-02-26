
"""initial tables

Revision ID: 001_initial_tables
Revises:
Create Date: 2026-02-26 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# ---------------------------------------------------------------------------
# Revision identifiers
# ---------------------------------------------------------------------------
revision = "001_initial_tables"
down_revision = None
branch_labels = None
depends_on = None


# ---------------------------------------------------------------------------
# Upgrade — create all tables
# ---------------------------------------------------------------------------
def upgrade() -> None:

    # -----------------------------------------------------------------------
    # users
    # -----------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id",         sa.Integer(),     nullable=False, autoincrement=True),
        sa.Column("uid",        sa.String(64),    nullable=False, unique=True),
        sa.Column("username",   sa.String(128),   nullable=False, unique=True),
        sa.Column("email",      sa.String(256),   nullable=False, unique=True),
        sa.Column("password",   sa.String(256),   nullable=False),
        sa.Column("is_active",  sa.Boolean(),     nullable=False, default=True),
        sa.Column("is_admin",   sa.Boolean(),     nullable=False, default=False),
        sa.Column("created_at", sa.DateTime(),    nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(),    nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_uid",      "users", ["uid"],      unique=True)
    op.create_index("ix_users_email",    "users", ["email"],    unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    # -----------------------------------------------------------------------
    # jobs
    # -----------------------------------------------------------------------
    op.create_table(
        "jobs",
        sa.Column("id",           sa.Integer(),     nullable=False, autoincrement=True),
        sa.Column("job_id",       sa.String(64),    nullable=False, unique=True),
        sa.Column("user_id",      sa.Integer(),     nullable=True),
        sa.Column("status",       sa.String(32),    nullable=False, default="pending"),
        sa.Column("input_path",   sa.String(512),   nullable=True),
        sa.Column("output_path",  sa.String(512),   nullable=True),
        sa.Column("file_name",    sa.String(256),   nullable=True),
        sa.Column("file_size",    sa.BigInteger(),  nullable=True),
        sa.Column("file_type",    sa.String(64),    nullable=True),
        sa.Column("error_msg",    sa.Text(),        nullable=True),
        sa.Column("created_at",   sa.DateTime(),    nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at",   sa.DateTime(),    nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(),    nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_jobs_job_id",  "jobs", ["job_id"],  unique=True)
    op.create_index("ix_jobs_user_id", "jobs", ["user_id"], unique=False)
    op.create_index("ix_jobs_status",  "jobs", ["status"],  unique=False)

    # -----------------------------------------------------------------------
    # conversions
    # -----------------------------------------------------------------------
    op.create_table(
        "conversions",
        sa.Column("id",                  sa.Integer(),   nullable=False, autoincrement=True),
        sa.Column("conversion_id",       sa.String(64),  nullable=False, unique=True),
        sa.Column("job_id",              sa.Integer(),   nullable=False),
        sa.Column("user_id",             sa.Integer(),   nullable=True),
        sa.Column("input_text",          sa.Text(),      nullable=True),
        sa.Column("output_text",         sa.Text(),      nullable=True),
        sa.Column("braille_output",      sa.Text(),      nullable=True),
        sa.Column("conversion_type",     sa.String(64),  nullable=True),  # image_to_braille | braille_to_text
        sa.Column("language",            sa.String(32),  nullable=True, default="en"),
        sa.Column("confidence_score",    sa.Float(),     nullable=True),
        sa.Column("cer",                 sa.Float(),     nullable=True),
        sa.Column("wer",                 sa.Float(),     nullable=True),
        sa.Column("processing_time_ms",  sa.Float(),     nullable=True),
        sa.Column("model_version",       sa.String(64),  nullable=True),
        sa.Column("created_at",          sa.DateTime(),  nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["job_id"],  ["jobs.id"],  ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_conversions_conversion_id", "conversions", ["conversion_id"], unique=True)
    op.create_index("ix_conversions_job_id",        "conversions", ["job_id"],        unique=False)
    op.create_index("ix_conversions_user_id",       "conversions", ["user_id"],       unique=False)


# ---------------------------------------------------------------------------
# Downgrade — drop all tables
# ---------------------------------------------------------------------------
def downgrade() -> None:
    op.drop_table("conversions")
    op.drop_table("jobs")
    op.drop_table("users")