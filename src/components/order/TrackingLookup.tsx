"use client";

import { Loader2, Package, Search } from "lucide-react";
import { useCallback, useState } from "react";
import type { TrackingResult } from "@/lib/tracking";
import { OrderTimeline } from "./OrderTimeline";

export function TrackingLookup() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 3) {
        setError("Please enter a valid order or tracking number.");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);
      setSearched(true);

      try {
        const res = await fetch(`/api/track?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();

        if (res.ok && data.found) {
          setResult(data);
        } else if (res.status === 404) {
          setError(
            "Order not found. Please check your order number and try again.",
          );
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
      } catch {
        setError(
          "Unable to connect to tracking service. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="size-5 text-[#9ca3af]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter order number (e.g. R123456789) or tracking number"
            className="w-full h-14 pl-12 pr-32 bg-[#1a2b3c] border border-[#c8aa6e]/15 rounded-xl text-[#faf9f7] placeholder-[#9ca3af]/60 text-sm focus:border-[#c8aa6e] focus:ring-2 focus:ring-[#c8aa6e]/20 focus:outline-none transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 bg-[#c8aa6e] hover:bg-[#d4ba82] text-[#0f1a24] text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Searching
                </>
              ) : (
                "Track Order"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Order summary card */}
          <div className="bg-[#1a2b3c] rounded-xl border border-[#c8aa6e]/15 p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#c8aa6e]/10 border border-[#c8aa6e]/20">
                <Package className="size-5 text-[#c8aa6e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs text-[#9ca3af] uppercase tracking-wider">
                      Order Number
                    </p>
                    <p className="text-lg font-bold text-[#faf9f7] font-mono">
                      {result.orderNumber}
                    </p>
                  </div>
                  {result.destination && (
                    <div className="text-right">
                      <p className="text-xs text-[#9ca3af] uppercase tracking-wider">
                        Destination
                      </p>
                      <p className="text-sm text-[#faf9f7]">
                        {result.destination}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <OrderTimeline tracking={result} />
        </div>
      )}

      {/* Empty state (before search) */}
      {!searched && !result && (
        <div className="text-center py-12">
          <div className="flex size-16 mx-auto items-center justify-center rounded-full bg-[#c8aa6e]/10 border border-[#c8aa6e]/15 mb-4">
            <Package className="size-7 text-[#c8aa6e]/60" />
          </div>
          <p className="text-sm text-[#9ca3af]">
            Enter your order number above to get started.
          </p>
        </div>
      )}

      {/* Not found after search */}
      {searched && !result && !error && !loading && (
        <div className="text-center py-12">
          <p className="text-sm text-[#9ca3af]">No results found.</p>
        </div>
      )}
    </div>
  );
}
