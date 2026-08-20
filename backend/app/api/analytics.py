from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import AnalyticsEventIn, AnalyticsSummary
from ..services.analytics import collector

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.post("/events", status_code=202)
def ingest_event(payload: AnalyticsEventIn, db: Session = Depends(get_db)):
    row = collector.ingest(db, payload)
    return {"id": row.id, "accepted": True}


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db)):
    return collector.summary(db)
