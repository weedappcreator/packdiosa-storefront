/**
 * Pack-DIOSA Order Tracking — Google Sheets backend.
 *
 * The client manages a Google Sheet with order tracking data.
 * This module reads from the published sheet (no auth needed)
 * and returns TrackingResult objects for the /track page and
 * account order detail pages.
 *
 * Google Sheet columns (row 1 = headers):
 *   A: order_number        (e.g. "PD-2026-0047" or Spree "R123456789")
 *   B: tracking_number     (carrier tracking, optional)
 *   C: carrier             (USPS, UPS, FedEx, Manual, etc.)
 *   D: carrier_tracking_url (optional link)
 *   E: current_status      (pipeline status key)
 *   F: destination         (city or "Haiti")
 *   G: is_haiti            (TRUE/FALSE)
 *   H: estimated_delivery  (date string, optional)
 *   I: customer_name       (for reference)
 *   J: customer_phone      (for WhatsApp notifications)
 *   K: notes               (internal notes)
 *   L: last_updated        (auto-timestamp)
 *
 * Events Sheet (tab "Events") — one row per status change:
 *   A: order_number
 *   B: status              (pipeline status key)
 *   C: description         (what happened)
 *   D: timestamp           (date/time)
 *   E: location            (city, country)
 *   F: carrier             (optional)
 */

// Google Sheets "published to web" CSV endpoint — no API key needed
// Uses the /pub endpoint which works without authentication
const SHEET_PUB_ID = process.env.GOOGLE_SHEETS_PUB_ID || "";
const SHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
const ORDERS_GID = process.env.GOOGLE_SHEETS_ORDERS_GID || "0";
const EVENTS_GID = process.env.GOOGLE_SHEETS_EVENTS_GID || "";

function sheetCsvUrl(gid: string): string {
  // Prefer the /pub URL (works without auth when sheet is published to web)
  if (SHEET_PUB_ID) {
    return `https://docs.google.com/spreadsheets/d/e/${SHEET_PUB_ID}/pub?gid=${gid}&single=true&output=csv`;
  }
  // Fallback to /export URL (requires sheet to be shared publicly)
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

// ─── Interfaces ──────────────────────────────────────────────

export interface TrackingEvent {
  status: string;
  label: string;
  description: string;
  timestamp: string | null;
  location?: string;
  carrier?: string;
}

export interface TrackingResult {
  found: boolean;
  orderNumber: string;
  trackingNumber: string | null;
  carrier: string | null;
  carrierTrackingUrl: string | null;
  currentStatus: string;
  estimatedDelivery: string | null;
  events: TrackingEvent[];
  destination: string | null;
  isHaitiOrder: boolean;
}

// ─── Status Pipelines ────────────────────────────────────────

const STATUS_PIPELINE = [
  "order_received",
  "preparing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;

const HAITI_STATUS_PIPELINE = [
  "order_received",
  "preparing",
  "shipped",
  "in_transit_to_haiti",
  "arrived_at_port",
  "douane_declaration",
  "douane_verification",
  "douane_liquidation",
  "douane_cleared",
  "out_for_delivery",
  "delivered",
] as const;

type StatusStep = (typeof STATUS_PIPELINE)[number];
type HaitiStatusStep = (typeof HAITI_STATUS_PIPELINE)[number];

const STATUS_LABELS: Record<string, string> = {
  order_received: "Order Received",
  preparing: "Preparing Shipment",
  shipped: "Shipped",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  // Haiti-specific
  in_transit_to_haiti: "In Transit to Haiti",
  arrived_at_port: "Arrived at Port",
  douane_declaration: "Douane — Declaration Filed",
  douane_verification: "Douane — Inspection",
  douane_liquidation: "Douane — Duties & Taxes",
  douane_cleared: "Douane — Cleared",
  // Misc
  canceled: "Canceled",
  ready: "Ready for Shipment",
  pending: "Processing",
  // Keep old keys working
  picked_up: "Picked Up",
  customs_clearance: "Customs Clearance",
};

export function getStatusLabel(status: string): string {
  return (
    STATUS_LABELS[status] ||
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function getStatusPipeline(isHaiti: boolean): readonly string[] {
  return isHaiti ? HAITI_STATUS_PIPELINE : STATUS_PIPELINE;
}

export function getStatusIndex(status: string, isHaiti: boolean): number {
  const pipeline = getStatusPipeline(isHaiti);
  const idx = pipeline.indexOf(status as StatusStep & HaitiStatusStep);
  return idx >= 0 ? idx : -1;
}

// ─── CSV Parsing ─────────────────────────────────────────────

function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(csv: string): string[][] {
  const lines = csv.split("\n").filter((line) => line.trim());
  return lines.map(parseCsvRow);
}

// ─── Google Sheets Query ─────────────────────────────────────

async function fetchSheet(gid: string): Promise<string[][] | null> {
  if (!SHEET_PUB_ID && !SHEET_ID) return null;

  try {
    const res = await fetch(sheetCsvUrl(gid), {
      redirect: "follow",
      next: { revalidate: 15 }, // refresh every 15s for near-real-time updates
    });
    if (!res.ok) return null;
    const csv = await res.text();
    // Guard against HTML responses (e.g. Google error pages)
    if (csv.trimStart().startsWith("<!")) return null;
    const rows = parseCsv(csv);
    // Auto-detect the header row — the XLSX template has title/subtitle/spacer
    // rows before the actual column headers. Find the row that starts with
    // "ORDER" or "order_number" and skip everything up to and including it.
    const headerIdx = rows.findIndex((r) => {
      const first = (r[0] || "").toUpperCase().trim();
      return (
        first === "ORDER #" ||
        first === "ORDER_NUMBER" ||
        first === "ORDER NUMBER"
      );
    });
    return headerIdx >= 0 ? rows.slice(headerIdx + 1) : rows.slice(1);
  } catch {
    return null;
  }
}

/**
 * Query Google Sheets for tracking info by order number or tracking number.
 */
async function queryGoogleSheets(
  identifier: string,
): Promise<TrackingResult | null> {
  const rows = await fetchSheet(ORDERS_GID);
  if (!rows) return null;

  const normalizedId = identifier.toUpperCase().trim();

  // Find matching row (column A = order_number, column B = tracking_number)
  const row = rows.find((r) => {
    const orderNum = (r[0] || "").toUpperCase().trim();
    const trackingNum = (r[1] || "").toUpperCase().trim();
    return orderNum === normalizedId || trackingNum === normalizedId;
  });

  if (!row) return null;

  const orderNumber = row[0] || identifier;
  const trackingNumber = row[1] || null;
  const carrier = row[2] || null;
  const carrierTrackingUrl = row[3] || null;
  const currentStatus = row[4] || "order_received";
  const destination = row[5] || null;
  const isHaiti = (row[6] || "").toUpperCase() === "TRUE";
  const estimatedDelivery = row[7] || null;

  // Fetch events from Events tab
  const events = await fetchEvents(orderNumber);

  return {
    found: true,
    orderNumber,
    trackingNumber,
    carrier,
    carrierTrackingUrl,
    currentStatus,
    estimatedDelivery,
    events,
    destination,
    isHaitiOrder: isHaiti,
  };
}

/**
 * Fetch tracking events from the Events sheet tab.
 */
async function fetchEvents(orderNumber: string): Promise<TrackingEvent[]> {
  if (!EVENTS_GID) {
    // No events tab configured — generate events from current status
    return [];
  }

  const rows = await fetchSheet(EVENTS_GID);
  if (!rows) return [];

  const normalizedOrder = orderNumber.toUpperCase().trim();

  return rows
    .filter((r) => (r[0] || "").toUpperCase().trim() === normalizedOrder)
    .map((r) => ({
      status: r[1] || "",
      label: getStatusLabel(r[1] || ""),
      description: r[2] || "",
      timestamp: r[3] || null,
      location: r[4] || undefined,
      carrier: r[5] || undefined,
    }));
}

// ─── Spree Fallback ──────────────────────────────────────────

/**
 * Build tracking result from Spree fulfillment data (fallback).
 */
export function buildTrackingFromSpree(order: {
  number: string;
  completed_at: string | null;
  fulfillment_status: string | null;
  fulfillments?: Array<{
    status: string;
    tracking?: string | null;
    tracking_url?: string | null;
    fulfilled_at?: string | null;
    delivered_at?: string | null;
    delivery_method?: { name: string } | null;
    stock_location?: { name: string } | null;
  }>;
  shipping_address?: {
    country?: string | null;
    city?: string | null;
  } | null;
}): TrackingResult {
  const fulfillment = order.fulfillments?.[0];
  const isHaiti = order.shipping_address?.country === "HT";

  const events: TrackingEvent[] = [];

  events.push({
    status: "order_received",
    label: "Order Received",
    description: `Order ${order.number} confirmed`,
    timestamp: order.completed_at,
  });

  if (fulfillment) {
    const spreeStatus = fulfillment.status;

    if (
      spreeStatus === "ready" ||
      spreeStatus === "shipped" ||
      spreeStatus === "delivered"
    ) {
      events.push({
        status: "preparing",
        label: "Preparing Shipment",
        description: "Your order is being prepared for shipment",
        timestamp: order.completed_at,
      });
    }

    if (spreeStatus === "shipped" || spreeStatus === "delivered") {
      events.push({
        status: "shipped",
        label: "Shipped",
        description: fulfillment.tracking
          ? `Tracking: ${fulfillment.tracking}`
          : "Package has been shipped",
        timestamp: fulfillment.fulfilled_at || null,
        carrier: fulfillment.delivery_method?.name,
      });

      events.push({
        status: "in_transit",
        label: "In Transit",
        description: `Shipped via ${fulfillment.delivery_method?.name || "carrier"}`,
        timestamp: fulfillment.fulfilled_at || null,
      });
    }

    if (spreeStatus === "delivered") {
      events.push({
        status: "delivered",
        label: "Delivered",
        description: "Package has been delivered",
        timestamp: fulfillment.delivered_at || null,
      });
    }
  }

  let currentStatus = "order_received";
  if (fulfillment) {
    switch (fulfillment.status) {
      case "ready":
        currentStatus = "preparing";
        break;
      case "shipped":
        currentStatus = "in_transit";
        break;
      case "delivered":
        currentStatus = "delivered";
        break;
      case "canceled":
        currentStatus = "canceled";
        break;
      default:
        currentStatus = "order_received";
    }
  }

  return {
    found: true,
    orderNumber: order.number,
    trackingNumber: fulfillment?.tracking || null,
    carrier: fulfillment?.delivery_method?.name || null,
    carrierTrackingUrl: fulfillment?.tracking_url || null,
    currentStatus,
    estimatedDelivery: null,
    events,
    destination: order.shipping_address?.city || null,
    isHaitiOrder: isHaiti,
  };
}

// ─── Main Lookup ─────────────────────────────────────────────

/**
 * Look up tracking info. Tries Google Sheets first, falls back to Spree data.
 */
export async function getTracking(
  identifier: string,
): Promise<TrackingResult | null> {
  const sheetsResult = await queryGoogleSheets(identifier);
  if (sheetsResult) return sheetsResult;

  // Google Sheets unavailable — caller should fall back to Spree data
  return null;
}
