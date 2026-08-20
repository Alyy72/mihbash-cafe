from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.analytics import router as analytics_router
from .api.collaborations import router as collaborations_router
from .api.orders import router as orders_router
from .api.place import router as place_router
from .api.pos import router as pos_router
from .api.webhooks import router as webhooks_router
from .config import get_settings
from .database import Base, engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
settings = get_settings()

if settings.database_url.startswith("sqlite"):
    Path("data").mkdir(exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Analytics collector, payment webhooks, and Foodics POS injection for Mihbash Cafe & Dining.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router)
app.include_router(orders_router)
app.include_router(webhooks_router)
app.include_router(pos_router)
app.include_router(collaborations_router)
app.include_router(place_router)


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": settings.app_name,
        "environment": settings.environment,
        "foodics_dry_run": settings.foodics_dry_run or not bool(settings.foodics_api_token),
    }
