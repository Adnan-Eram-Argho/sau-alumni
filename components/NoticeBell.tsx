"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

// Notun/pore-na notice-r bell — login chara dekhay na
export default function NoticeBell() {
  const [unread, setUnread] = useState<number | null>(null);
  // Client ekbar banai — prottek refreshCount-e notun banabo na
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    async function refreshCount() {
      // getSession() = token cache theke — server call nei.
      // Display-only bell count tai safe.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setUnread(null);
        return;
      }

      const { data: reads } = await supabase
        .from("notice_reads")
        .select("notice_id")
        .eq("user_id", session.user.id);

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
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink/60 transition-all hover:bg-sau/5 hover:text-sau dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
    >
      <Bell className={`h-4.5 w-4.5 ${unread && unread > 0 ? "animate-[ring_1s_ease-in-out]" : ""}`} />
      <AnimatePresence>
        {unread !== null && unread > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-sm"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes ring {
          0% { transform: rotate(0); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-14deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(3deg); }
          100% { transform: rotate(0); }
        }
      `}</style>
    </Link>
  );
}