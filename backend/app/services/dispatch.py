from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict
from uuid import uuid4

from sqlalchemy.orm import Session

from ..config import Settings
from ..models import Order
from ..schemas import CheckoutIn, OrderOut
from .foodics import FoodicsClient, FoodicsError
from .payments import gateway_for
from .receipts import LOCATION_NAMES, build_receipt, estimated_ready_at, to_order_dict, totals

logger = logging.getLogger("mihbash.dispatch")


def new_order_number() -> str:
    stamp = datetime.utcnow().strftime("%y%m%d")
    return "EA-{}-{}".format(stamp, uuid4().hex[:4].upper())


def create_order(db: Session, payload: CheckoutIn, settings: Settings) -> OrderOut:
    if not payload.items:
        raise ValueError("Bag is empty")

    subtotal, tax, total = totals(payload.items, settings.tax_rate)
    order_id = str(uuid4())
    order_number = new_order_number()
    receipt = build_receipt(
        order_number=order_number,
        location_id=payload.locationId,
        customer_name=payload.customer.name,
        items=payload.items,
        subtotal=subtotal,
        tax=tax,
        total=total,
        currency=settings.currency,
        payment_method=payload.paymentGateway,
    )

    order = Order(
        id=order_id,
        order_number=order_number,
        status="pending_payment",
        payment_status="unpaid",
        payment_gateway=payload.paymentGateway,
        location_id=payload.locationId,
        fulfillment=payload.fulfillment,
        customer_name=payload.customer.name,
        customer_email=payload.customer.email,
        customer_phone=payload.customer.phone,
        dial_code=payload.customer.dial_code,
        notes=payload.notes or "",
        items=[item.model_dump() for item in payload.items],
        subtotal=subtotal,
        tax=tax,
        total=total,
        currency=settings.currency,
        receipt=to_order_dict(receipt),
        foodics_dry_run=settings.foodics_dry_run or not bool(settings.foodics_api_token),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    gateway = gateway_for(payload.paymentGateway, settings)
    intent = gateway.create_intent(
        amount=total,
        currency=settings.currency,
        order_id=order.id,
        metadata={"order_number": order.order_number},
    )
    order.payment_ref = intent.get("payment_ref") or ""
    db.add(order)
    db.commit()

    if intent.get("auto_capture"):
        mark_paid_and_dispatch(db, order, settings, payment_ref=order.payment_ref)

    db.refresh(order)
    return serialize_order(order, client_secret=intent.get("client_secret"), redirect_url=intent.get("redirect_url"))


def mark_paid_and_dispatch(
    db: Session,
    order: Order,
    settings: Settings,
    payment_ref: str = "",
) -> Order:
    if order.payment_status == "paid" and order.foodics_dispatched:
        return order

    order.payment_status = "paid"
    order.status = "paid"
    order.paid_at = datetime.utcnow()
    if payment_ref:
        order.payment_ref = payment_ref
    db.add(order)
    db.commit()
    db.refresh(order)

    if order.foodics_dispatched:
        return order

    client = FoodicsClient(settings)
    try:
        result = client.inject_order(
            order_number=order.order_number,
            location_id=order.location_id,
            fulfillment=order.fulfillment,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            dial_code=order.dial_code,
            customer_email=order.customer_email,
            notes=order.notes,
            items=_hydrate_items(order.items),
            total=order.total,
        )
        order.foodics_payload = result.get("payload") or {}
        order.foodics_response = result.get("response") or {}
        order.foodics_order_id = result.get("foodics_order_id") or ""
        order.foodics_dispatched = bool(result.get("dispatched"))
        order.foodics_dry_run = bool(result.get("dry_run"))
        order.status = "dispatched" if order.foodics_dispatched else "paid"
        order.dispatched_at = datetime.utcnow()
    except FoodicsError as exc:
        logger.exception("Foodics dispatch failed for %s", order.order_number)
        order.status = "pos_failed"
        order.foodics_response = {"error": str(exc)}
        order.foodics_dispatched = False

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def serialize_order(order: Order, client_secret=None, redirect_url=None) -> OrderOut:
    from ..schemas import CartItemIn, FoodicsStatus, ReceiptOut

    ready = estimated_ready_at(sum(item.get("quantity", 1) for item in order.items))
    return OrderOut(
        orderId=order.id,
        orderNumber=order.order_number,
        status=order.status,
        total=order.total,
        currency=order.currency,
        estimatedReadyAt=ready.isoformat() + "Z",
        locationName=LOCATION_NAMES.get(order.location_id, order.location_id),
        paymentStatus=order.payment_status,
        receipt=ReceiptOut.model_validate(order.receipt),
        foodics=FoodicsStatus(
            dispatched=order.foodics_dispatched,
            dryRun=order.foodics_dry_run,
            orderId=order.foodics_order_id or None,
        ),
        clientSecret=client_secret,
        redirectUrl=redirect_url,
    )


def _hydrate_items(raw: list) -> list:
    from ..schemas import CartItemIn

    return [CartItemIn.model_validate(item) for item in raw]
