import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/admin";
import AdminQueues from "@/components/AdminQueues";

export const metadata = {
  title: "অনুরোধ ও অভিযোগ — SAU Alumni",
};

export default async function AdminQueuesPage() {
  const check = await requireAdmin();
  if (!check.ok) {
    redirect("/dashboard");
  }

  const { adminClient, actorId, actorRole } = check;

  // Pending verification requests — naam soho.
  // NOTE: ei table-e profiles-er DUITA FK (profile_id, reviewed_by) —
  // tai PostgREST-ke sposto bole dite hoy kon FK diye embed:
  // profiles!verification_requests_profile_id_fkey(...)
  const { data: vrs, error: vrsError } = await adminClient
    .from("verification_requests")
    .select(
      "id, evidence_note, created_at, profiles!verification_requests_profile_id_fkey(full_name)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (vrsError) {
    console.error("Verification queue query failed:", vrsError.message);
  }

  const vrList = (vrs ?? []) as unknown as {
    id: string;
    evidence_note: string | null;
    created_at: string | null;
    profiles: { full_name: string } | null;
  }[];

  // Pending reports — ekta FK (reporter_id), tai ambiguity nai
  const { data: reports, error: reportsError } = await adminClient
    .from("reports")
    .select("id, target_table, reason, created_at, profiles(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (reportsError) {
    console.error("Reports queue query failed:", reportsError.message);
  }

  const reportList = (reports ?? []) as unknown as {
    id: string;
    target_table: string | null;
    reason: string | null;
    created_at: string | null;
    profiles: { full_name: string } | null;
  }[];

  // Audit — super_admin sob; admin sudhu nijer kaj (spec)
  let auditQuery = adminClient
    .from("audit_log")
    .select("id, action, target_table, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (actorRole !== "super_admin") {
    auditQuery = auditQuery.eq("actor_id", actorId);
  }

  const { data: audit, error: auditError } = await auditQuery;

  if (auditError) {
    console.error("Audit query failed:", auditError.message);
  }

  const auditList = (audit ?? []) as unknown as {
    id: string;
    action: string;
    target_table: string | null;
    created_at: string | null;
    profiles: { full_name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/admin"
        className="text-sm font-medium text-ink/60 hover:text-ink"
      >
        ← অ্যাডমিন প্যানেলে ফিরুন
      </Link>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">অনুরোধ ও অভিযোগ</h1>

      <AdminQueues
        verificationRequests={vrList.map((v) => ({
          id: v.id,
          fullName: v.profiles?.full_name ?? "—",
          note: v.evidence_note,
          date: v.created_at?.slice(0, 10) ?? "",
        }))}
        reports={reportList.map((r) => ({
          id: r.id,
          reporterName: r.profiles?.full_name ?? "—",
          targetTable: r.target_table,
          reason: r.reason,
          date: r.created_at?.slice(0, 10) ?? "",
        }))}
        audit={auditList.map((a) => ({
          id: a.id,
          actorName: a.profiles?.full_name ?? "—",
          action: a.action,
          targetTable: a.target_table,
          date: a.created_at?.slice(0, 10) ?? "",
        }))}
      />
    </div>
  );
}