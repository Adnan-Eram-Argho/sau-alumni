"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  full_name: string;
  role: string;
  is_permanent: boolean;
  is_verified: boolean;
  deleted: boolean;
  email: string;
  joined: string;
};

const roleLabels: Record<string, string> = {
  super_admin: "👑 Super Admin",
  admin: "🛡️ Admin",
  contributor: "✍️ Contributor",
  alumni: "Alumni",
};

export default function AdminMemberList({
  members,
  actorRole,
}: {
  members: Member[];
  actorRole: "admin" | "super_admin";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function act(action: string, targetId: string, value?: boolean) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, target_id: targetId, value }),
      });

      if (!res.ok) {
        setMessage("❌ কাজটা হলো না — অনুমতি নেই বা সমস্যা হয়েছে");
        return;
      }

      setMessage("✓ হয়ে গেছে");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {message && <p className="mt-4 rounded-lg bg-base p-3 text-sm">{message}</p>}

      <div className="mt-6 space-y-3">
        {members.map((m) => {
          // Admin actor admin target ke dekhachhe — kichhu-i na
          const cannotTouch =
            m.is_permanent ||
            m.role === "super_admin" ||
            (m.role === "admin" && actorRole !== "super_admin");

          return (
            <div
              key={m.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-sm ${
                m.deleted ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  <span className="truncate">{m.full_name}</span>
                  {m.is_verified && <span title="Verified">✅</span>}
                  <span className="rounded-full bg-base px-2.5 py-0.5 text-xs font-medium">
                    {roleLabels[m.role] ?? m.role}
                  </span>
                  {m.deleted && (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-400">
                      ⏸️ Suspend করা
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink/50">
                  {m.email} · যোগ: {m.joined}
                </p>
              </div>

              {!cannotTouch && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {!m.deleted && (
                    <button
                      onClick={() => act("set_verified", m.id, !m.is_verified)}
                      disabled={busy}
                      className="rounded-lg border border-line px-3 py-1.5 hover:bg-base disabled:opacity-50"
                    >
                      {m.is_verified ? "Unverify" : "✅ Verify"}
                    </button>
                  )}

                  {m.role === "alumni" && (
                    <button
                      onClick={() => act("make_contributor", m.id)}
                      disabled={busy}
                      className="rounded-lg border border-line px-3 py-1.5 hover:bg-base disabled:opacity-50"
                    >
                      ⬆️ Contributor
                    </button>
                  )}

                  {m.role === "contributor" && (
                    <button
                      onClick={() => act("make_alumni", m.id)}
                      disabled={busy}
                      className="rounded-lg border border-line px-3 py-1.5 hover:bg-base disabled:opacity-50"
                    >
                      ⬇️ Alumni
                    </button>
                  )}

                  {actorRole === "super_admin" &&
                    (m.role === "alumni" || m.role === "contributor") && (
                      <button
                        onClick={() => act("make_admin", m.id)}
                        disabled={busy}
                        className="rounded-lg border border-line px-3 py-1.5 hover:bg-base disabled:opacity-50"
                      >
                        🛡️ Admin
                      </button>
                    )}

                  {actorRole === "super_admin" && m.role === "admin" && (
                    <button
                      onClick={() => act("demote_admin", m.id)}
                      disabled={busy}
                      className="rounded-lg border border-line px-3 py-1.5 hover:bg-base disabled:opacity-50"
                    >
                      ⬇️ নামাও
                    </button>
                  )}

                  {m.deleted ? (
                    <button
                      onClick={() => act("restore", m.id)}
                      disabled={busy}
                      className="rounded-lg bg-sau px-3 py-1.5 font-medium text-white hover:bg-sau-hover disabled:opacity-50"
                    >
                      ↩️ Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => act("suspend", m.id)}
                      disabled={busy}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      ⏸️ Suspend
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}