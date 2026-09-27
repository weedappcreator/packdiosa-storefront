"use client";

import {
  Anchor,
  Check,
  ClipboardList,
  Clock,
  FileSearch,
  MapPin,
  Package,
  Plane,
  Receipt,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { TrackingEvent, TrackingResult } from "@/lib/tracking";
import {
  getStatusIndex,
  getStatusLabel,
  getStatusPipeline,
} from "@/lib/tracking";
import { formatDateTime } from "@/lib/utils/format";

interface OrderTimelineProps {
  tracking: TrackingResult;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  order_received: <Package className="size-4" />,
  preparing: <Clock className="size-4" />,
  shipped: <Package className="size-4" />,
  picked_up: <Package className="size-4" />,
  in_transit: <Truck className="size-4" />,
  in_transit_to_haiti: <Plane className="size-4" />,
  arrived_at_port: <Anchor className="size-4" />,
  douane_declaration: <ClipboardList className="size-4" />,
  douane_verification: <FileSearch className="size-4" />,
  douane_liquidation: <Receipt className="size-4" />,
  douane_cleared: <ShieldCheck className="size-4" />,
  customs_clearance: <ShieldCheck className="size-4" />,
  out_for_delivery: <Truck className="size-4" />,
  delivered: <Check className="size-4" />,
  ready: <Package className="size-4" />,
};

function getIconForStatus(status: string) {
  return STATUS_ICONS[status] || <Clock className="size-4" />;
}

function TimelineStep({
  status,
  isActive,
  isCompleted,
  isCurrent,
  event,
  isLast,
}: {
  status: string;
  isActive: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  event?: TrackingEvent;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isCompleted
              ? "border-[#c8aa6e] bg-[#c8aa6e] text-[#0f1a24]"
              : isCurrent
                ? "border-[#c8aa6e] bg-[#0f1a24] text-[#c8aa6e] ring-4 ring-[#c8aa6e]/20"
                : "border-[#c8aa6e]/20 bg-[#0f1a24] text-[#c8aa6e]/30"
          }`}
        >
          {isCompleted ? (
            <Check className="size-4" />
          ) : (
            getIconForStatus(status)
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-8 ${
              isCompleted ? "bg-[#c8aa6e]" : "bg-[#c8aa6e]/15"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
        <p
          className={`text-sm font-semibold ${
            isActive ? "text-[#faf9f7]" : "text-[#9ca3af]/50"
          }`}
        >
          {getStatusLabel(status)}
        </p>
        {event?.description && isActive && (
          <p className="text-xs text-[#9ca3af] mt-0.5">{event.description}</p>
        )}
        {event?.timestamp && isActive && (
          <p className="text-xs text-[#c8aa6e]/70 mt-1">
            {formatDateTime(event.timestamp)}
          </p>
        )}
        {event?.location && isActive && (
          <p className="text-xs text-[#9ca3af] mt-0.5 inline-flex items-center gap-1">
            <MapPin className="size-3" />
            {event.location}
          </p>
        )}
      </div>
    </div>
  );
}

export function OrderTimeline({ tracking }: OrderTimelineProps) {
  const pipeline = getStatusPipeline(tracking.isHaitiOrder);
  const currentIdx = getStatusIndex(
    tracking.currentStatus,
    tracking.isHaitiOrder,
  );
  const isDelivered = tracking.currentStatus === "delivered";
  const isCanceled = tracking.currentStatus === "canceled";

  // Build event lookup by status
  const eventsByStatus = new Map<string, TrackingEvent>();
  for (const event of tracking.events) {
    eventsByStatus.set(event.status, event);
  }

  return (
    <div className="bg-[#0f1a24] rounded-xl border border-[#c8aa6e]/15 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#faf9f7] uppercase tracking-wide">
          Shipment Status
        </h3>
        {isDelivered && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-400 border border-green-500/20">
            <Check className="size-3 mr-1" />
            Delivered
          </span>
        )}
        {isCanceled && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-900/30 text-red-400 border border-red-500/20">
            Canceled
          </span>
        )}
      </div>

      {/* Progress bar (desktop) */}
      <div className="hidden sm:block mb-8">
        <div className="relative h-2 bg-[#c8aa6e]/10 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
              isDelivered
                ? "bg-gradient-to-r from-[#c8aa6e] to-green-500"
                : "bg-gradient-to-r from-[#c8aa6e] to-[#d4ba82]"
            }`}
            style={{
              width: isDelivered
                ? "100%"
                : currentIdx >= 0
                  ? `${((currentIdx + 1) / pipeline.length) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div>
        {pipeline.map((status, idx) => {
          // When delivered, ALL steps are completed (filled gold checkmarks)
          const isCompleted = isDelivered
            ? true
            : currentIdx >= 0 && idx < currentIdx;
          const isCurrent = isDelivered ? false : idx === currentIdx;
          const isActive = isCompleted || isCurrent;

          return (
            <TimelineStep
              key={status}
              status={status}
              isActive={isActive}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              event={eventsByStatus.get(status)}
              isLast={idx === pipeline.length - 1}
            />
          );
        })}
      </div>

      {/* Tracking details */}
      {(tracking.trackingNumber ||
        tracking.carrier ||
        tracking.estimatedDelivery) && (
        <div className="mt-6 pt-6 border-t border-[#c8aa6e]/15">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tracking.trackingNumber && (
              <div>
                <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                  Tracking Number
                </p>
                <p className="text-sm text-[#faf9f7] font-mono">
                  {tracking.carrierTrackingUrl ? (
                    <a
                      href={tracking.carrierTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c8aa6e] hover:text-[#d4ba82] underline underline-offset-2"
                    >
                      {tracking.trackingNumber}
                    </a>
                  ) : (
                    tracking.trackingNumber
                  )}
                </p>
              </div>
            )}
            {tracking.carrier && (
              <div>
                <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                  Carrier
                </p>
                <p className="text-sm text-[#faf9f7]">{tracking.carrier}</p>
              </div>
            )}
            {tracking.estimatedDelivery && (
              <div>
                <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                  Estimated Delivery
                </p>
                <p className="text-sm text-[#faf9f7]">
                  {formatDateTime(tracking.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Haiti badge */}
      {tracking.isHaitiOrder && (
        <div className="mt-4 p-3 bg-[#1a2b3c] rounded-lg border border-[#c8aa6e]/10">
          <p className="text-xs text-[#9ca3af]">
            <span className="text-[#c8aa6e] font-semibold">
              International Shipment
            </span>{" "}
            — This order is being shipped to Haiti. Customs clearance may take
            additional time. Contact us for updates.
          </p>
        </div>
      )}
    </div>
  );
}
