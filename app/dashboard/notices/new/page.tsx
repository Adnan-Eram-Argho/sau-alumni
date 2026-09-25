import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NoticeForm from "@/components/NoticeForm";

export const metadata = {
  title: "নতুন নোটিশ — SAU Alumni",
};

export default async function NewNoticePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard/notices/new");
  }

  // Shudhu contributor+ likhte pare — server-side check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "contributor" && role !== "admin" && role !== "super_admin") {
    redirect("/dashboard");
  }

  const [{ data: faculties }, { data: departments }] = await Promise.all([
    supabase
      .from("faculties")
      .select("id, name")
      .order("name"),
    supabase
      .from("departments")
      .select("id, name, faculty_id, faculties(name)")
      .order("name"),
  ]);

  const deptList = (departments ?? []) as unknown as {
    id: string;
    name: string;
    faculty_id: string | null;
    faculties: { name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">নতুন নোটিশ</h1>
      <p className="mt-1 text-ink/60">
        খসড়া হিসেবে সেভ হবে — admin প্রকাশ করলে সবাই দেখবে।
      </p>

      <NoticeForm
        userId={user.id}
        faculties={(faculties ?? []).map((f) => ({ id: f.id, name: f.name }))}
        departments={deptList.map((d) => ({
          id: d.id,
          name: d.name,
          facultyId: d.faculty_id,
          facultyName: d.faculties?.name ?? null,
        }))}
      />
    </div>
  );
}