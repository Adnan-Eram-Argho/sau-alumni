import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/service-client";

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(5, { message: "শিরোনাম অন্তত ৫ অক্ষরের" })
    .max(150),
  content: z.string().trim().min(10).max(20000),
  image_url: z.string().nullable(),
  faculty_id: z.string().nullable(),
  department_id: z.string().nullable(),
});

// Nijer DRAFT-i edit/delete kora jay — server-e
// jachai (spec: notice update service-route diye)
async function getOwnDraft(supabase: Awaited<ReturnType<typeof createClient>>, id: string, userId: string) {
  const { data: notice } = await supabase
    .from("notices")
    .select("id, author_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!notice || notice.author_id !== userId || notice.status !== "draft") {
    return null;
  }
  return notice;
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;

  const own = await getOwnDraft(supabase, id, user.id);
  if (!own) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service.from("notices").update(fields).eq("id", id);
  if (error) {
    console.error("Notice update failed:", error.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const own = await getOwnDraft(supabase, parsed.data.id, user.id);
  if (!own) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("notices")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("Notice delete failed:", error.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}