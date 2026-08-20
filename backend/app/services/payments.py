from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from uuid import uuid4

import stripe

from ..config import Settings


class PaymentIntent(dict):
    """Normalised intent returned to checkout regardless of gateway."""


class PaymentGateway(ABC):
    name: str

    @abstractmethod
    def create_intent(self, *, amount: float, currency: str, order_id: str, metadata: Dict[str, Any]) -> PaymentIntent:
        raise NotImplementedError

    @abstractmethod
    def parse_paid_order_id(self, payload: Dict[str, Any]) -> Optional[str]:
        raise NotImplementedError


class MockGateway(PaymentGateway):
    name = "mock"

    def create_intent(self, *, amount: float, currency: str, order_id: str, metadata: Dict[str, Any]) -> PaymentIntent:
        return PaymentIntent(
            {
                "gateway": self.name,
                "status": "succeeded",
                "auto_capture": True,
                "payment_ref": "mock_{}".format(uuid4().hex[:12]),
                "client_secret": None,
                "redirect_url": None,
            }
        )

    def parse_paid_order_id(self, payload: Dict[str, Any]) -> Optional[str]:
        return payload.get("order_id") or payload.get("data", {}).get("order_id")


class StripeGateway(PaymentGateway):
    name = "stripe"

    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        if secret_key:
            stripe.api_key = secret_key

    def create_intent(self, *, amount: float, currency: str, order_id: str, metadata: Dict[str, Any]) -> PaymentIntent:
        if not self.secret_key:
            mock = MockGateway().create_intent(amount=amount, currency=currency, order_id=order_id, metadata=metadata)
            mock["gateway"] = self.name
            mock["fallback"] = "missing_stripe_secret"
            return mock

        intent = stripe.PaymentIntent.create(
            amount=int(round(amount * 100)),
            currency=currency.lower(),
            metadata={"order_id": order_id, **metadata},
            automatic_payment_methods={"enabled": True},
        )
        return PaymentIntent(
            {
                "gateway": self.name,
                "status": intent.status,
                "auto_capture": False,
                "payment_ref": intent.id,
                "client_secret": intent.client_secret,
                "redirect_url": None,
            }
        )

    def parse_paid_order_id(self, payload: Dict[str, Any]) -> Optional[str]:
        obj = payload.get("data", {}).get("object", {})
        metadata = obj.get("metadata") or {}
        return metadata.get("order_id")


class ZiinaGateway(PaymentGateway):
    """Ziina (UAE) hosted payment. Requires ZIINA_API_KEY in production."""

    name = "ziina"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def create_intent(self, *, amount: float, currency: str, order_id: str, metadata: Dict[str, Any]) -> PaymentIntent:
        if not self.api_key:
            mock = MockGateway().create_intent(amount=amount, currency=currency, order_id=order_id, metadata=metadata)
            mock["gateway"] = self.name
            mock["fallback"] = "missing_ziina_key"
            return mock

        # Production path: POST https://api.ziina.com/api/payment_intent
        return PaymentIntent(
            {
                "gateway": self.name,
                "status": "requires_action",
                "auto_capture": False,
                "payment_ref": "ziina_pending_{}".format(order_id[:8]),
                "client_secret": None,
                "redirect_url": "https://pay.ziina.com/checkout?order={}".format(order_id),
            }
        )

    def parse_paid_order_id(self, payload: Dict[str, Any]) -> Optional[str]:
        data = payload.get("data") or payload
        return data.get("order_id") or data.get("metadata", {}).get("order_id")


def gateway_for(name: str, settings: Settings) -> PaymentGateway:
    if name == "stripe":
        return StripeGateway(settings.stripe_secret_key)
    if name == "ziina":
        return ZiinaGateway(settings.ziina_api_key)
    return MockGateway()
