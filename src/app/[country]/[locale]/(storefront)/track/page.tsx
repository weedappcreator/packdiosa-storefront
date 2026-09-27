import type { Metadata } from "next";
import { TrackingLookup } from "@/components/order/TrackingLookup";

export const metadata: Metadata = {
  title: "Track Your Order | Pack-DIOSA",
  description:
    "Track your Pack-DIOSA wholesale order in real-time. Enter your order number or tracking number to see shipment status.",
};

export default async function TrackPage() {
  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero */}
      <section className="pt-20 pb-12 sm:pt-28 sm:pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#faf9f7] uppercase tracking-wide mb-3">
            Track Your Order
          </h1>
          <p className="text-[#9ca3af] text-sm sm:text-base max-w-md mx-auto">
            Enter your order number or tracking number to see real-time shipment
            status updates.
          </p>
        </div>
      </section>

      {/* Tracking form + results */}
      <section className="flex-1 px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <TrackingLookup />
        </div>
      </section>

      {/* Help */}
      <section className="px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a2b3c] rounded-xl border border-[#c8aa6e]/10 p-6">
            <h2 className="text-sm font-bold text-[#faf9f7] uppercase tracking-wider mb-4">
              Need Help?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                  Where to find your order number
                </p>
                <p className="text-sm text-[#faf9f7]">
                  Check your confirmation email for your order number (e.g.
                  R123456789).
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9ca3af] uppercase tracking-wider mb-1">
                  Contact Support
                </p>
                <p className="text-sm text-[#faf9f7]">
                  Email us at{" "}
                  <a
                    href="mailto:support@packdiosa.com"
                    className="text-[#c8aa6e] hover:text-[#d4ba82]"
                  >
                    support@packdiosa.com
                  </a>{" "}
                  or call{" "}
                  <a
                    href="tel:+19125550147"
                    className="text-[#c8aa6e] hover:text-[#d4ba82]"
                  >
                    (912) 555-0147
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
