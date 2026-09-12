import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import VerificationRequestCard from "@/components/VerificationRequestCard";

export const metadata = {
  title: "ড্যাশবোর্ড — SAU Alumni",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, is_verified, is_public, status, current_country, graduation_year"
    )
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as {
    id: string;
    full_name: string;
    role: string | null;
    is_verified: boolean | null;
    is_public: boolean | null;
    status: string | null;
    current_country: string | null;
    graduation_year: number | null;
  } | null;

  // Nijer verify-onurodher sesh obostha
  const { data: vr } = await supabase
    .from("verification_requests")
    .select("status")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const hasPendingRequest = vr?.[0]?.status === "pending";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">ড্যাশবোর্ড</h1>
      <p className="mt-1 text-ink/60">
        স্বাগতম{profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
      </p>

      {!profile && (
        <div className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-100/60 p-5 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="font-semibold text-amber-900 dark:text-amber-300">
            ⚠️ তোমার প্রোফাইলটি এখনো তৈরি হয়নি
          </p>
          <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-300/80">
            বন্ধুরা যেন তোমাকে খুঁজে পায় — এক মিনিটে প্রোফাইল তৈরি করে ফেলো।
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-3 inline-block rounded-xl bg-sau px-5 py-2.5 text-sm font-semibold text-white hover:bg-sau-hover"
          >
            প্রোফাইল তৈরি করুন →
          </Link>
        </div>
      )}

      {profile && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-medium text-ink/60">তোমার পরিচিতি</h2>
            <p className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-base px-3 py-1 text-sm font-medium">
                {profile.status === "current_student"
                  ? "🎓 বর্তমান শিক্ষার্থী"
                  : "Alumni"}
              </span>
              <span className="rounded-full bg-base px-3 py-1 text-sm font-medium">
                {profile.is_public ? "🌍 Public প্রোফাইল" : "🔒 Private প্রোফাইল"}
              </span>
              <span className="rounded-full bg-base px-3 py-1 text-sm font-medium">
                {profile.is_verified ? "✅ Verified" : "⏳ Verified না"}
              </span>
            </p>
            <p className="mt-3 text-sm text-ink/60">
              {profile.current_country ?? "Bangladesh"}
              {profile.graduation_year
                ? ` · ব্যাচ ${profile.graduation_year}`
                : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-medium text-ink/60">দ্রুত কাজ</h2>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                href="/dashboard/profile"
                className="block rounded-xl border border-line px-4 py-2.5 font-medium hover:bg-base"
              >
                ✏️ প্রোফাইল এডিট করুন
              </Link>
              <Link
                href={`/alumni/${profile.id}`}
                className="block rounded-xl border border-line px-4 py-2.5 font-medium hover:bg-base"
              >
                👀 নিজের পেজ দেখুন (যেমন অন্যরা দেখে)
              </Link>
              <Link
                href="/dashboard/contact"
                className="block rounded-xl border border-line px-4 py-2.5 font-medium hover:bg-base"
              >
                🔐 যোগাযোগ ও গোপনীয়তা
              </Link>
              {(profile.role === "admin" || profile.role === "super_admin") && (
                <Link
                  href="/admin"
                  className="block rounded-xl border border-line px-4 py-2.5 font-medium hover:bg-base"
                >
                  🛡️ অ্যাডমিন প্যানেল
                </Link>

                )}
                                {(profile.role === "contributor" ||
                    profile.role === "admin" ||
                    profile.role === "super_admin") && (
                    <Link
                    href="/dashboard/notices"
                    className="block rounded-xl border border-line px-4 py-2.5 font-medium hover:bg-base"
                    >
                    📢 আমার নোটিশ
                    </Link>
                )}
            </div>
          </div>
        </div>
      )}

      {profile && (
        <VerificationRequestCard
          userId={user.id}
          isVerified={!!profile.is_verified}
          hasPendingRequest={hasPendingRequest}
        />
      )}

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="text-sm font-medium text-ink/60">অ্যাকাউন্ট</h2>
        <p className="mt-2 break-all text-sm">{user.email}</p>
      </div>
    </div>
  );
}