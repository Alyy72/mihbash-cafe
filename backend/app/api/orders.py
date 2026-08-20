from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import get_db
from ..models import Order
from ..schemas import CheckoutIn, OrderOut
from ..services.dispatch import create_order, serialize_order

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.post("", response_model=OrderOut)
def create_checkout_order(
    payload: CheckoutIn,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    try:
        return create_order(db, payload, settings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return serialize_order(order)
