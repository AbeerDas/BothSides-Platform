import { cn } from "@/lib/utils";

const ShimmerLine = ({ className }: { className?: string }) => (
  <div className={cn(
    "bg-muted/50 animate-shimmer relative overflow-hidden",
    className
  )}>
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer-slide" />
  </div>
);

export const SkeletonCard = ({ side }: { side: "for" | "against" }) => (
  <div className={cn(
    "p-5 md:p-6 border space-y-4",
    side === "for" ? "bg-for-bg/50 border-for-border" : "bg-against-bg/50 border-against-border"
  )}>
    <ShimmerLine className="h-5 w-3/4" />
    <ShimmerLine className="h-4 w-1/2" />
    <div className="space-y-2">
      <ShimmerLine className="h-4 w-full" />
      <ShimmerLine className="h-4 w-full" />
      <ShimmerLine className="h-4 w-5/6" />
    </div>
    <div className="pt-3 border-t border-border">
      <ShimmerLine className="h-8 w-32" />
    </div>
  </div>
);

export const SkeletonConclusion = () => (
  <div className="border border-border bg-card p-6 space-y-4">
    <div className="flex items-center gap-3">
      <ShimmerLine className="h-5 w-5 rounded-full" />
      <ShimmerLine className="h-5 w-64" />
    </div>
    <ShimmerLine className="h-4 w-full" />
    <ShimmerLine className="h-4 w-5/6" />
  </div>
);

export const SkeletonDebateView = () => (
  <div className="space-y-8 animate-fade-in">
    {/* Conclusion skeleton */}
    <SkeletonConclusion />

    {/* Statement skeleton */}
    <div className="border border-border bg-card p-6 space-y-4">
      <ShimmerLine className="h-7 w-3/4" />
      <ShimmerLine className="h-4 w-full" />
      <ShimmerLine className="h-4 w-2/3" />
      <div className="flex gap-2 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <ShimmerLine key={i} className="h-9 w-24" />
        ))}
      </div>
    </div>

    {/* For/Against panels skeleton */}
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:flex-1 space-y-4">
        <div className="border border-for-border bg-for-bg/50 p-6">
          <ShimmerLine className="h-6 w-20 mb-4" />
          <div className="space-y-4">
            <SkeletonCard side="for" />
            <SkeletonCard side="for" />
            <SkeletonCard side="for" />
          </div>
        </div>
      </div>
      
      <div className="lg:flex-1 space-y-4">
        <div className="border border-against-border bg-against-bg/50 p-6">
          <ShimmerLine className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            <SkeletonCard side="against" />
            <SkeletonCard side="against" />
            <SkeletonCard side="against" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
