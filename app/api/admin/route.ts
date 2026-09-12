import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdmin, writeAudit } from "@/utils/admin";

const actionSchema = z.object({
  action: z.enum([
    "set_verified",
    "make_contributor",
    "make_alumni",
    "make_admin",
    "demote_admin",
    "suspend",
    "restore",
    "approve_verification",
    "reject_verification",
    "review_report",
    "dismiss_report",
  ]),
  target_id: z.string().uuid(),
  value: z.boolean().optional(),
});

// Profile ke niye kaj korar AGEY check:
// permanent/super_admin ke KEU na; admin ke shudhu super_admin
type TouchResult =
  | { ok: true; target: { role: string } }
  | { ok: false; error: string; status: number };

async function getTouchableProfile(
  adminClient: SupabaseClient,
  profileId: string,
  actorRole: "admin" | "super_admin"
): Promise<TouchResult> {
  const { data: target } = await adminClient
    .from("profiles")
    .select("id, role, is_permanent")
    .eq("id", profileId)
    .maybeSingle();

  if (!target) {
    return { ok: false, error: "not_found", status: 404 };
  }
  if (target.is_permanent) {
    return { ok: false, error: "cannot_touch_permanent", status: 403 };
  }
  if (target.role === "super_admin") {
    return { ok: false, error: "cannot_touch_superadmin", status: 403 };
  }
  if (target.role === "admin" && actorRole !== "super_admin") {
    return { ok: false, error: "admin_needs_superadmin", status: 403 };
  }

  return { ok: true, target: { role: target.role } };
}

export async function POST(request: Request) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: check.status });
  }
  const { adminClient, actorId, actorRole } = check;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { action, target_id, value } = parsed.data;

  // ---------- Verification review ----------
  if (action === "approve_verification" || action === "reject_verification") {
    const { data: vr } = await adminClient
      .from("verification_requests")
      .select("id, profile_id, status")
      .eq("id", target_id)
      .maybeSingle();

    if (!vr || vr.status !== "pending") {
      return NextResponse.json({ error: "not_pending" }, { status: 400 });
    }

    // Je profile-r kotha — take chhura jay kina
    const touch = await getTouchableProfile(adminClient, vr.profile_id, actorRole);
    if (!touch.ok) {
      return NextResponse.json({ error: touch.error }, { status: touch.status });
    }

    const { error: vrError } = await adminClient
      .from("verification_requests")
      .update({
        status: action === "approve_verification" ? "approved" : "rejected",
        reviewed_by: actorId,
      })
      .eq("id", target_id);

    if (vrError) {
      console.error("Verification review failed:", vrError.message);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    if (action === "approve_verification") {
      const { error: pError } = await adminClient
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", vr.profile_id);

      if (pError) {
        console.error("Verify profile failed:", pError.message);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
      }
    }

    await writeAudit(adminClient, actorId, action, "verification_requests", target_id);
    return NextResponse.json({ ok: true });
  }

  // ---------- Report review ----------
  if (action === "review_report" || action === "dismiss_report") {
    const { data: report } = await adminClient
      .from("reports")
      .select("id, status")
      .eq("id", target_id)
      .maybeSingle();

    if (!report || report.status !== "pending") {
      return NextResponse.json({ error: "not_pending" }, { status: 400 });
    }

    const { error: rError } = await adminClient
      .from("reports")
      .update({ status: action === "review_report" ? "reviewed" : "dismissed" })
      .eq("id", target_id);

    if (rError) {
      console.error("Report review failed:", rError.message);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }

    await writeAudit(adminClient, actorId, action, "reports", target_id);
    return NextResponse.json({ ok: true });
  }

  // ---------- Profile actions (ager moto-i) ----------
  const touch = await getTouchableProfile(adminClient, target_id, actorRole);
  if (!touch.ok) {
    return NextResponse.json({ error: touch.error }, { status: touch.status });
  }
  const target = touch.target;

  let update: Record<string, unknown>;

  switch (action) {
    case "set_verified":
      update = { is_verified: value ?? true };
      break;
    case "make_contributor":
      if (target.role !== "alumni") {
        return NextResponse.json({ error: "only_alumni" }, { status: 400 });
      }
      update = { role: "contributor" };
      break;
    case "make_alumni":
      if (target.role !== "contributor") {
        return NextResponse.json({ error: "only_contributor" }, { status: 400 });
      }
      update = { role: "alumni" };
      break;
    case "make_admin":
      if (actorRole !== "super_admin") {
        return NextResponse.json({ error: "superadmin_only" }, { status: 403 });
      }
      update = { role: "admin" };
      break;
    case "demote_admin":
      if (actorRole !== "super_admin") {
        return NextResponse.json({ error: "superadmin_only" }, { status: 403 });
      }
      if (target.role !== "admin") {
        return NextResponse.json({ error: "not_admin" }, { status: 400 });
      }
      update = { role: "alumni" };
      break;
    case "suspend":
      update = { deleted_at: new Date().toISOString(), is_public: false };
      break;
    case "restore":
      update = { deleted_at: null, is_public: true };
      break;
    default:
      return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update(update)
    .eq("id", target_id);

  if (updateError) {
    console.error("Admin action failed:", updateError.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  await writeAudit(adminClient, actorId, action, "profiles", target_id, update);
  return NextResponse.json({ ok: true });
}