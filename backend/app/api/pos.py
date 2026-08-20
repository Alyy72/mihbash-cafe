from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import get_db
from ..models import Order
from ..schemas import CartItemIn
from ..services.foodics import FoodicsClient

router = APIRouter(prefix="/api/v1/pos", tags=["pos"])


@router.post("/foodics/inject/{order_id}")
def inject_foodics_order(
    order_id: str,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Manually (re)inject a paid order into Foodics — used by ops if KDS missed a ticket."""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.payment_status != "paid":
        raise HTTPException(status_code=409, detail="Order is not paid")

    client = FoodicsClient(settings)
    items = [CartItemIn.model_validate(item) for item in order.items]
    result = client.inject_order(
        order_number=order.order_number,
        location_id=order.location_id,
        fulfillment=order.fulfillment,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        dial_code=order.dial_code,
        customer_email=order.customer_email,
        notes=order.notes,
        items=items,
        total=order.total,
    )
    order.foodics_payload = result.get("payload") or {}
    order.foodics_response = result.get("response") or {}
    order.foodics_order_id = result.get("foodics_order_id") or order.foodics_order_id
    order.foodics_dispatched = bool(result.get("dispatched"))
    order.foodics_dry_run = bool(result.get("dry_run"))
    db.add(order)
    db.commit()
    return result
