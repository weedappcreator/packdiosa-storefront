# Pack-DIOSA Logistics & Multi-Vendor Plan

## Architecture

```
Spree Commerce (Orders + Vendors) → Fleetbase (Logistics/Dispatch/Tracking) → Carriers (USPS/UPS/FedEx via Shippo + Manual Haiti)
                                                    ↓
                                    Storefront (Vercel) — /track page + /account/orders tracking
```

## Status: In Progress

### Completed
- [x] Spree storefront deployed on Vercel (packdiosa-storefront.vercel.app)
- [x] Spree backend at https://packdiosa.spree.sh
- [x] Full Pack-DIOSA dark+gold rebrand (77 files)
- [x] GSAP scroll animations + Lenis smooth scroll
- [x] CRO components (TrustSignals, PricingLadder)
- [x] Shippo API key configured
- [x] Build /track page on storefront (public tracking lookup)
- [x] Build tracking in /account/orders/[id] (inline OrderTimeline)
- [x] Fleetbase API client + Spree fallback (src/lib/fleetbase.ts)
- [x] Spree → Fleetbase webhook sync (src/lib/webhooks/fleetbase-sync.ts)
- [x] Fleetbase inbound webhook (src/app/api/webhooks/fleetbase/route.ts)
- [x] Track Order nav links (header, footer, mobile menu, 5 locales)
- [x] Deploy Fleetbase backend via Docker (6/7 services running on localhost:8000)

### TODO
- [ ] Fleetbase console (dashboard :4200) — retry Docker build (npm network timeout)
- [ ] Configure Shippo carriers in Fleetbase dashboard
- [ ] Set FLEETBASE_API_KEY + FLEETBASE_API_URL env vars on Vercel
- [ ] Enable multi-vendor marketplace in Spree admin
- [ ] Haiti manual workflow in Fleetbase dashboard
- [ ] WhatsApp Business API notifications (Phase 5)

## Credentials & Endpoints

| Service | URL | Key |
|---------|-----|-----|
| Spree Storefront | https://packdiosa-storefront.vercel.app | — |
| Spree API | https://packdiosa.spree.sh | pk_kh81LHAUudVhGFAB5v2afYug |
| Shippo | via API | REMOVED_SEE_LOCAL_KEYS |
| Fleetbase | http://localhost:4200 (dashboard), :8000 (API) | TBD after deploy |
| GitHub | github.com/weedappcreator/packdiosa-storefront | — |

## 1. Deploy Fleetbase

```bash
git clone https://github.com/fleetbase/fleetbase.git ~/fleetbase
cd ~/fleetbase
docker compose up -d
```

Dashboard: http://localhost:4200
API: http://localhost:8000

## 2. Connect Shippo in Fleetbase

1. Fleetbase Dashboard → Fleet-Ops → Settings → Integrations
2. Add Shippo as carrier provider
3. Paste API key: REMOVED_SEE_LOCAL_KEYS
4. Enable carriers: USPS, UPS, FedEx (cheapest auto-selected by Shippo)

## 3. Spree → Fleetbase Webhooks

In Spree Admin (https://packdiosa.spree.sh/admin):
1. Settings → Webhooks → Create new
2. URL: http://your-fleetbase-public-url/api/v1/webhooks/spree
3. Events: order.completed, shipment.shipped, shipment.ready
4. Generate webhook secret, save it

In Fleetbase:
1. Fleet-Ops → Settings → Integrations → Add Spree source
2. Paste webhook secret

## 4. Enable Multi-Vendor in Spree

1. Spree Admin → Settings → General → Marketplace
2. Enable multi-vendor marketplace
3. Set commission rate (e.g., 15%)
4. Vendors → Invite Vendor (each gets own dashboard)

Features: separate dashboards, per-vendor catalogs, commission engine, payouts, seller onboarding

## 5. Build Tracking UI (Next Conversation)

### Public /track page
- Input field for tracking number
- Query Fleetbase API for status
- Show timeline: Ordered → Shipped → In Transit → Delivered
- Link to carrier tracking page (USPS/UPS/FedEx)

### Account /orders/[id] tracking
- Auto-populated from Spree order → Fleetbase tracking
- Real-time status updates
- Carrier tracking number displayed

### Haiti Manual Workflow
- Orders flagged as Haiti destination
- You manually update status in Fleetbase dashboard:
  1. Picked up
  2. In transit to Haiti
  3. Customs clearance
  4. Out for delivery
  5. Delivered
- Customer sees updates on /track page in real-time

## Shipping Carrier Recommendations

| Carrier | Best For | Via |
|---------|----------|-----|
| USPS | Small packages < 70 lbs | Shippo |
| UPS Ground | Heavy/bulk, pallets | Shippo |
| FedEx Ground | Mid-range, reliable | Shippo |
| Manual | Haiti international | Fleetbase dashboard |
