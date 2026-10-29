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

  const { data: faculties } = await supabase.from("faculties").select("id, name");
  const faculty = (faculties ?? []).find((item) => item.name === "Agribusiness Management");
  const { data: departments } = faculty
    ? await supabase.from("departments").select("id, name").eq("faculty_id", faculty.id).order("name")
    : { data: [] };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">নতুন নোটিশ</h1>
      <p className="mt-1 text-ink/60">
        খসড়া হিসেবে সেভ হবে — admin প্রকাশ করলে সবাই দেখবে।
      </p>

      <NoticeForm
        userId={user.id}
        facultyId={faculty?.id ?? ""}
        departments={(departments ?? []).map((d) => ({
          id: d.id,
          name: d.name,
          facultyId: faculty?.id ?? null,
          facultyName: faculty?.name ?? null,
        }))}
      />
    </div>
  );
}
