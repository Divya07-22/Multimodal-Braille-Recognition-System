import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Placeholder email service. Integrate SMTP/SendGrid as needed."""

    async def send_welcome_email(self, email: str, username: str) -> None:
        logger.info(f"[EMAIL] Welcome email -> {email} (user: {username})")

    async def send_job_complete_email(self, email: str, job_id: int) -> None:
        logger.info(f"[EMAIL] Job {job_id} complete -> {email}")

    async def send_password_reset_email(self, email: str, token: str) -> None:
        logger.info(f"[EMAIL] Password reset -> {email}")