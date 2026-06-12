import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-lg", className)}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[#0f172a] border border-white/8 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ExpenseCardSkeleton() {
  return (
    <div className="bg-[#0f172a] border border-white/8 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="bg-[#0f172a] border border-white/8 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="bg-[#0f172a] border border-white/8 rounded-2xl p-6"
      style={{ height }}
    >
      <div className="flex items-end gap-2 h-full pb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}
