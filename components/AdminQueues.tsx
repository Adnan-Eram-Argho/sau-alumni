"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Trash2,
  Pin,
  Archive,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertTriangle,
  History,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";

type DraftNotice = {
  id: string;
  title: string;
  authorName: string;
  date: string;
};

type NoticeItem = {
  id: string;
  title: string;
  authorName: string;
  status: string;
  pinned: boolean;
  date: string;
};

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
  draftNotices,
  notices,
  verificationRequests,
  reports,
  audit,
}: {
  draftNotices: DraftNotice[];
  notices: NoticeItem[];
  verificationRequests: VerificationRequest[];
  reports: Report[];
  audit: AuditEntry[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

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
        setMessage({ text: "কাজটা হলো না — সমস্যা হয়েছে", success: false });
        return;
      }

      setMessage({ text: "সফলভাবে সম্পন্ন হয়েছে", success: true });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-10">
      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-all ${
            message.success
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

      {/* Notice management */}
      <section className="rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sau/10 text-sau">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">নোটিশ ম্যানেজমেন্ট</h2>
            <p className="text-xs text-ink/50">খসড়া ও প্রকাশিত নোটিশ নিয়ন্ত্রণ করুন</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            <span>অপেক্ষমান খসড়া</span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">
              {draftNotices.length}
            </span>
          </h3>
          {draftNotices.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-line/60 bg-base/40 p-4 text-sm text-ink/50">
              কোনো খসড়া অপেক্ষা করছে না।
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {draftNotices.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-line bg-surface p-4.5 shadow-sm transition-all hover:border-sau/30"
                >
                  <p className="font-semibold text-ink">{n.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
                    <span>{n.authorName}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{n.date}</span>
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-2 text-sm">
                    <button
                      onClick={() => act("publish_notice", n.id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-sau px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-sau-hover disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      <span>প্রকাশ করুন</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("নিশ্চিত? খসড়াটা চিরতরে মুছে যাবে।")) {
                          act("delete_notice", n.id);
                        }
                      }}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-300/80 px-3 py-1.5 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>মুছে ফেলো</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-ink/70">
            প্রকাশিত / আর্কাইভ নোটিশ (সাম্প্রতিক ৩০)
          </h3>
          {notices.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-line/60 bg-base/40 p-4 text-sm text-ink/50">
              এখনো কিছু প্রকাশিত নেই।
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-line bg-surface p-4.5 shadow-sm transition-all hover:border-sau/30"
                >
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    <span className="font-semibold text-ink">{n.title}</span>
                    {n.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <Pin className="h-3 w-3 fill-amber-500/30" />
                        <span>পিন</span>
                      </span>
                    )}
                    {n.status === "archived" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-line bg-base px-2.5 py-0.5 text-xs font-medium text-ink/50">
                        <Archive className="h-3 w-3" />
                        <span>আর্কাইভ</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
                    <span>{n.authorName}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{n.date}</span>
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-2 text-sm">
                    {n.status === "published" && (
                      <>
                        <button
                          onClick={() => act("pin_notice", n.id, !n.pinned)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                        >
                          <Pin className="h-3.5 w-3.5 text-amber-500" />
                          <span>{n.pinned ? "পিন সরাও" : "পিন করুন"}</span>
                        </button>
                        <button
                          onClick={() => act("archive_notice", n.id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                        >
                          <Archive className="h-3.5 w-3.5 text-ink/60" />
                          <span>আর্কাইভ</span>
                        </button>
                        <button
                          onClick={() => act("unpublish_notice", n.id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 font-medium transition-colors hover:border-sau/40 hover:bg-base disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-ink/60" />
                          <span>খসড়ায় ফেরাও</span>
                        </button>
                      </>
                    )}
                    {n.status === "archived" && (
                      <button
                        onClick={() => act("unarchive_notice", n.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sau px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-sau-hover disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>পুনঃপ্রকাশ</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Verification queue */}
      <section className="rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              ভেরিফিকেশন অনুরোধ ({verificationRequests.length})
            </h2>
            <p className="text-xs text-ink/50">সদস্যদের প্রোফাইল যাচাইকরণ অনুরোধসমূহ</p>
          </div>
        </div>

        {verificationRequests.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-line/60 bg-base/40 p-4 text-sm text-ink/50">
            কোনো pending অনুরোধ নেই।
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {verificationRequests.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-line bg-surface p-4.5 shadow-sm transition-all hover:border-sau/30"
              >
                <p className="font-semibold text-ink">{v.fullName}</p>
                {v.note && (
                  <p className="mt-1.5 rounded-xl bg-base/50 p-2.5 text-sm italic text-ink/75">
                    &ldquo;{v.note}&rdquo;
                  </p>
                )}
                <p className="mt-1.5 flex items-center gap-1 text-xs text-ink/50">
                  <Clock className="h-3 w-3" />
                  <span>{v.date}</span>
                </p>
                <div className="mt-3.5 flex gap-2 text-sm">
                  <button
                    onClick={() => act("approve_verification", v.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sau px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-sau-hover disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => act("reject_verification", v.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-300/80 px-4 py-1.5 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reports queue */}
      <section className="rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">অভিযোগ ({reports.length})</h2>
            <p className="text-xs text-ink/50">ব্যবহারকারীদের রিপোর্ট ও আপত্তি</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-line/60 bg-base/40 p-4 text-sm text-ink/50">
            কোনো pending অভিযোগ নেই।
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-line bg-surface p-4.5 shadow-sm transition-all hover:border-sau/30"
              >
                <p className="font-semibold text-ink">{r.reporterName}</p>
                <p className="mt-1 text-sm text-ink/75">
                  টার্গেট: <span className="font-mono text-xs">{r.targetTable ?? "—"}</span> · কারণ: {r.reason ?? "—"}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-ink/50">
                  <Clock className="h-3 w-3" />
                  <span>{r.date}</span>
                </p>
                <div className="mt-3.5 flex gap-2 text-sm">
                  <button
                    onClick={() => act("review_report", r.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sau px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-sau-hover disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>Reviewed</span>
                  </button>
                  <button
                    onClick={() => act("dismiss_report", r.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-1.5 font-medium transition-colors hover:bg-base disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Audit log */}
      <section className="rounded-3xl border border-line bg-surface/60 p-6 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">অ্যাক্টিভিটি লগ (সাম্প্রতিক ৫০)</h2>
            <p className="text-xs text-ink/50">সিস্টেমে হওয়া পরিবর্তন ও অ্যাকশনসমূহ</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface/90 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-base/40 text-xs font-semibold uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-4 py-3">কে</th>
                <th className="px-4 py-3">কী করলো</th>
                <th className="px-4 py-3">কোথায়</th>
                <th className="px-4 py-3">কখন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {audit.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-ink/50">
                    কোনো অ্যাক্টিভিটি পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                audit.map((a) => (
                  <tr
                    key={a.id}
                    className="transition-colors hover:bg-base/30"
                  >
                    <td className="px-4 py-3 font-medium text-ink">{a.actorName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-sau font-medium">{a.action}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/70">{a.targetTable ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-ink/50">{a.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}