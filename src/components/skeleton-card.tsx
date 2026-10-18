export function SkeletonCard() {
  return (
    <div className="glass p-5 space-y-4 animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-white/5" />
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/5" />
      </div>
    </div>
  );
}
