import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/fleetbase
 *
 * Receives tracking status updates from Fleetbase when shipment
 * status changes (via Shippo carrier webhooks or manual updates).
 *
 * Use cases:
 * - Carrier tracking updates (USPS/UPS/FedEx via Shippo)
 * - Manual Haiti delivery status changes from Fleetbase dashboard
 *
 * Future: trigger WhatsApp notifications on status changes.
 */

const FLEETBASE_WEBHOOK_SECRET = process.env.FLEETBASE_WEBHOOK_SECRET || "";

function verifySignature(payload: string, signature: string | null): boolean {
  if (!FLEETBASE_WEBHOOK_SECRET || !signature) return false;
  try {
    const expected = crypto
      .createHmac("sha256", FLEETBASE_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

interface FleetbaseWebhookPayload {
  event: string;
  data: {
    id: string;
    status: string;
    internal_id?: string;
    tracking_number?: {
      tracking_number?: string;
      order_number?: string;
      tracking_url?: string;
    };
    tracking_statuses?: Array<{
      status: string;
      details: string;
      created_at: string;
      city?: string;
      country?: string;
    }>;
    meta?: {
      spree_order_number?: string;
      email?: string;
      is_haiti?: boolean;
    };
    payload?: {
      dropoff?: {
        city?: string;
        country?: string;
      };
    };
  };
}

// Status changes that should trigger customer notifications
const NOTIFICATION_STATUSES = new Set([
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "customs_clearance",
]);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify signature if secret is configured
  if (FLEETBASE_WEBHOOK_SECRET) {
    const signature =
      request.headers.get("x-fleetbase-signature") ||
      request.headers.get("x-webhook-signature");
    if (!verifySignature(rawBody, signature)) {
      console.warn("[webhook:fleetbase] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: FleetbaseWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = payload;
  const orderRef = data.meta?.spree_order_number || data.internal_id || data.id;

  console.log(
    `[webhook:fleetbase] Event: ${event}, Order: ${orderRef}, Status: ${data.status}`,
  );

  switch (event) {
    case "order.status_changed":
    case "order.updated": {
      // Log the status change
      console.log(
        `[webhook:fleetbase] Order ${orderRef} status → ${data.status}`,
      );

      // Check if this status should trigger a notification
      if (NOTIFICATION_STATUSES.has(data.status)) {
        // TODO: WhatsApp Business API notification
        // await sendWhatsAppNotification({
        //   phone: data.meta?.phone,
        //   orderNumber: orderRef,
        //   status: data.status,
        //   trackingNumber: data.tracking_number?.tracking_number,
        // });
        console.log(
          `[webhook:fleetbase] Would notify customer for ${orderRef} → ${data.status}`,
        );
      }

      return NextResponse.json({
        status: "ok",
        action: "status_updated",
        order: orderRef,
        newStatus: data.status,
      });
    }

    case "tracking.updated": {
      // Carrier tracking update via Shippo
      const latestStatus =
        data.tracking_statuses?.[data.tracking_statuses.length - 1];
      console.log(
        `[webhook:fleetbase] Tracking update for ${orderRef}: ${latestStatus?.status} — ${latestStatus?.details}`,
      );

      return NextResponse.json({
        status: "ok",
        action: "tracking_updated",
        order: orderRef,
        latestStatus: latestStatus?.status,
      });
    }

    default:
      return NextResponse.json({ status: "ok", action: "ignored", event });
  }
}
