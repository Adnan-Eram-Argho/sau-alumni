"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notice = {
  id: string;
  title: string;
  status: string;
  pinned: boolean;
  date: string;
};

export default function MyNoticesList({ notices }: { notices: Notice[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("নিশ্চিত? এই খসড়াটা চিরতরে মুছে যাবে।")) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/notices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        setMessage("❌ মুছতে সমস্যা হলো");
        return;
      }

      setMessage("✓ মুছে ফেলা হয়েছে");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (notices.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-center text-ink/70">
        এখনো কোনো নোটিশ লেখোনি। প্রথমটা লিখে ফেলো!
      </p>
    );
  }

  return (
    <div>
      {message && (
        <p className="mt-4 rounded-lg bg-base p-3 text-sm">{message}</p>
      )}

      <div className="mt-6 space-y-3">
        {notices.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
          >
            <p className="flex flex-wrap items-center gap-2 font-medium">
              <span className="truncate">{n.title}</span>
              {n.status === "draft" && (
                <span className="rounded-full bg-base px-2.5 py-0.5 text-xs font-medium text-ink/60">
                  📝 খসড়া
                </span>
              )}
              {n.status === "published" && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-500/15 dark:text-green-400">
                  ✅ প্রকাশিত
                </span>
              )}
              {n.status === "archived" && (
                <span className="rounded-full bg-base px-2.5 py-0.5 text-xs font-medium text-ink/50">
                  🗄️ আর্কাইভ
                </span>
              )}
              {n.pinned && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                  📌 পিন
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-ink/50">{n.date}</p>

            {n.status === "draft" && (
              <div className="mt-3 flex gap-2 text-sm">
                <Link
                  href={`/dashboard/notices/${n.id}/edit`}
                  className="rounded-lg border border-line px-3 py-1.5 font-medium hover:bg-base"
                >
                  ✏️ এডিট
                </Link>
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={busy}
                  className="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  🗑️ মুছে ফেলো
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}