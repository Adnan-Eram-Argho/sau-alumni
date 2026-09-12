import { NextResponse } from "next/server";
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
  ]),
  target_id: z.string().uuid(),
  value: z.boolean().optional(),
});

export async function POST(request: Request) {
  // 1) Ke call korlo — admin/super_admin na?
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "forbidden" }, { status: check.status });
  }
  const { adminClient, actorId, actorRole } = check;

  // 2) Body thik ache?
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

  // 3) Target ke? (service-role — RLS chara dekha jay)
  const { data: target } = await adminClient
    .from("profiles")
    .select("id, role, is_permanent, deleted_at")
    .eq("id", target_id)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // 4) Rokko-niyom (spec):
  if (target.is_permanent) {
    return NextResponse.json({ error: "cannot_touch_permanent" }, { status: 403 });
  }
  if (target.role === "super_admin") {
    return NextResponse.json({ error: "cannot_touch_superadmin" }, { status: 403 });
  }
  if (target.role === "admin" && actorRole !== "super_admin") {
    return NextResponse.json({ error: "admin_needs_superadmin" }, { status: 403 });
  }

  // 5) Kaj + hishab
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
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update(update)
    .eq("id", target_id);

  if (updateError) {
    console.error("Admin action failed:", updateError.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Prottek kajer hishab — oporuddhi khate
  await writeAudit(adminClient, actorId, action, "profiles", target_id, update);

  return NextResponse.json({ ok: true });
}