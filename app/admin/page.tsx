import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/admin";
import AdminMemberList from "@/components/AdminMemberList";
import HomepageImageManager from "@/components/HomepageImageManager";

export const metadata = {
  title: "অ্যাডমিন — SAU Alumni",
};

export default async function AdminPage() {
  const check = await requireAdmin();
  if (!check.ok) {
    redirect("/dashboard");
  }

  const { adminClient, actorRole } = check;

  // Free-tier memory guard: max 300 recent profiles & contacts fetched at once.
  // Note: Client-side batch filter covers currently loaded items. Server pagination deferred to §25.
  const [
    { data: members },
    { data: contacts },
    { data: heroImages },
  ] = await Promise.all([
    adminClient
      .from("profiles")
      .select(
        "id, full_name, role, is_permanent, is_verified, deleted_at, created_at, graduation_year"
      )
      .order("created_at", { ascending: false })
      .limit(300),
    adminClient
      .from("profile_contacts")
      .select("profile_id, email")
      .limit(300),
    adminClient
      .from("homepage_images")
      .select("id, image_url")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  const emailMap: Record<string, string> = {};
  (contacts ?? []).forEach((c) => {
    emailMap[c.profile_id] = c.email;
  });

  const list = (members ?? []).map((m) => ({
    id: m.id,
    full_name: m.full_name,
    role: m.role,
    is_permanent: m.is_permanent,
    is_verified: m.is_verified,
    deleted: !!m.deleted_at,
    email: emailMap[m.id] ?? "—",
    joined: m.created_at?.slice(0, 10) ?? "",
    batch: m.graduation_year ?? null,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">অ্যাডমিন প্যানেল</h1>
      <p className="mt-1 text-ink/50">
        মোট {list.length} জন সদস্য — প্রতিটা কাজ audit log-e লেখা হচ্ছে।
      </p>

      <Link
        href="/admin/queues"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sau transition-colors hover:underline dark:text-emerald-300"
      >
        অনুরোধ ও অভিযোগ queue →
      </Link>

      {/* Homepage carousel manager */}
      <div className="mt-6">
        <HomepageImageManager
          images={(heroImages ?? []).map((img) => ({
            id: img.id,
            image_url: img.image_url,
          }))}
        />
      </div>

      <AdminMemberList members={list} actorRole={actorRole} />
    </div>
  );
}