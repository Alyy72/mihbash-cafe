# Mihbash Cafe & Dining

Specialty cafe and restaurant platform for **Mihbash Cafe & Dining · مهباش**. Guests browse a daily board, compose custom drinks and plates, and check out online. A FastAPI service collects product analytics, verifies payment webhooks, and injects paid tickets into Foodics so the kitchen screen updates without re-entry.

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS 4
- **Backend:** FastAPI, SQLAlchemy, SQLite (swap the URL for Postgres in production)
- **Payments:** Stripe, Ziina, and a local demo gateway behind one interface
- **POS:** Foodics REST API v5 (`POST /orders`)

## Directory structure

```text
cafe-website/
├── docker-compose.yml
├── README.md
├── frontend/                          # Next.js app
│   ├── app/
│   │   ├── page.tsx                   # House / brand story
│   │   ├── menu/page.tsx              # Live daily menu
│   │   ├── locations/page.tsx
│   │   ├── collaborate/page.tsx
│   │   ├── team/page.tsx
│   │   ├── events/page.tsx            # Monthly calendar
│   │   ├── shop/page.tsx              # Beans, merch, gear
│   │   ├── builder/page.tsx           # Custom drink & dish builder
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── order/confirmation/[id]/   # Receipt
│   ├── components/
│   ├── lib/
│   │   ├── data/                      # Menu, shop, builder, rooms
│   │   ├── cart.ts                    # Zustand bag
│   │   ├── api.ts
│   │   └── analytics.ts
│   └── .env.example
└── backend/                           # FastAPI app
    ├── app/
    │   ├── main.py
    │   ├── api/
    │   │   ├── analytics.py           # Event ingest + analyst summary
    │   │   ├── orders.py              # Checkout
    │   │   ├── webhooks.py            # Stripe / Ziina / mock
    │   │   └── pos.py                 # Manual Foodics re-inject
    │   └── services/
    │       ├── analytics.py
    │       ├── payments.py
    │       ├── foodics.py             # POS payload + inject
    │       └── dispatch.py            # Paid → Foodics
    ├── requirements.txt
    └── .env.example
```

## Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`NEXT_PUBLIC_API_URL` must point at the FastAPI process (default `http://localhost:8000`).

| Route | Purpose |
| --- | --- |
| `/` | Mission, story, offerings, core dishes, upcoming concepts, best sellers |
| `/menu` | Daily catalog with category and tag filters |
| `/builder` | Custom drink / plate with live pricing |
| `/shop` | Retail catalog and bag |
| `/events` | Month calendar |
| `/locations` | Visit: map, reviews, hours, Talabat / Deliveroo / BEANZ |
| `/collaborate` | Brand / creator inquiry form |
| `/team` | Heads of department |
| `/checkout` | Customer, room, gateway |
| `/order/confirmation/[id]` | Receipt + print |
| `/staff` | Collaboration inbox (staff token) |

## Backend setup

Python 3.11+ is recommended (3.9 works with the pinned requirements).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
mkdir -p data
uvicorn app.main:app --reload --port 8000
```

Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v1/analytics/events` | Collect page views, custom builds, cart, purchase |
| `GET /api/v1/analytics/summary` | Funnel, popular SKUs, popular drink signatures |
| `POST /api/v1/orders` | Create order, start payment, auto-dispatch on demo capture |
| `GET /api/v1/orders/{id}` | Confirmation + receipt |
| `POST /api/v1/webhooks/stripe` | Verify Stripe, mark paid, inject Foodics |
| `POST /api/v1/webhooks/ziina` | HMAC verify, then the same dispatch |
| `POST /api/v1/pos/foodics/inject/{id}` | Replay a paid ticket onto the KDS |
| `POST /api/v1/collaborations` | Public collaboration inquiry |
| `GET /api/v1/collaborations` | Staff inbox (`X-Staff-Token`) |
| `GET /api/v1/place` | Hours, map, Talabat / Deliveroo / BEANZ |

## Foodics POS injection

After payment succeeds, `backend/app/services/foodics.py` maps each bag line onto a Foodics product (and modifiers for custom builds), then `POST`s to `{FOODICS_BASE_URL}/orders`.

1. Create API credentials in the Foodics dashboard.
2. Put the bearer token in `FOODICS_API_TOKEN`.
3. Replace `BRANCH_*` and each `foodicsProductId` in the frontend catalogs with real UUIDs.
4. Set `FOODICS_PAYMENT_METHOD_ID` to the “already paid / online” tender.
5. Set `FOODICS_DRY_RUN=false`.

Until a token is present, the service stores the **exact** payload it would send (`foodics_dry_run: true`) so you can inspect tickets locally.

Custom drinks use product `FOODICS_CUSTOM_DRINK` plus modifier option IDs (`MOD_BEAN_*`, `MOD_MILK_*`, …). Custom plates use `FOODICS_CUSTOM_DISH`.

# Payments — leave empty until live credentials are confirmed. Mock gateway works locally.
- **mock** — confirms immediately and dispatches to Foodics (dry-run unless a token is set). Default for local work.
- **stripe** — requires `STRIPE_SECRET_KEY`; creates a PaymentIntent; `POST /api/v1/webhooks/stripe` completes the order.
- **ziina** — requires `ZIINA_API_KEY`; returns a hosted checkout URL; `POST /api/v1/webhooks/ziina` completes the order.

Webhook replay is idempotent (`webhook_events.event_id`).

## Docker

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

The frontend image builds with `npm run start`. Local `npm run dev` does not need Docker.

## Production notes

- Move `DATABASE_URL` to Postgres.
- Restrict `CORS_ORIGINS`.
- Rotate `WEBHOOK_SECRET`, Stripe, Ziina, and Foodics tokens.
- Keep Foodics product IDs in a mapping table rather than frontend literals once the catalog is live.
