from __future__ import annotations

import logging
import uuid
from threading import Thread
from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from ..config import Settings, get_settings
from ..database import get_db
from ..models import Collaboration
from ..schemas import CollaborationIn, CollaborationOut, CollaborationPublicOut, CollaborationStatusIn
from ..security import timing_safe_equals
from ..services.email import notify_inbox
from ..services.whatsapp import notify_owner

router = APIRouter(prefix="/api/v1/collaborations", tags=["collaborations"])
logger = logging.getLogger("mihbash.collab")


def serialize(row: Collaboration) -> CollaborationOut:
    return CollaborationOut(
        id=row.id,
        reference=row.reference,
        name=row.name,
        brand=row.brand,
        email=row.email,
        phone=row.phone,
        instagram=row.instagram,
        type=row.type,
        message=row.message,
        language=row.language,
        status=row.status,
        staffNotes=row.staff_notes,
        createdAt=row.created_at.isoformat() + "Z",
    )


def require_staff(
    x_staff_token: str = Header(default=""),
    settings: Settings = Depends(get_settings),
):
    if not timing_safe_equals(x_staff_token, settings.staff_token):
        raise HTTPException(status_code=401, detail="Invalid staff token")
    return True


def make_reference() -> str:
    return "MBC-" + uuid.uuid4().hex[:6].upper()


@router.post("", response_model=CollaborationPublicOut, status_code=201)
def create_inquiry(
    payload: CollaborationIn,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    row = Collaboration(
        id=str(uuid.uuid4()),
        reference=make_reference(),
        name=payload.name.strip(),
        brand=payload.brand.strip(),
        email=payload.email.strip(),
        phone=payload.phone.strip(),
        instagram=payload.instagram.strip(),
        type=payload.type,
        message=payload.message.strip(),
        language=payload.language,
        status="new",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    db.expunge(row)
    Thread(target=_notify_house, args=(settings, row), daemon=True).start()
    return CollaborationPublicOut(id=row.id, reference=row.reference, status=row.status)


def _notify_house(settings: Settings, row: Collaboration) -> None:
    try:
        notify_inbox(settings, row)
    except Exception:
        logger.exception("Collab email notify failed for %s", row.reference)
    try:
        notify_owner(settings, row)
    except Exception:
        logger.exception("Collab WhatsApp notify failed for %s", row.reference)


@router.get("", response_model=List[CollaborationOut])
def list_inquiries(
    _: bool = Depends(require_staff),
    db: Session = Depends(get_db),
):
    rows = db.query(Collaboration).order_by(Collaboration.created_at.desc()).all()
    return [serialize(row) for row in rows]


@router.patch("/{inquiry_id}", response_model=CollaborationOut)
def update_inquiry(
    inquiry_id: str,
    payload: CollaborationStatusIn,
    _: bool = Depends(require_staff),
    db: Session = Depends(get_db),
):
    row = db.get(Collaboration, inquiry_id)
    if not row:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    row.status = payload.status
    if payload.staff_notes is not None:
        row.staff_notes = payload.staff_notes
    db.commit()
    db.refresh(row)
    return serialize(row)
