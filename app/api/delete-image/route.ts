import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/service-client";

const schema = z.object({ url: z.string().url() });

// Shudhu ei duita bucket amader
const ALLOWED_BUCKETS = ["avatars", "notice-images"];

export async function POST(request: Request) {
  // 1) Login ache kina
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2) Body thik ache kina
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // 3) URL theke bucket + path ber kori
  // Form: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  let bucket: string | null = null;
  let path: string | null = null;

  for (const b of ALLOWED_BUCKETS) {
    const marker = `/object/public/${b}/`;
    const idx = parsed.data.url.indexOf(marker);
    if (idx !== -1) {
      bucket = b;
      path = parsed.data.url.slice(idx + marker.length);
      break;
    }
  }

  if (!bucket || !path) {
    return NextResponse.json({ error: "bad_url" }, { status: 400 });
  }

  // 4) Nijer file to? (path-er prothom folder = nijer user id)
  //    — nahole keu onner file muchte parbe na
  if (!path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 5) Service-role diye muchhi — RLS bypass, guaranteed
  const service = createServiceClient();
  const { error } = await service.storage.from(bucket).remove([path]);

  if (error) {
    console.error("Image delete failed:", error.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}