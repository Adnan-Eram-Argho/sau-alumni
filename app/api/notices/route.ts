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

// Nijer DRAFT-i edit/delete kora jay
async function getOwnDraft(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  userId: string
) {
  const { data: notice } = await supabase
    .from("notices")
    .select("id, author_id, status, image_url")
    .eq("id", id)
    .maybeSingle();

  if (!notice || notice.author_id !== userId || notice.status !== "draft") {
    return null;
  }
  return notice;
}

function json(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PATCH(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.toLowerCase().includes("application/json")) {
    return json({ error: "unsupported_media_type" }, { status: 415 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "bad_request" }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;

  const own = await getOwnDraft(supabase, id, user.id);
  if (!own) {
    return json({ error: "forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service.from("notices").update(fields).eq("id", id);
  if (error) {
    console.error(`[Notices API] Update failed on notice ${id} by user ${user.id}:`, error.message);
    return json({ error: "server_error" }, { status: 500 });
  }

  return json({ ok: true });
}

export async function DELETE(request: Request) {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.toLowerCase().includes("application/json")) {
    return json({ error: "unsupported_media_type" }, { status: 415 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = z.object({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return json({ error: "bad_request" }, { status: 400 });
  }

  const own = await getOwnDraft(supabase, parsed.data.id, user.id);
  if (!own) {
    return json({ error: "forbidden" }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("notices")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error(`[Notices API] Delete failed on notice ${parsed.data.id} by user ${user.id}:`, error.message);
    return json({ error: "server_error" }, { status: 500 });
  }

  // Chobi chhilo? Storage theke-o muchhi (etim file rakhbo na)
  if (own.image_url) {
    const marker = "/object/public/notice-images/";
    const idx = own.image_url.indexOf(marker);
    if (idx !== -1) {
      const imgPath = own.image_url.slice(idx + marker.length);
      if (imgPath) {
        const { error: imgError } = await service.storage
          .from("notice-images")
          .remove([imgPath]);
        if (imgError) {
          console.error(`[Notices API] Notice image cleanup on notice ${parsed.data.id} failed:`, imgError.message);
        }
      }
    }
  }

  return json({ ok: true });
}