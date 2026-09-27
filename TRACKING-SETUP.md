# Pack-DIOSA Order Tracking — Google Sheets Setup

## How It Works

1. You manage orders in a Google Sheet (like a simple database)
2. When a customer orders, you add a row with their order number
3. When the status changes, you update the `current_status` column
4. Customer goes to your website `/track`, enters their order number, sees the full timeline

---

## Step 1: Create the Google Sheet

Create a new Google Sheet with **2 tabs**:

### Tab 1: "Orders" (main tracking data)

| Column | Header | Example | Required |
|--------|--------|---------|----------|
| A | order_number | PD-2026-0047 | Yes |
| B | tracking_number | 1Z999AA10123456784 | No |
| C | carrier | USPS | No |
| D | carrier_tracking_url | https://tools.usps.com/go/TrackConfirmAction?tLabels=... | No |
| E | current_status | in_transit | Yes |
| F | destination | Miami, FL | No |
| G | is_haiti | TRUE | Yes |
| H | estimated_delivery | 2026-10-15 | No |
| I | customer_name | Jean Baptiste | No |
| J | customer_phone | +1234567890 | No |
| K | notes | Container lot #45 | No |
| L | last_updated | 2026-09-27 | No |

### Tab 2: "Events" (status history)

Each time you update a status, add a row here too (this gives the customer a detailed timeline):

| Column | Header | Example |
|--------|--------|---------|
| A | order_number | PD-2026-0047 |
| B | status | in_transit_to_haiti |
| C | description | Package departed Miami port on cargo vessel |
| D | timestamp | 2026-09-27 14:30 |
| E | location | Miami, FL |
| F | carrier | Tropical Shipping |

---

## Step 2: Publish the Sheet

1. Open your Google Sheet
2. Go to **File > Share > Publish to web**
3. Select **Entire document** and **CSV** format
4. Click **Publish**
5. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

### Get the tab GIDs:

- Click on the "Orders" tab → look at URL: `...gid=0` → GID is `0`
- Click on the "Events" tab → look at URL: `...gid=123456789` → note the GID number

---

## Step 3: Set Environment Variables

Add these to your `.env.local` file (or Vercel dashboard):

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id_here
GOOGLE_SHEETS_ORDERS_GID=0
GOOGLE_SHEETS_EVENTS_GID=your_events_tab_gid
```

---

## Status Codes Reference

### US Domestic Orders

| Status Key | What Customer Sees |
|-----------|-------------------|
| `order_received` | Order Received |
| `preparing` | Preparing Shipment |
| `shipped` | Shipped |
| `in_transit` | In Transit |
| `out_for_delivery` | Out for Delivery |
| `delivered` | Delivered |

### Haiti Orders (set `is_haiti` = TRUE)

| Status Key | What Customer Sees |
|-----------|-------------------|
| `order_received` | Order Received |
| `preparing` | Preparing Shipment |
| `shipped` | Shipped |
| `in_transit_to_haiti` | In Transit to Haiti |
| `arrived_at_port` | Arrived at Port |
| `douane_declaration` | Douane — Declaration Filed |
| `douane_verification` | Douane — Inspection |
| `douane_liquidation` | Douane — Duties & Taxes |
| `douane_cleared` | Douane — Cleared |
| `out_for_delivery` | Out for Delivery |
| `delivered` | Delivered |

### Special Statuses

| Status Key | What Customer Sees |
|-----------|-------------------|
| `canceled` | Canceled |

---

## Example: Adding a New Order

1. Customer places order for Container Lot #45 going to Haiti
2. Add row to **Orders** tab:
   - A: `PD-2026-0047`
   - E: `order_received`
   - F: `Port-au-Prince`
   - G: `TRUE`
   - I: `Jean Baptiste`
   - J: `+50937001234`

3. Add row to **Events** tab:
   - A: `PD-2026-0047`
   - B: `order_received`
   - C: `Order confirmed — Container Lot #45 (Ladies Apparel)`
   - D: `2026-09-27 10:00`
   - E: `Miami, FL`

4. When shipment departs, update **Orders** E column to `in_transit_to_haiti` and add new **Events** row

---

## Tips

- Always use the exact status keys listed above (lowercase with underscores)
- The Events tab is optional but gives customers a much better experience
- The sheet refreshes every 30 seconds on the website
- You can add as many Events rows per order as you want
- The `is_haiti` column controls which tracking pipeline the customer sees (6 steps for US, 11 steps for Haiti)
