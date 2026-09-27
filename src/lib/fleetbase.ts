/**
 * Fleetbase API client for Pack-DIOSA logistics tracking.
 *
 * Queries the Fleetbase Fleet-Ops API for order/shipment status and
 * falls back to Spree fulfillment data when Fleetbase is unavailable.
 */

const FLEETBASE_API_URL =
  process.env.FLEETBASE_API_URL || "http://localhost:8000";
const FLEETBASE_API_KEY = process.env.FLEETBASE_API_KEY || "";

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
  "picked_up",
  "in_transit_to_haiti",
  "customs_clearance",
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
  picked_up: "Picked Up",
  in_transit_to_haiti: "In Transit to Haiti",
  customs_clearance: "Customs Clearance",
  canceled: "Canceled",
  ready: "Ready for Shipment",
  pending: "Processing",
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

/**
 * Query Fleetbase API for tracking info by order number or tracking number.
 * Returns null if Fleetbase is unavailable or the order is not found.
 */
async function queryFleetbase(
  identifier: string,
): Promise<TrackingResult | null> {
  if (!FLEETBASE_API_KEY) return null;

  try {
    const res = await fetch(
      `${FLEETBASE_API_URL}/api/v1/orders?query=${encodeURIComponent(identifier)}`,
      {
        headers: {
          Authorization: `Bearer ${FLEETBASE_API_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 30 },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    const order = data?.data?.[0];
    if (!order) return null;

    const isHaiti =
      order.payload?.dropoff?.country === "HT" || order.meta?.is_haiti === true;

    const events: TrackingEvent[] = (order.tracking_statuses || []).map(
      (ts: {
        status: string;
        details: string;
        created_at: string;
        city?: string;
        country?: string;
      }) => ({
        status: ts.status,
        label: getStatusLabel(ts.status),
        description: ts.details || "",
        timestamp: ts.created_at,
        location: [ts.city, ts.country].filter(Boolean).join(", ") || undefined,
      }),
    );

    return {
      found: true,
      orderNumber: order.tracking_number?.order_number || identifier,
      trackingNumber: order.tracking_number?.tracking_number || null,
      carrier: order.facilitator?.name || null,
      carrierTrackingUrl: order.tracking_number?.tracking_url || null,
      currentStatus: order.status || "pending",
      estimatedDelivery: order.scheduled_at || null,
      events,
      destination: order.payload?.dropoff?.city || null,
      isHaitiOrder: isHaiti,
    };
  } catch {
    return null;
  }
}

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

  // Order placed
  events.push({
    status: "order_received",
    label: "Order Received",
    description: `Order ${order.number} confirmed`,
    timestamp: order.completed_at,
  });

  // Map Spree fulfillment status to tracking events
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

  // Map Spree status to our pipeline status
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

/**
 * Look up tracking info. Tries Fleetbase first, falls back to Spree data.
 */
export async function getTracking(
  identifier: string,
): Promise<TrackingResult | null> {
  // Try Fleetbase first
  const fleetbaseResult = await queryFleetbase(identifier);
  if (fleetbaseResult) return fleetbaseResult;

  // Fleetbase unavailable — caller should fall back to Spree data
  return null;
}
