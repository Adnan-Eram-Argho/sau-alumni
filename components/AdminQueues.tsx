"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VerificationRequest = {
  id: string;
  fullName: string;
  note: string | null;
  date: string;
};

type Report = {
  id: string;
  reporterName: string;
  targetTable: string | null;
  reason: string | null;
  date: string;
};

type AuditEntry = {
  id: string;
  actorName: string;
  action: string;
  targetTable: string | null;
  date: string;
};

export default function AdminQueues({
  verificationRequests,
  reports,
  audit,
}: {
  verificationRequests: VerificationRequest[];
  reports: Report[];
  audit: AuditEntry[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function act(action: string, targetId: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target_id: targetId }),
      });

      if (!res.ok) {
        setMessage("❌ কাজটা হলো না");
        return;
      }

      setMessage("✓ হয়ে গেছে");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-10">
      {message && <p className="rounded-lg bg-base p-3 text-sm">{message}</p>}

      {/* Verification queue */}
      <section>
        <h2 className="text-lg font-semibold">
          ভেরিফিকেশন অনুরোধ ({verificationRequests.length})
        </h2>
        {verificationRequests.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface p-4 text-sm text-ink/60">
            কোনো pending অনুরোধ নেই।
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {verificationRequests.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
              >
                <p className="font-medium">{v.fullName}</p>
                {v.note && (
                  <p className="mt-1 text-sm text-ink/70">&ldquo;{v.note}&rdquo;</p>
                )}
                <p className="mt-1 text-xs text-ink/50">{v.date}</p>
                <div className="mt-3 flex gap-2 text-sm">
                  <button
                    onClick={() => act("approve_verification", v.id)}
                    disabled={busy}
                    className="rounded-lg bg-sau px-4 py-1.5 font-medium text-white hover:bg-sau-hover disabled:opacity-50"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => act("reject_verification", v.id)}
                    disabled={busy}
                    className="rounded-lg border border-red-300 px-4 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reports queue */}
      <section>
        <h2 className="text-lg font-semibold">অভিযোগ ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="mt-3 rounded-xl border border-line bg-surface p-4 text-sm text-ink/60">
            কোনো pending অভিযোগ নেই।
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-line bg-surface p-4 shadow-sm"
              >
                <p className="font-medium">{r.reporterName}</p>
                <p className="mt-1 text-sm text-ink/70">
                  টার্গেট: {r.targetTable ?? "—"} · কারণ: {r.reason ?? "—"}
                </p>
                <p className="mt-1 text-xs text-ink/50">{r.date}</p>
                <div className="mt-3 flex gap-2 text-sm">
                  <button
                    onClick={() => act("review_report", r.id)}
                    disabled={busy}
                    className="rounded-lg bg-sau px-4 py-1.5 font-medium text-white hover:bg-sau-hover disabled:opacity-50"
                  >
                    ✓ Reviewed
                  </button>
                  <button
                    onClick={() => act("dismiss_report", r.id)}
                    disabled={busy}
                    className="rounded-lg border border-line px-4 py-1.5 hover:bg-base disabled:opacity-50"
                  >
                    ✕ Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Audit log */}
      <section>
        <h2 className="text-lg font-semibold">অপরাধী-খাতা (সাম্প্রতিক ৫০)</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-2.5">কে</th>
                <th className="px-4 py-2.5">কী করলো</th>
                <th className="px-4 py-2.5">কোথায়</th>
                <th className="px-4 py-2.5">কখন</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-line/60 last:border-0"
                >
                  <td className="px-4 py-2.5">{a.actorName}</td>
                  <td className="px-4 py-2.5 font-medium">{a.action}</td>
                  <td className="px-4 py-2.5">{a.targetTable ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink/60">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}