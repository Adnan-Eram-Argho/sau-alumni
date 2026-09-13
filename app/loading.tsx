import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 py-16">
      <div className="relative flex items-center justify-center">
        {/* Ambient glow */}
        <div className="absolute h-24 w-24 rounded-full bg-sau/15 blur-xl animate-pulse" />
        
        {/* Animated ring & spinner */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-sau/30 bg-surface/80 shadow-lg backdrop-blur-md">
          <Loader2 className="h-8 w-8 animate-spin text-sau" />
        </div>
      </div>

      <p className="mt-6 font-medium text-ink/70 animate-pulse text-sm">
        লোড হচ্ছে... একটু অপেক্ষা করুন
      </p>
    </div>
  );
}
