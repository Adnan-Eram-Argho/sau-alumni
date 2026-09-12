import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NoticeForm from "@/components/NoticeForm";

export const metadata = {
  title: "নোটিশ এডিট — SAU Alumni",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    redirect("/dashboard/notices");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=/dashboard/notices/${id}/edit`);
  }

  // Nijer DRAFT-i edit kora jay
  const { data: notice } = await supabase
    .from("notices")
    .select(
      "id, author_id, status, title, content, image_url, faculty_id, department_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (!notice || notice.author_id !== user.id || notice.status !== "draft") {
    redirect("/dashboard/notices");
  }

  const { data: faculties } = await supabase
    .from("faculties")
    .select("id, name")
    .order("name");

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, faculty_id, faculties(name)")
    .order("name");

  const deptList = (departments ?? []) as unknown as {
    id: string;
    name: string;
    faculty_id: string | null;
    faculties: { name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">নোটিশ এডিট</h1>
      <p className="mt-1 text-ink/60">খসড়াটা সাজিয়ে নাও।</p>

      <NoticeForm
        mode="edit"
        noticeId={id}
        userId={user.id}
        initial={{
          title: notice.title,
          content: notice.content,
          image_url: notice.image_url,
          faculty_id: notice.faculty_id,
          department_id: notice.department_id,
        }}
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