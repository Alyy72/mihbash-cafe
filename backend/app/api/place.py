from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/place", tags=["place"])

PLATFORMS = [
    {
        "id": "beanz",
        "name": "BEANZ",
        "href": "https://www.beanz.ae/",
    },
    {
        "id": "talabat",
        "name": "Talabat",
        "href": "https://www.talabat.com/uae/al-mihbash-jumeriah",
    },
    {
        "id": "deliveroo",
        "name": "Deliveroo",
        "href": "https://deliveroo.ae/menu/dubai/umm-suqeim-1/al-mihbash-bubble-tea-jumeirah",
    },
]


@router.get("")
def place_info():
    return {
        "name": "Mihbash Cafe & Dining",
        "nameAr": "مهباش",
        "hours": {"open": "08:00", "close": "02:00", "everyday": True},
        "address": "651 – 1, Umm Suqeim / Jumeirah Road, Dubai",
        "phone": "+971 4 552 4904",
        "instagram": "https://www.instagram.com/mihbash.ae",
        "maps": "https://maps.app.goo.gl/w7bGyeHbyBX3kdUCA",
        "rating": 4.8,
        "reviewCount": 161,
        "platforms": PLATFORMS,
    }
