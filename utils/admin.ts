import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// Ei file SOHDSHU server-e cholbe — kono page/component-e
// "use client" diye import kora jabe na. Service-role key
// kokhono browser-e pouchhay na.

type AdminCheck =
  | {
      ok: true;
      adminClient: SupabaseClient;
      actorId: string;
      actorRole: "admin" | "super_admin";
    }
  | { ok: false; status: 401 | 403 };

// 1) ke call korlo ta cookie theke khuje nao,
// 2) tar role DB theke mew — client-r kotha biswas na,
// 3) role admin/super_admin hole-i service-role client dao
export async function requireAdmin(): Promise<AdminCheck> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "admin" && role !== "super_admin") {
    return { ok: false, status: 403 };
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  return {
    ok: true,
    adminClient,
    actorId: user.id,
    actorRole: role,
  };
}

// Prottek admin kajer hishab — opuruddhi khate
export async function writeAudit(
  adminClient: SupabaseClient,
  actorId: string,
  action: string,
  targetTable: string,
  targetId: string,
  metadata?: Record<string, unknown>
) {
  const { error } = await adminClient.from("audit_log").insert({
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata: metadata ?? null,
  });

  if (error) {
    console.error(
      `[Audit Log Failure] Failed to record audit log for action "${action}" on ${targetTable}/${targetId} by actor ${actorId}:`,
      error.message
    );
  }
}