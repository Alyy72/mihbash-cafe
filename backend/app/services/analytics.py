from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any, Dict, List

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import AnalyticsEvent
from ..schemas import AnalyticsEventIn, AnalyticsSummary


class AnalyticsCollector:
    """Append-only event store for product, traffic, and custom-build analytics."""

    def ingest(self, db: Session, payload: AnalyticsEventIn) -> AnalyticsEvent:
        row = AnalyticsEvent(
            event=payload.event,
            path=payload.path,
            session_id=payload.session_id,
            occurred_at=payload.occurred_at or datetime.utcnow(),
            user_agent=payload.user_agent,
            referrer=payload.referrer,
            properties=payload.properties,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row

    def summary(self, db: Session) -> AnalyticsSummary:
        total = db.scalar(select(func.count(AnalyticsEvent.id))) or 0
        sessions = db.scalar(select(func.count(func.distinct(AnalyticsEvent.session_id)))) or 0

        by_event_rows = db.execute(
            select(AnalyticsEvent.event, func.count(AnalyticsEvent.id)).group_by(AnalyticsEvent.event)
        ).all()
        by_event = {name: count for name, count in by_event_rows}

        menu_skus: Counter[str] = Counter()
        builds: Counter[str] = Counter()

        events: List[AnalyticsEvent] = list(
            db.scalars(
                select(AnalyticsEvent).where(
                    AnalyticsEvent.event.in_(
                        ["add_to_cart", "custom_build_add", "custom_build_change", "purchase", "menu_item_view"]
                    )
                )
            )
        )
        for event in events:
            props: Dict[str, Any] = event.properties or {}
            sku = props.get("sku")
            if sku:
                menu_skus[str(sku)] += 1
            configuration = props.get("configuration")
            if isinstance(configuration, dict):
                key = "{mode}:{base}:{bean}:{milk}:{temp}".format(
                    mode=configuration.get("mode"),
                    base=configuration.get("baseId") or configuration.get("grainId"),
                    bean=configuration.get("beanId"),
                    milk=configuration.get("milkId") or configuration.get("proteinId"),
                    temp=configuration.get("temperatureId") or configuration.get("sauceId"),
                )
                builds[key] += 1

        funnel_keys = ["page_view", "add_to_cart", "checkout_start", "checkout_submit", "purchase"]
        checkout_funnel = {key: by_event.get(key, 0) for key in funnel_keys}

        return AnalyticsSummary(
            total_events=total,
            unique_sessions=sessions,
            by_event=by_event,
            popular_menu_skus=[{"sku": sku, "count": count} for sku, count in menu_skus.most_common(10)],
            popular_custom_builds=[{"signature": sig, "count": count} for sig, count in builds.most_common(10)],
            checkout_funnel=checkout_funnel,
        )


collector = AnalyticsCollector()
