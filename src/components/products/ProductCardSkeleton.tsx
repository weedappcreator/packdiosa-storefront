import type * as React from "react";

/**
 * Skeleton placeholder for a single product card.
 * Matches the layout of `<ProductCard>` — no border, rounded image,
 * text placeholders below.
 */
export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-[#1a2b3c] rounded-md" />
      <div className="p-4">
        <div className="h-4 bg-[#1a2b3c] rounded w-3/4 mb-2" />
        <div className="h-5 bg-[#1a2b3c] rounded w-1/4" />
      </div>
    </div>
  );
}
