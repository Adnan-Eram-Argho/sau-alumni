"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Notun/pore-na notice-r bell — login chara dekhay na
export default function NoticeBell() {
  const [unread, setUnread] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function refreshCount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUnread(null);
        return;
      }

      const { data: reads } = await supabase
        .from("notice_reads")
        .select("notice_id")
        .eq("user_id", user.id);

      const readIds = new Set((reads ?? []).map((r) => r.notice_id));

      const { data: published } = await supabase
        .from("notices")
        .select("id")
        .eq("status", "published");

      const count = (published ?? []).filter((n) => !readIds.has(n.id)).length;
      setUnread(count);
    }

    refreshCount();

    // UNIQUE naam — double-mount holeo channel dhaka na pore
    const channel = supabase
      .channel(`notice-bell-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notices",
          filter: "status=eq.published",
        },
        () => refreshCount()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notices",
          filter: "status=eq.published",
        },
        () => refreshCount()
      )
      .subscribe();

    // Fallback: 60 sec por por fresh (spec: "eventually update")
    const interval = setInterval(refreshCount, 60000);

    return () => {
      // spec-niyom: unmount-e unsubscribe
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Login na korle bell thakbe (badge chara) — public board-r rasta
  return (
    <Link
      href="/notices"
      aria-label="নোটিশ বোর্ড"
      title="নোটিশ বোর্ড"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line text-lg hover:bg-base"
    >
      🔔
      {unread !== null && unread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}