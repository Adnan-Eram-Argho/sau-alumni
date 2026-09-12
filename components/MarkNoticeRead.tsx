"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Notice page-e boshle auto "pora hoye geche" mark hoy
export default function MarkNoticeRead({ noticeId }: { noticeId: string }) {
  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Aage theke pore thakle abar dhukay na
      const { data: existing } = await supabase
        .from("notice_reads")
        .select("notice_id")
        .eq("user_id", user.id)
        .eq("notice_id", noticeId)
        .maybeSingle();

      if (existing) return;

      await supabase
        .from("notice_reads")
        .insert({ user_id: user.id, notice_id: noticeId });
    })();
  }, [noticeId]);

  return null;
}