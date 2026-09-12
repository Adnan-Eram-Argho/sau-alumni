import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProfileEditForm, {
  type ProfileInitial,
} from "@/components/ProfileEditForm";

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

  // Department list — faculty-r naam soho (database theke)
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, faculties(name)")
    .order("name");

  // as unknown as — supabase-r type-inference embed (faculties)
  // ke array dhoray, runtime-e asole single object ashe.
  // Directory page-e jei trick chhilo sei-i.
  const deptList = (departments ?? []) as unknown as {
    id: string;
    name: string;
    faculties: { name: string } | null;
  }[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">প্রোফাইল এডিট</h1>
      <p className="mt-1 text-ink/60">
        তথ্যগুলো ইংরেজিতে লিখবে — যেন বন্ধুরা সার্চে খুঁজে পায়।
      </p>

      <ProfileEditForm
        userId={user.id}
        initial={data as ProfileInitial | null}
        departments={deptList.map((d) => ({
          id: d.id,
          name: d.name,
          facultyName: d.faculties?.name ?? null,
        }))}
      />
    </div>
  );
}