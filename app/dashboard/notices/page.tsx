import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import MyNoticesList from "@/components/MyNoticesList";

export const metadata = {
  title: "আমার নোটিশ — SAU Alumni",
};

export default async function MyNoticesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard/notices");
  }

  const { data: notices } = await supabase
    .from("notices")
    .select("id, title, status, pinned, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const list = (notices ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    status: n.status,
    pinned: n.pinned,
    date: n.created_at?.slice(0, 10) ?? "",
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">আমার নোটিশ</h1>
        <Link
          href="/dashboard/notices/new"
          className="rounded-xl bg-sau px-4 py-2.5 text-sm font-semibold text-white hover:bg-sau-hover"
        >
          + নতুন নোটিশ
        </Link>
      </div>

      <MyNoticesList notices={list} />
    </div>
  );
}