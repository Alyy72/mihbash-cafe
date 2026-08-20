from __future__ import annotations

import hashlib
import hmac
from typing import Optional


def verify_hmac_sha256(payload: bytes, signature: str, secret: str) -> bool:
    if not secret or not signature:
        return False
    digest = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    provided = signature.replace("sha256=", "")
    return hmac.compare_digest(digest, provided)


def timing_safe_equals(left: Optional[str], right: Optional[str]) -> bool:
    if not left or not right:
        return False
    return hmac.compare_digest(left, right)
