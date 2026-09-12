import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContactPrivacyForm from "@/components/ContactPrivacyForm";

export const metadata = {
  title: "যোগাযোগ ও গোপনীয়তা — SAU Alumni",
};

export default async function ContactSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard/contact");
  }

  // Contact-er FK lagbe — profile row na thakle agey
  // profile banate bolo
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, is_public")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileRow) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold">যোগাযোগ ও গোপনীয়তা</h1>
        <div className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-100/60 p-5 text-sm dark:border-amber-500/40 dark:bg-amber-500/10">
          <p>এই সেটিংস ব্যবহার করতে আগে তোমার প্রোফাইল তৈরি করতে হবে।</p>
          <Link
            href="/dashboard/profile"
            className="mt-2 inline-block font-semibold text-sau hover:underline dark:text-emerald-300"
          >
            প্রোফাইল তৈরি করুন →
          </Link>
        </div>
      </div>
    );
  }

  // Nijer contact row (malik nijei raw table dekhte pare —
  // RLS owner policy; onnoder jonno to VIEW ache)
  const { data: contact } = await supabase
    .from("profile_contacts")
    .select("email, phone_number, phone_visibility")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">যোগাযোগ ও গোপনীয়তা</h1>
      <p className="mt-1 text-ink/60">
        কে তোমার কী দেখতে পাবে — নিয়ন্ত্রণ একদম তোমার হাতে।
      </p>

      <ContactPrivacyForm
        userId={user.id}
        email={contact?.email ?? user.email ?? ""}
        initial={{
          phone_number: contact?.phone_number ?? "",
          phone_visibility: contact?.phone_visibility ?? "private",
        }}
        isPublic={profileRow.is_public ?? true}
      />
    </div>
  );
}