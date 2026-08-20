from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

import httpx

from ..config import Settings
from ..schemas import CartItemIn

logger = logging.getLogger("mihbash.foodics")

FOODICS_TYPE = {
    "dine_in": 1,
    "pickup": 2,
    "delivery": 3,
}


class FoodicsError(RuntimeError):
    pass


class FoodicsClient:
    """Foodics REST API v5 connector.

    When an online order is paid, `inject_order` maps Mihbash SKUs onto Foodics
    product IDs and POSTs a ticket so it appears on the cashier / KDS without
    re-entry. If FOODICS_API_TOKEN is empty, the client stays in dry-run
    and still returns the exact payload that would have been sent.
    """

    def __init__(self, settings: Settings):
        self.settings = settings
        self.base_url = settings.foodics_base_url.rstrip("/")
        self.token = settings.foodics_api_token
        self.dry_run = settings.foodics_dry_run or not bool(self.token)

    def inject_order(
        self,
        *,
        order_number: str,
        location_id: str,
        fulfillment: str,
        customer_name: str,
        customer_phone: str,
        dial_code: str,
        customer_email: str,
        notes: str,
        items: List[CartItemIn],
        total: float,
    ) -> Dict[str, Any]:
        payload = self.build_payload(
            order_number=order_number,
            location_id=location_id,
            fulfillment=fulfillment,
            customer_name=customer_name,
            customer_phone=customer_phone,
            dial_code=dial_code,
            customer_email=customer_email,
            notes=notes,
            items=items,
            total=total,
        )

        if self.dry_run:
            logger.info("Foodics dry-run payload for %s: %s", order_number, payload)
            return {
                "dry_run": True,
                "dispatched": True,
                "foodics_order_id": "dryrun_{}".format(order_number),
                "payload": payload,
                "response": {"status": "simulated", "message": "Set FOODICS_API_TOKEN and FOODICS_DRY_RUN=false to inject live."},
            }

        headers = {
            "Authorization": "Bearer {}".format(self.token),
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        url = "{}/orders".format(self.base_url)
        try:
            with httpx.Client(timeout=self.settings.foodics_timeout_seconds) as client:
                response = client.post(url, json=payload, headers=headers)
        except httpx.HTTPError as exc:
            raise FoodicsError("Foodics network error: {}".format(exc)) from exc

        if response.status_code >= 400:
            raise FoodicsError(
                "Foodics rejected order {} ({}): {}".format(order_number, response.status_code, response.text)
            )

        body: Dict[str, Any] = {}
        try:
            body = response.json()
        except ValueError:
            body = {"raw": response.text}

        data = body.get("data") or body
        foodics_id = str(data.get("id") or data.get("uuid") or "")
        return {
            "dry_run": False,
            "dispatched": True,
            "foodics_order_id": foodics_id,
            "payload": payload,
            "response": body,
        }

    def build_payload(
        self,
        *,
        order_number: str,
        location_id: str,
        fulfillment: str,
        customer_name: str,
        customer_phone: str,
        dial_code: str,
        customer_email: str,
        notes: str,
        items: List[CartItemIn],
        total: float,
    ) -> Dict[str, Any]:
        branch_id = self.settings.branch_map.get(location_id)
        if not branch_id:
            raise FoodicsError("No Foodics branch mapped for location '{}'".format(location_id))

        products = [self._map_line(item) for item in items]
        order_type = FOODICS_TYPE.get(fulfillment, FOODICS_TYPE["pickup"])

        payload: Dict[str, Any] = {
            "type": order_type,
            "source": "API",
            "branch_id": branch_id,
            "customer": {
                "name": customer_name,
                "dial_code": dial_code.lstrip("+"),
                "phone": customer_phone,
                "email": customer_email,
            },
            "products": products,
            "notes": "Mihbash web {} — {}".format(order_number, notes or "online order"),
            "meta": {
                "external_number": order_number,
                "channel": "mihbash_web",
            },
        }

        if self.settings.foodics_payment_method_id:
            payload["payments"] = [
                {
                    "payment_method_id": self.settings.foodics_payment_method_id,
                    "amount": round(total, 2),
                    "tendered": round(total, 2),
                }
            ]

        return payload

    def _map_line(self, item: CartItemIn) -> Dict[str, Any]:
        product_id = item.foodicsProductId
        if not product_id:
            raise FoodicsError("SKU {} has no Foodics product id".format(item.sku))

        options: List[Dict[str, Any]] = []
        for modifier in item.modifiers or []:
            modifier_id = modifier.get("foodicsModifierId")
            if not modifier_id:
                continue
            options.append(
                {
                    "modifier_option_id": modifier_id,
                    "quantity": 1,
                    "unit_price": float(modifier.get("price") or 0),
                }
            )

        line: Dict[str, Any] = {
            "product_id": product_id,
            "quantity": item.quantity,
            "unit_price": float(item.unitPrice),
            "discount_percent": 0,
            "notes": item.notes or "",
        }
        if options:
            line["options"] = options
        return line
