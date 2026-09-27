import { type NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/spree";
import {
  buildTrackingFromSpree,
  getTracking,
  type TrackingResult,
} from "@/lib/tracking";

/**
 * Public tracking lookup API.
 * GET /api/track?q=ORDER_NUMBER_OR_TRACKING
 *
 * Tries Google Sheets first, then falls back to Spree order data.
 * No authentication required — customers look up by order number.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: "Please enter a valid order or tracking number." },
      { status: 400 },
    );
  }

  // 1) Try Google Sheets
  let result: TrackingResult | null = await getTracking(query);
  if (result) {
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  // 2) Fall back to Spree order lookup
  try {
    const client = getClient();
    // Try looking up by order number (Spree format: R123456789)
    const orderNumber = query.startsWith("R") ? query : `R${query}`;

    const order = await client.orders
      .get(orderNumber, {
        expand: ["fulfillments", "shipping_address"],
      })
      .catch(() => null);

    if (order && order.completed_at) {
      result = buildTrackingFromSpree(order);
      return NextResponse.json(result);
    }
  } catch {
    // Spree lookup failed
  }

  return NextResponse.json(
    {
      found: false,
      orderNumber: query,
      trackingNumber: null,
      carrier: null,
      carrierTrackingUrl: null,
      currentStatus: "not_found",
      estimatedDelivery: null,
      events: [],
      destination: null,
      isHaitiOrder: false,
    } satisfies TrackingResult,
    { status: 404 },
  );
}
