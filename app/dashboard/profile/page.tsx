import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProfileEditForm, {
  type ProfileInitial,
} from "@/components/ProfileEditForm";
import AnimatedSection from "@/components/AnimatedSection";

export const metadata = {
  title: "প্রোফাইল এডিট — SAU Alumni",
};

export default async function ProfileEditPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard/profile");
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      `id, full_name, avatar_url, department_id, graduation_year, status,
       current_designation, current_company, linkedin_url,
       current_country, higher_study_institution, higher_study_program, bio`
    )
    .eq("id", user.id)
    .maybeSingle();

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, faculties(name)")
    .order("name");

  const deptList = (departments ?? []) as unknown as {
    id: string;
    name: string;
    faculty_id: string | null;
    faculties: { name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <AnimatedSection>
        <h1 className="text-2xl font-bold sm:text-3xl">প্রোফাইল এডিট</h1>
        <p className="mt-1 text-ink/50">
          তথ্যগুলো ইংরেজিতে লিখবে — যেন বন্ধুরা সার্চে খুঁজে পায়।
        </p>
      </AnimatedSection>

      <ProfileEditForm
        userId={user.id}
        initial={data as ProfileInitial | null}
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