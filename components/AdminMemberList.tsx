"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Shield,
  Feather,
  User,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  PauseCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { BATCH_YEARS } from "@/utils/batch";

type Member = {
  id: string;
  full_name: string;
  role: string;
  is_permanent: boolean;
  is_verified: boolean;
  deleted: boolean;
  email: string;
  joined: string;
  batch: number | null;
};

const roleConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  super_admin: {
    label: "Super Admin",
    icon: Crown,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  contributor: {
    label: "Contributor",
    icon: Feather,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  alumni: {
    label: "Alumni",
    icon: User,
    color: "bg-base text-ink/70 border-line",
  },
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
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [batchFilter, setBatchFilter] = useState("");

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
        setMessage({ text: "কাজটা হলো না — অনুমতি নেই বা সমস্যা হয়েছে", success: false });
        return;
      }

      setMessage({ text: "সফলভাবে সম্পন্ন হয়েছে", success: true });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  // Batch filter — client-side (member list choto, DB hit lagbe na)
  const visible = batchFilter
    ? members.filter((m) => String(m.batch) === batchFilter)
    : members;

  return (
    <div>
      {message && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${message.success
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
        >
          {message.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Batch filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-ink/60">
          <GraduationCap className="h-4 w-4 text-sau" />
          <span>ব্যাচ দিয়ে খুঁজো:</span>
        </div>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10"
        >
          <option value="">সব ব্যাচ</option>
          {BATCH_YEARS.map((y) => (
            <option key={y} value={y}>
              ব্যাচ {y}
            </option>
          ))}
        </select>
        <span className="text-xs text-ink/40">
          {batchFilter
            ? `${visible.length} জন দেখানো হচ্ছে (মোট ${members.length})`
            : ""}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {visible.map((m) => {
          // Admin actor admin target ke dekhachhe — kichhu-i na
          const cannotTouch =
            m.is_permanent ||
            m.role === "super_admin" ||
            (m.role === "admin" && actorRole !== "super_admin");

          const roleInfo = roleConfig[m.role] ?? {
            label: m.role,
            icon: User,
            color: "bg-base text-ink/70 border-line",
          };
          const RoleIcon = roleInfo.icon;

          return (
            <div
              key={m.id}
              className={`group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface/80 p-4.5 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-sau/30 hover:shadow-md ${m.deleted ? "opacity-60 bg-surface/40" : ""
                }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  <span className="truncate text-ink font-semibold">{m.full_name}</span>
                  {m.is_verified && (
                    <span title="Verified" className="inline-flex text-sau">
                      <CheckCircle2 className="h-4 w-4 fill-sau/15 text-sau" />
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleInfo.color}`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    <span>{roleInfo.label}</span>
                  </span>
                  {m.batch && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-base px-2.5 py-0.5 text-xs font-medium text-ink/60">
                      <GraduationCap className="h-3 w-3" />
                      <span>ব্যাচ {m.batch}</span>
                    </span>
                  )}
                  {m.deleted && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-100/80 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-400">
                      <PauseCircle className="h-3 w-3" />
                      <span>Suspend করা</span>
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-ink/50">
                  {m.email} · যোগ: {m.joined}
                </p>
              </div>

              {!cannotTouch && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {!m.deleted && (
                    <button
                      onClick={() => act("set_verified", m.id, !m.is_verified)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                    >
                      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <CheckCircle2 className="h-3.5 w-3.5 text-sau" />
                      <span>{m.is_verified ? "Unverify" : "Verify"}</span>
                    </button>
                  )}

                  {m.role === "alumni" && (
                    <button
                      onClick={() => act("make_contributor", m.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                    >
                      <ArrowUp className="h-3.5 w-3.5 text-purple-500" />
                      <span>Contributor</span>
                    </button>
                  )}

                  {m.role === "contributor" && (
                    <button
                      onClick={() => act("make_alumni", m.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                    >
                      <ArrowDown className="h-3.5 w-3.5 text-ink/60" />
                      <span>Alumni</span>
                    </button>
                  )}

                  {actorRole === "super_admin" &&
                    (m.role === "alumni" || m.role === "contributor") && (
                      <button
                        onClick={() => act("make_admin", m.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                      >
                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                        <span>Admin</span>
                      </button>
                    )}

                  {actorRole === "super_admin" && m.role === "admin" && (
                    <button
                      onClick={() => act("demote_admin", m.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                    >
                      <ArrowDown className="h-3.5 w-3.5 text-amber-500" />
                      <span>নামাও</span>
                    </button>
                  )}

                  {m.deleted ? (
                    <button
                      onClick={() => act("restore", m.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-sau px-3 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-sau-hover disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => act("suspend", m.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-300/80 px-3 py-1.5 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <PauseCircle className="h-3.5 w-3.5" />
                      <span>Suspend</span>
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