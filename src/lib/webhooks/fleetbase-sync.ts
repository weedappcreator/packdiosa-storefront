/**
 * Fleetbase sync — forwards Spree order/shipment events to Fleetbase
 * for logistics tracking. Called from existing Spree webhook handlers.
 */

const FLEETBASE_API_URL =
  process.env.FLEETBASE_API_URL || "http://localhost:8000";
const FLEETBASE_API_KEY = process.env.FLEETBASE_API_KEY || "";

interface FleetbaseAddress {
  name: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface SpreeOrderData {
  id: string;
  number: string;
  email?: string | null;
  display_total?: string | null;
  currency?: string;
  completed_at?: string | null;
  shipping_address?: {
    full_name?: string | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    state_name?: string | null;
    zipcode?: string | null;
    country_iso?: string | null;
    country?: string | null;
    phone?: string | null;
  } | null;
  items?: Array<{
    name: string;
    quantity: number;
    display_price?: string | null;
    sku?: string | null;
  }>;
  fulfillments?: Array<{
    id: string;
    number?: string | null;
    status: string;
    tracking?: string | null;
    tracking_url?: string | null;
    delivery_method?: { name: string } | null;
  }>;
}

function isFleetbaseConfigured(): boolean {
  return Boolean(FLEETBASE_API_KEY);
}

function buildDropoff(
  addr: SpreeOrderData["shipping_address"],
): FleetbaseAddress | undefined {
  if (!addr) return undefined;
  return {
    name: addr.full_name || "",
    street1: addr.address1 || "",
    street2: addr.address2 || "",
    city: addr.city || "",
    state: addr.state_name || "",
    postal_code: addr.zipcode || "",
    country: addr.country_iso || addr.country || "",
    phone: addr.phone || "",
  };
}

/**
 * Create a Fleetbase order when a Spree order is completed.
 */
export async function syncOrderToFleetbase(
  order: SpreeOrderData,
): Promise<void> {
  if (!isFleetbaseConfigured()) return;

  const isHaiti =
    order.shipping_address?.country_iso === "HT" ||
    order.shipping_address?.country === "HT";

  const payload = {
    type: "default",
    internal_id: order.number,
    status: "created",
    meta: {
      spree_order_id: order.id,
      spree_order_number: order.number,
      email: order.email,
      total: order.display_total,
      is_haiti: isHaiti,
    },
    payload: {
      dropoff: buildDropoff(order.shipping_address),
      entities: (order.items || []).map((item) => ({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.display_price,
      })),
    },
    notes: `Spree order ${order.number} — ${order.email || "no email"}`,
  };

  try {
    const res = await fetch(`${FLEETBASE_API_URL}/api/v1/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLEETBASE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[fleetbase-sync] Failed to create order ${order.number}:`,
        res.status,
        text,
      );
    } else {
      console.log(
        `[fleetbase-sync] Created Fleetbase order for ${order.number}`,
      );
    }
  } catch (err) {
    console.error(
      `[fleetbase-sync] Network error creating order ${order.number}:`,
      err,
    );
  }
}

/**
 * Update Fleetbase order when a Spree shipment is shipped.
 */
export async function syncShipmentToFleetbase(
  order: SpreeOrderData,
): Promise<void> {
  if (!isFleetbaseConfigured()) return;

  const shippedFulfillments = (order.fulfillments || []).filter(
    (f) => f.status === "shipped",
  );
  if (shippedFulfillments.length === 0) return;

  try {
    // Find existing Fleetbase order
    const searchRes = await fetch(
      `${FLEETBASE_API_URL}/api/v1/orders?query=${encodeURIComponent(order.number)}`,
      {
        headers: {
          Authorization: `Bearer ${FLEETBASE_API_KEY}`,
          Accept: "application/json",
        },
      },
    );

    if (!searchRes.ok) {
      console.error(
        `[fleetbase-sync] Failed to search for order ${order.number}:`,
        searchRes.status,
      );
      return;
    }

    const searchData = await searchRes.json();
    const fleetbaseOrder = searchData?.data?.[0];

    if (!fleetbaseOrder) {
      // Order not in Fleetbase yet — create it first then update
      console.warn(
        `[fleetbase-sync] No Fleetbase order for ${order.number}, creating...`,
      );
      await syncOrderToFleetbase(order);
      return;
    }

    // Update with tracking info from first shipped fulfillment
    const fulfillment = shippedFulfillments[0];
    const updatePayload: Record<string, unknown> = {
      status: "dispatched",
    };

    if (fulfillment.tracking) {
      updatePayload.tracking_number = {
        tracking_number: fulfillment.tracking,
        order_number: order.number,
        tracking_url: fulfillment.tracking_url || undefined,
      };
    }

    const updateRes = await fetch(
      `${FLEETBASE_API_URL}/api/v1/orders/${fleetbaseOrder.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${FLEETBASE_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatePayload),
      },
    );

    if (!updateRes.ok) {
      const text = await updateRes.text();
      console.error(
        `[fleetbase-sync] Failed to update order ${order.number}:`,
        updateRes.status,
        text,
      );
    } else {
      console.log(
        `[fleetbase-sync] Updated Fleetbase order for ${order.number} → dispatched`,
      );
    }
  } catch (err) {
    console.error(
      `[fleetbase-sync] Network error updating order ${order.number}:`,
      err,
    );
  }
}
