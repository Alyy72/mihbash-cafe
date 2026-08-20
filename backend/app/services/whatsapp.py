from __future__ import annotations

import logging
import re

import httpx

from ..config import Settings
from ..models import Collaboration

logger = logging.getLogger("mihbash.whatsapp")


def digits_only(value: str) -> str:
    return re.sub(r"\D+", "", value or "")


def format_inquiry(row: Collaboration) -> str:
    lines = [
        "Mihbash collab inquiry",
        "Ref: {}".format(row.reference),
        "Name: {}".format(row.name),
        "Brand: {}".format(row.brand or "—"),
        "Email: {}".format(row.email),
        "Phone: {}".format(row.phone or "—"),
        "Instagram: {}".format(row.instagram or "—"),
        "Type: {}".format(row.type),
        "",
        row.message,
    ]
    return "\n".join(lines)


def notify_owner(settings: Settings, row: Collaboration) -> bool:
    """Send the inquiry to the house WhatsApp. Never expose the owner number to the guest."""
    to = digits_only(settings.whatsapp_owner_number)
    body = format_inquiry(row)
    if not to:
        logger.warning("WhatsApp skipped: set WHATSAPP_OWNER_NUMBER (owner mobile, no +).")
        return False

    try:
        if settings.whatsapp_token and settings.whatsapp_phone_number_id:
            return _send_cloud(settings, to, body)
        if settings.whatsapp_webhook_url:
            return _send_webhook(settings, to, body)
        if settings.whatsapp_callmebot_key:
            return _send_callmebot(settings, to, body)
        logger.warning(
            "WhatsApp skipped: set WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID, or WHATSAPP_WEBHOOK_URL, or WHATSAPP_CALLMEBOT_KEY."
        )
        return False
    except Exception:
        logger.exception("WhatsApp notify failed for %s", row.reference)
        return False


def _send_cloud(settings: Settings, to: str, body: str) -> bool:
    url = "https://graph.facebook.com/v21.0/{}/messages".format(settings.whatsapp_phone_number_id)
    response = httpx.post(
        url,
        headers={
            "Authorization": "Bearer {}".format(settings.whatsapp_token),
            "Content-Type": "application/json",
        },
        json={
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"preview_url": False, "body": body},
        },
        timeout=12.0,
    )
    response.raise_for_status()
    logger.info("WhatsApp Cloud API sent for owner notify")
    return True


def _send_webhook(settings: Settings, to: str, body: str) -> bool:
    response = httpx.post(
        settings.whatsapp_webhook_url,
        json={"to": to, "text": body, "source": "mihbash-collab"},
        timeout=12.0,
    )
    response.raise_for_status()
    logger.info("WhatsApp webhook sent for owner notify")
    return True


def _send_callmebot(settings: Settings, to: str, body: str) -> bool:
    response = httpx.get(
        "https://api.callmebot.com/whatsapp.php",
        params={
            "phone": to,
            "text": body,
            "apikey": settings.whatsapp_callmebot_key,
        },
        timeout=12.0,
    )
    response.raise_for_status()
    logger.info("CallMeBot WhatsApp sent for owner notify")
    return True
