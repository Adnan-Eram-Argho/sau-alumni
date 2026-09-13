import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContactPrivacyForm from "@/components/ContactPrivacyForm";
import AnimatedSection from "@/components/AnimatedSection";
import { AlertCircle } from "lucide-react";

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
        <AnimatedSection>
          <h1 className="text-2xl font-bold sm:text-3xl">যোগাযোগ ও গোপনীয়তা</h1>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm backdrop-blur-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">এই সেটিংস ব্যবহার করতে আগে তোমার প্রোফাইল তৈরি করতে হবে।</p>
              <Link
                href="/dashboard/profile"
                className="mt-2 inline-flex items-center gap-1 font-semibold text-sau hover:underline dark:text-emerald-400"
              >
                প্রোফাইল তৈরি করুন →
              </Link>
            </div>
          </div>
        </AnimatedSection>
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
      <AnimatedSection>
        <h1 className="text-2xl font-bold sm:text-3xl">যোগাযোগ ও গোপনীয়তা</h1>
        <p className="mt-1 text-ink/50">
          কে তোমার কী দেখতে পাবে — নিয়ন্ত্রণ একদম তোমার হাতে।
        </p>
      </AnimatedSection>

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