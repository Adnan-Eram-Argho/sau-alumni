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
    "publish_notice",
    "unpublish_notice",
    "pin_notice",
    "archive_notice",
    "unarchive_notice",
    "delete_notice",
    "delete_homepage_image",
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

function json(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.toLowerCase().includes("application/json")) {
    return json({ error: "unsupported_media_type" }, { status: 415 });
  }

  const check = await requireAdmin();
  if (!check.ok) {
    return json({ error: "forbidden" }, { status: check.status });
  }
  const { adminClient, actorId, actorRole } = check;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "bad_request" }, { status: 400 });
  }
  const { action, target_id, value } = parsed.data;

  // ---------- Notice management (publish/pin/archive) ----------
  if (
    action === "publish_notice" ||
    action === "unpublish_notice" ||
    action === "pin_notice" ||
    action === "archive_notice" ||
    action === "unarchive_notice"
  ) {
    const { data: notice } = await adminClient
      .from("notices")
      .select("id, status, pinned")
      .eq("id", target_id)
      .maybeSingle();

    if (!notice) {
      return json({ error: "not_found" }, { status: 404 });
    }

    let update: Record<string, unknown> | null = null;

    if (action === "publish_notice") {
      if (notice.status !== "draft") {
        return json({ error: "not_draft" }, { status: 400 });
      }
      update = { status: "published", publish_at: new Date().toISOString() };
    } else if (action === "unpublish_notice") {
      if (notice.status !== "published") {
        return json({ error: "not_published" }, { status: 400 });
      }
      update = { status: "draft", pinned: false };
    } else if (action === "pin_notice") {
      if (notice.status !== "published") {
        return json({ error: "not_published" }, { status: 400 });
      }
      update = { pinned: value ?? !notice.pinned };
    } else if (action === "archive_notice") {
      if (notice.status !== "published") {
        return json({ error: "not_published" }, { status: 400 });
      }
      update = { status: "archived", pinned: false };
    } else {
      // unarchive_notice
      if (notice.status !== "archived") {
        return json({ error: "not_archived" }, { status: 400 });
      }
      update = { status: "published" };
    }

    const { error: nError } = await adminClient
      .from("notices")
      .update(update)
      .eq("id", target_id);

    if (nError) {
      console.error(
        `[Admin API] Notice update for action "${action}" on notice ${target_id} by actor ${actorId} (${actorRole}) failed:`,
        nError.message
      );
      return json({ error: "server_error" }, { status: 500 });
    }

    await writeAudit(adminClient, actorId, action, "notices", target_id, update);
    return json({ ok: true });
  }

  // ---------- Notice delete (shudhu DRAFT) ----------
  if (action === "delete_notice") {
    const { data: notice } = await adminClient
      .from("notices")
      .select("id, status, image_url")
      .eq("id", target_id)
      .maybeSingle();

    if (!notice) {
      return json({ error: "not_found" }, { status: 404 });
    }
    if (notice.status !== "draft") {
      return json({ error: "only_draft" }, { status: 400 });
    }

    const { error: delError } = await adminClient
      .from("notices")
      .delete()
      .eq("id", target_id);

    if (delError) {
      console.error(
        `[Admin API] Notice delete on notice ${target_id} by actor ${actorId} (${actorRole}) failed:`,
        delError.message
      );
      return json({ error: "server_error" }, { status: 500 });
    }
    // Chobi chhilo? Storage theke-o muchhi
    if (notice.image_url) {
      const marker = "/object/public/notice-images/";
      const idx = notice.image_url.indexOf(marker);
      if (idx !== -1) {
        const imgPath = notice.image_url.slice(idx + marker.length);
        if (imgPath) {
          const { error: imgError } = await adminClient.storage
            .from("notice-images")
            .remove([imgPath]);
          if (imgError) {
            console.error(
              `[Admin API] Notice image cleanup on notice ${target_id} by actor ${actorId} failed:`,
              imgError.message
            );
          }
        }
      }
    }

    await writeAudit(adminClient, actorId, action, "notices", target_id);
    return json({ ok: true });
  }

  // ---------- Homepage carousel: chobi remove ----------
  if (action === "delete_homepage_image") {
    const { data: img } = await adminClient
      .from("homepage_images")
      .select("id, image_url")
      .eq("id", target_id)
      .maybeSingle();

    if (!img) {
      return json({ error: "not_found" }, { status: 404 });
    }

    // Row muchhi
    const { error: delError } = await adminClient
      .from("homepage_images")
      .delete()
      .eq("id", target_id);

    if (delError) {
      console.error(
        `[Admin API] Homepage image delete on image ${target_id} by actor ${actorId} (${actorRole}) failed:`,
        delError.message
      );
      return json({ error: "server_error" }, { status: 500 });
    }

    // Storage theke-O muchhi — etim file rakhbo na
    const marker = "/object/public/homepage-images/";
    const idx = img.image_url.indexOf(marker);
    if (idx !== -1) {
      const imgPath = img.image_url.slice(idx + marker.length);
      if (imgPath) {
        const { error: storageError } = await adminClient.storage
          .from("homepage-images")
          .remove([imgPath]);
        if (storageError) {
          console.error(
            `[Admin API] Homepage image storage cleanup on image ${target_id} by actor ${actorId} failed:`,
            storageError.message
          );
        }
      }
    }

    await writeAudit(adminClient, actorId, action, "homepage_images", target_id);
    return json({ ok: true });
  }

  // ---------- Verification review ----------
  if (action === "approve_verification" || action === "reject_verification") {
    const { data: vr } = await adminClient
      .from("verification_requests")
      .select("id, profile_id, status")
      .eq("id", target_id)
      .maybeSingle();

    if (!vr || vr.status !== "pending") {
      return json({ error: "not_pending" }, { status: 400 });
    }

    const touch = await getTouchableProfile(adminClient, vr.profile_id, actorRole);
    if (!touch.ok) {
      return json({ error: touch.error }, { status: touch.status });
    }

    const { error: vrError } = await adminClient
      .from("verification_requests")
      .update({
        status: action === "approve_verification" ? "approved" : "rejected",
        reviewed_by: actorId,
      })
      .eq("id", target_id);

    if (vrError) {
      console.error(
        `[Admin API] Verification review action "${action}" on request ${target_id} by actor ${actorId} failed:`,
        vrError.message
      );
      return json({ error: "server_error" }, { status: 500 });
    }

    if (action === "approve_verification") {
      const { error: pError } = await adminClient
        .from("profiles")
        .update({ is_verified: true })
        .eq("id", vr.profile_id);

      if (pError) {
        console.error(
          `[Admin API] Verify profile on ${vr.profile_id} by actor ${actorId} failed:`,
          pError.message
        );
        return json({ error: "server_error" }, { status: 500 });
      }
    }

    await writeAudit(adminClient, actorId, action, "verification_requests", target_id);
    return json({ ok: true });
  }

  // ---------- Report review ----------
  if (action === "review_report" || action === "dismiss_report") {
    const { data: report } = await adminClient
      .from("reports")
      .select("id, status")
      .eq("id", target_id)
      .maybeSingle();

    if (!report || report.status !== "pending") {
      return json({ error: "not_pending" }, { status: 400 });
    }

    const { error: rError } = await adminClient
      .from("reports")
      .update({ status: action === "review_report" ? "reviewed" : "dismissed" })
      .eq("id", target_id);

    if (rError) {
      console.error(
        `[Admin API] Report review action "${action}" on report ${target_id} by actor ${actorId} failed:`,
        rError.message
      );
      return json({ error: "server_error" }, { status: 500 });
    }

    await writeAudit(adminClient, actorId, action, "reports", target_id);
    return json({ ok: true });
  }

  // ---------- Profile actions ----------
  const touch = await getTouchableProfile(adminClient, target_id, actorRole);
  if (!touch.ok) {
    return json({ error: touch.error }, { status: touch.status });
  }
  const target = touch.target;

  let update: Record<string, unknown>;

  switch (action) {
    case "set_verified":
      update = { is_verified: value ?? true };
      break;
    case "make_contributor":
      if (target.role !== "alumni") {
        return json({ error: "only_alumni" }, { status: 400 });
      }
      update = { role: "contributor" };
      break;
    case "make_alumni":
      if (target.role !== "contributor") {
        return json({ error: "only_contributor" }, { status: 400 });
      }
      update = { role: "alumni" };
      break;
    case "make_admin":
      if (actorRole !== "super_admin") {
        return json({ error: "superadmin_only" }, { status: 403 });
      }
      update = { role: "admin" };
      break;
    case "demote_admin":
      if (actorRole !== "super_admin") {
        return json({ error: "superadmin_only" }, { status: 403 });
      }
      if (target.role !== "admin") {
        return json({ error: "not_admin" }, { status: 400 });
      }
      update = { role: "alumni" };
      break;
    case "suspend":
      update = { deleted_at: new Date().toISOString() };
      break;
    case "restore":
      update = { deleted_at: null };
      break;
    default:
      return json({ error: "bad_action" }, { status: 400 });
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update(update)
    .eq("id", target_id);

  if (updateError) {
    console.error(
      `[Admin API] Profile update for action "${action}" on target ${target_id} by actor ${actorId} (${actorRole}) failed:`,
      updateError.message
    );
    return json({ error: "server_error" }, { status: 500 });
  }

  await writeAudit(adminClient, actorId, action, "profiles", target_id, update);
  return json({ ok: true });
}