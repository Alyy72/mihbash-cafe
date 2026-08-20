from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class AnalyticsEventIn(BaseModel):
    event: str
    path: str = "/"
    session_id: str
    occurred_at: Optional[datetime] = None
    user_agent: str = ""
    referrer: str = ""
    properties: Dict[str, Any] = Field(default_factory=dict)


class AnalyticsSummary(BaseModel):
    total_events: int
    unique_sessions: int
    by_event: Dict[str, int]
    popular_menu_skus: List[Dict[str, Any]]
    popular_custom_builds: List[Dict[str, Any]]
    checkout_funnel: Dict[str, int]


class CustomerIn(BaseModel):
    name: str
    email: str
    phone: str
    dial_code: str = "971"


class CartItemIn(BaseModel):
    id: str
    kind: Literal["menu", "shop", "custom"]
    sku: str
    name: str
    unitPrice: float
    quantity: int
    image: str = ""
    notes: Optional[str] = None
    configuration: Optional[Dict[str, Any]] = None
    foodicsProductId: Optional[str] = None
    modifiers: Optional[List[Dict[str, Any]]] = None


class CheckoutIn(BaseModel):
    customer: CustomerIn
    locationId: str
    fulfillment: Literal["pickup", "delivery"] = "pickup"
    paymentGateway: Literal["stripe", "ziina", "mock"] = "mock"
    notes: Optional[str] = None
    items: List[CartItemIn]


class ReceiptLine(BaseModel):
    name: str
    quantity: int
    unitPrice: float
    total: float


class ReceiptOut(BaseModel):
    number: str
    issuedAt: str
    cafe: str
    location: str
    customer: str
    lines: List[ReceiptLine]
    subtotal: float
    tax: float
    total: float
    currency: str
    paymentMethod: str


class FoodicsStatus(BaseModel):
    dispatched: bool
    dryRun: bool
    orderId: Optional[str] = None


class OrderOut(BaseModel):
    orderId: str
    orderNumber: str
    status: str
    total: float
    currency: str
    estimatedReadyAt: str
    locationName: str
    paymentStatus: str
    receipt: ReceiptOut
    foodics: FoodicsStatus
    clientSecret: Optional[str] = None
    redirectUrl: Optional[str] = None


class CollaborationIn(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    brand: str = ""
    email: str = Field(min_length=3, max_length=128)
    phone: str = ""
    instagram: str = ""
    type: Literal["brand", "creator", "event", "content", "other"] = "other"
    message: str = Field(min_length=1, max_length=4000)
    language: Literal["en", "ar"] = "en"


class CollaborationStatusIn(BaseModel):
    status: Literal["new", "reviewed", "closed"]
    staff_notes: Optional[str] = None


class CollaborationPublicOut(BaseModel):
    id: str
    reference: str
    status: str


class CollaborationOut(BaseModel):
    id: str
    reference: str
    name: str
    brand: str
    email: str
    phone: str
    instagram: str
    type: str
    message: str
    language: str
    status: str
    staffNotes: str = ""
    createdAt: str
