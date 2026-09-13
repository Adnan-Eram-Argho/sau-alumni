import { NoticeCardSkeleton, Skeleton } from "@/components/Skeleton";

export default function NoticesLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Pinned notice banner skeleton */}
      <div className="rounded-3xl border border-line/60 bg-surface/70 p-6 backdrop-blur-md shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <NoticeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
