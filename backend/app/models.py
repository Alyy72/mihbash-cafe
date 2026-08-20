from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import JSON, Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event: Mapped[str] = mapped_column(String(64), index=True)
    path: Mapped[str] = mapped_column(String(255), default="/")
    session_id: Mapped[str] = mapped_column(String(64), index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    user_agent: Mapped[str] = mapped_column(Text, default="")
    referrer: Mapped[str] = mapped_column(Text, default="")
    properties: Mapped[dict] = mapped_column(JSON, default=dict)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    order_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default="pending_payment", index=True)
    payment_status: Mapped[str] = mapped_column(String(32), default="unpaid")
    payment_gateway: Mapped[str] = mapped_column(String(32), default="mock")
    payment_ref: Mapped[str] = mapped_column(String(128), default="")
    location_id: Mapped[str] = mapped_column(String(32))
    fulfillment: Mapped[str] = mapped_column(String(16), default="pickup")
    customer_name: Mapped[str] = mapped_column(String(128))
    customer_email: Mapped[str] = mapped_column(String(128))
    customer_phone: Mapped[str] = mapped_column(String(32))
    dial_code: Mapped[str] = mapped_column(String(8), default="971")
    notes: Mapped[str] = mapped_column(Text, default="")
    items: Mapped[list] = mapped_column(JSON, default=list)
    subtotal: Mapped[float] = mapped_column(Float)
    tax: Mapped[float] = mapped_column(Float)
    total: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(8), default="AED")
    receipt: Mapped[dict] = mapped_column(JSON, default=dict)
    foodics_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    foodics_response: Mapped[dict] = mapped_column(JSON, default=dict)
    foodics_order_id: Mapped[str] = mapped_column(String(64), default="")
    foodics_dispatched: Mapped[bool] = mapped_column(Boolean, default=False)
    foodics_dry_run: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    dispatched_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(32), index=True)
    event_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    event_type: Mapped[str] = mapped_column(String(64))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    processed: Mapped[bool] = mapped_column(Boolean, default=False)
    received_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Collaboration(Base):
    __tablename__ = "collaborations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    reference: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(128))
    brand: Mapped[str] = mapped_column(String(128), default="")
    email: Mapped[str] = mapped_column(String(128), index=True)
    phone: Mapped[str] = mapped_column(String(32), default="")
    instagram: Mapped[str] = mapped_column(String(64), default="")
    type: Mapped[str] = mapped_column(String(32), default="other")
    message: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(8), default="en")
    status: Mapped[str] = mapped_column(String(16), default="new", index=True)
    staff_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
