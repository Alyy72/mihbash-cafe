from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

import httpx

from ..config import Settings
from ..models import Collaboration
from .whatsapp import format_inquiry

logger = logging.getLogger("mihbash.email")


def notify_inbox(settings: Settings, row: Collaboration) -> bool:
    """Send the collab inquiry to the house Gmail. Inbox address stays server-only."""
    inbox = (settings.collab_inbox_email or "").strip()
    if not inbox:
        logger.warning("Collab email skipped: set COLLAB_INBOX_EMAIL.")
        return False

    subject = "Mihbash collab inquiry {}".format(row.reference)
    body = format_inquiry(row)

    try:
        if settings.smtp_user and settings.smtp_password:
            return _send_smtp(settings, inbox, subject, body, reply_to=row.email)
        if settings.resend_api_key:
            return _send_resend(settings, inbox, subject, body, reply_to=row.email)
        return _send_formsubmit(inbox, subject, row)
    except Exception:
        logger.exception("Collab email failed for %s", row.reference)
        return False


def _send_smtp(settings: Settings, inbox: str, subject: str, body: str, reply_to: str) -> bool:
    sender = (settings.smtp_from or settings.smtp_user).strip()
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = inbox
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        smtp.starttls()
        smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)

    logger.info("Collab SMTP sent to inbox for %s", subject)
    return True


def _send_resend(settings: Settings, inbox: str, subject: str, body: str, reply_to: str) -> bool:
    payload = {
        "from": settings.smtp_from or "Mihbash Collab <noreply@mihbash.ae>",
        "to": [inbox],
        "subject": subject,
        "text": body,
    }
    if reply_to:
        payload["reply_to"] = [reply_to]
    response = httpx.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": "Bearer {}".format(settings.resend_api_key),
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=15.0,
    )
    response.raise_for_status()
    logger.info("Collab Resend sent for %s", subject)
    return True


def _send_formsubmit(inbox: str, subject: str, row: Collaboration) -> bool:
    response = httpx.post(
        "https://formsubmit.co/ajax/{}".format(inbox),
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        json={
            "_subject": subject,
            "_template": "table",
            "_replyto": row.email,
            "name": row.name,
            "brand": row.brand or "—",
            "email": row.email,
            "phone": row.phone or "—",
            "instagram": row.instagram or "—",
            "type": row.type,
            "reference": row.reference,
            "language": row.language,
            "message": row.message,
        },
        timeout=20.0,
    )
    response.raise_for_status()
    logger.info("Collab FormSubmit sent for %s", row.reference)
    return True
