export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton rounded-xl ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

export function AlumniCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-line/60 bg-surface/70 p-6 backdrop-blur-md shadow-sm">
      <div>
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </div>
      <div className="mt-6 border-t border-line/40 pt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function NoticeCardSkeleton() {
  return (
    <div className="rounded-3xl border border-line/60 bg-surface/70 p-6 backdrop-blur-md shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-2 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3.5 w-32" />
      </div>
    </div>
  );
}

export function NoticeDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <Skeleton className="h-5 w-28 rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-4/5 rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <Skeleton className="h-5 w-32 rounded-lg" />
      
      <div className="rounded-3xl border border-line/60 bg-surface/70 p-8 backdrop-blur-md shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Skeleton className="h-28 w-28 rounded-3xl shrink-0" />
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-36 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
            <div className="flex gap-2 justify-center sm:justify-start pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="border-t border-line/40 pt-6 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-2xl border border-line/40 p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="rounded-2xl border border-line/40 p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="rounded-3xl border border-line/60 bg-surface/70 p-6 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-line/60 bg-surface/70 p-5 space-y-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3.5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DirectorySkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="rounded-2xl border border-line/60 bg-surface/70 p-4 space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AlumniCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="flex gap-2 border-b border-line/60 pb-3">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-line/60 bg-surface/70 p-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-xl" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
