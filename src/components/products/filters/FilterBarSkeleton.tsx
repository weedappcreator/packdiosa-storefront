/**
 * Skeleton matching the horizontal FilterBar's desktop layout (filter
 * chips on the left, sort on the right). Rendered by FilterBar's own
 * loading state and by the PLP Suspense fallback.
 */
export function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#c8aa6e]/15">
      <div className="h-9 w-20 bg-[#1a2b3c] rounded-lg animate-pulse" />
      <div className="h-9 w-16 bg-[#1a2b3c] rounded-lg animate-pulse" />
      <div className="h-9 w-24 bg-[#1a2b3c] rounded-lg animate-pulse" />
      <div className="ml-auto h-9 w-16 bg-[#1a2b3c] rounded-lg animate-pulse" />
    </div>
  );
}
