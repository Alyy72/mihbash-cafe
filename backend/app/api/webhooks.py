from __future__ import annotations

import json
import logging
from typing import Any, Dict

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import get_db
from ..models import Order, WebhookEvent
from ..security import timing_safe_equals, verify_hmac_sha256
from ..services.dispatch import mark_paid_and_dispatch
from ..services.payments import StripeGateway, ZiinaGateway

logger = logging.getLogger("mihbash.webhooks")

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


def _dedupe(db: Session, provider: str, event_id: str, event_type: str, payload: Dict[str, Any]) -> bool:
    existing = db.query(WebhookEvent).filter(WebhookEvent.event_id == event_id).one_or_none()
    if existing:
        return False
    db.add(
        WebhookEvent(
            provider=provider,
            event_id=event_id,
            event_type=event_type,
            payload=payload,
            processed=False,
        )
    )
    db.commit()
    return True


def _pay_order(db: Session, settings: Settings, order_id: str, payment_ref: str) -> None:
    order = db.get(Order, order_id)
    if not order:
        logger.warning("Webhook for unknown order %s", order_id)
        return
    mark_paid_and_dispatch(db, order, settings, payment_ref=payment_ref)


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    stripe_signature: str = Header(default="", alias="Stripe-Signature"),
):
    raw = await request.body()
    if settings.stripe_webhook_secret:
        try:
            event = stripe.Webhook.construct_event(raw, stripe_signature, settings.stripe_webhook_secret)
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid Stripe signature") from exc
        payload = event if isinstance(event, dict) else json.loads(raw)
        event_id = payload.get("id", "")
        event_type = payload.get("type", "")
    else:
        payload = json.loads(raw or b"{}")
        event_id = payload.get("id") or "stripe_dev"
        event_type = payload.get("type", "")

    if not _dedupe(db, "stripe", event_id, event_type, payload):
        return {"received": True, "duplicate": True}

    if event_type in {"payment_intent.succeeded", "checkout.session.completed"}:
        order_id = StripeGateway(settings.stripe_secret_key).parse_paid_order_id(payload)
        obj = payload.get("data", {}).get("object", {})
        payment_ref = obj.get("id") or obj.get("payment_intent") or ""
        if order_id:
            _pay_order(db, settings, order_id, payment_ref)

    return {"received": True}


@router.post("/ziina")
async def ziina_webhook(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    x_ziina_signature: str = Header(default="", alias="X-Ziina-Signature"),
):
    raw = await request.body()
    if settings.ziina_webhook_secret and not verify_hmac_sha256(
        raw, x_ziina_signature, settings.ziina_webhook_secret
    ):
        raise HTTPException(status_code=400, detail="Invalid Ziina signature")

    payload = json.loads(raw or b"{}")
    event_id = str(payload.get("id") or payload.get("event_id") or "ziina_dev")
    event_type = payload.get("type") or payload.get("event") or ""

    if not _dedupe(db, "ziina", event_id, event_type, payload):
        return {"received": True, "duplicate": True}

    if event_type in {"payment.completed", "payment_intent.succeeded", "completed"}:
        order_id = ZiinaGateway(settings.ziina_api_key).parse_paid_order_id(payload)
        if order_id:
            _pay_order(db, settings, order_id, event_id)

    return {"received": True}


@router.post("/mock")
async def mock_webhook(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    x_mihbash_secret: str = Header(default="", alias="X-Mihbash-Secret"),
):
    if not timing_safe_equals(x_mihbash_secret, settings.webhook_secret):
        raise HTTPException(status_code=401, detail="Unauthorized webhook")
    payload = await request.json()
    order_id = payload.get("order_id")
    if not order_id:
        raise HTTPException(status_code=400, detail="order_id required")
    event_id = "mock_{}".format(order_id)
    _dedupe(db, "mock", event_id, "payment.completed", payload)
    _pay_order(db, settings, order_id, payload.get("payment_ref", event_id))
    return {"received": True}
