import { Skeleton } from "@/components/Skeleton";

export default function FacultyLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <Skeleton className="h-5 w-36 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl border border-line/60 bg-surface/70 p-6 backdrop-blur-md shadow-sm space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
