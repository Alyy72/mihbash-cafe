from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List, Tuple

from ..schemas import CartItemIn, ReceiptLine, ReceiptOut

LOCATION_NAMES = {
    "umm-suqeim": "Umm Suqeim, Dubai",
    "marina": "Marina Promenade, Dubai",
    "difc": "Gate Village, DIFC",
    "maryah": "Al Maryah Island, Abu Dhabi",
}


def money(value: float) -> float:
    return round(float(value), 2)


def totals(items: List[CartItemIn], tax_rate: float) -> Tuple[float, float, float]:
    subtotal = money(sum(item.unitPrice * item.quantity for item in items))
    tax = money(subtotal * tax_rate)
    return subtotal, tax, money(subtotal + tax)


def estimated_ready_at(item_count: int) -> datetime:
    minutes = 12 + min(item_count, 6) * 2
    return datetime.utcnow() + timedelta(minutes=minutes)


def build_receipt(
    *,
    order_number: str,
    location_id: str,
    customer_name: str,
    items: List[CartItemIn],
    subtotal: float,
    tax: float,
    total: float,
    currency: str,
    payment_method: str,
) -> ReceiptOut:
    lines = [
        ReceiptLine(
            name=item.name,
            quantity=item.quantity,
            unitPrice=item.unitPrice,
            total=money(item.unitPrice * item.quantity),
        )
        for item in items
    ]
    return ReceiptOut(
        number=order_number,
        issuedAt=datetime.utcnow().isoformat() + "Z",
        cafe="Mihbash Cafe & Dining",
        location=LOCATION_NAMES.get(location_id, location_id),
        customer=customer_name,
        lines=lines,
        subtotal=subtotal,
        tax=tax,
        total=total,
        currency=currency,
        paymentMethod=payment_method,
    )


def to_order_dict(receipt: ReceiptOut) -> Dict[str, Any]:
    return receipt.model_dump()
