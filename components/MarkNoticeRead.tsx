"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Notice page-e boshle auto "pora hoye geche" mark hoy
export default function MarkNoticeRead({ noticeId }: { noticeId: string }) {
  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.from("notice_reads").upsert(
        { user_id: session.user.id, notice_id: noticeId },
        { onConflict: "user_id,notice_id", ignoreDuplicates: true }
      );
    })();
  }, [noticeId]);

  return null;
}