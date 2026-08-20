from __future__ import annotations

from functools import lru_cache
from typing import Dict, List

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Mihbash Cafe & Dining API"
    environment: str = "development"
    database_url: str = "sqlite:///./data/mihbash.db"
    cors_origins: str = (
        "http://localhost:3000,http://localhost:3001,http://localhost:3010,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3010"
    )

    webhook_secret: str = "dev-webhook-secret"
    tax_rate: float = 0.05
    currency: str = "AED"

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    ziina_api_key: str = ""
    ziina_webhook_secret: str = ""

    foodics_base_url: str = "https://api.foodics.com/v5"
    foodics_api_token: str = Field(
        default="",
        validation_alias=AliasChoices("FOODICS_API_TOKEN", "FOODICS_ACCESS_TOKEN"),
    )
    foodics_payment_method_id: str = ""
    foodics_timeout_seconds: float = 12.0
    foodics_dry_run: bool = True
    staff_token: str = "dev-staff-token"

    # Owner WhatsApp — server-only, never returned to the guest
    whatsapp_owner_number: str = ""
    whatsapp_token: str = ""
    whatsapp_phone_number_id: str = ""
    whatsapp_webhook_url: str = ""
    whatsapp_callmebot_key: str = ""

    collab_inbox_email: str = "mihbashacc@gmail.com"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    resend_api_key: str = ""

    branch_umm_suqeim: str = "FOODICS_BRANCH_UMM"
    branch_marina: str = "FOODICS_BRANCH_MARINA"
    branch_difc: str = "FOODICS_BRANCH_DIFC"
    branch_maryah: str = "FOODICS_BRANCH_MARYAH"

    @property
    def cors_origin_list(self) -> List[str]:
        extras = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3010",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3010",
        ]
        configured = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return list(dict.fromkeys(configured + extras))

    @property
    def branch_map(self) -> Dict[str, str]:
        return {
            "umm-suqeim": self.branch_umm_suqeim,
            "marina": self.branch_marina,
            "difc": self.branch_difc,
            "maryah": self.branch_maryah,
        }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
