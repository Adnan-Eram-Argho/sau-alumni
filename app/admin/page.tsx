import { redirect } from "next/navigation";
import { requireAdmin } from "@/utils/admin";
import AdminMemberList from "@/components/AdminMemberList";

export const metadata = {
  title: "অ্যাডমিন — SAU Alumni",
};

export default async function AdminPage() {
  // Admin na? Dhuktei parbe na (super_admin o 403 —
  // login-chara o na, karon middleware talabondho)
  const check = await requireAdmin();
  if (!check.ok) {
    redirect("/dashboard");
  }

  const { adminClient, actorRole } = check;

  // SOB member — private/suspended soho (service-role)
  const { data: members } = await adminClient
    .from("profiles")
    .select(
      "id, full_name, role, is_permanent, is_verified, deleted_at, created_at"
    )
    .order("created_at", { ascending: false });

  const { data: contacts } = await adminClient
    .from("profile_contacts")
    .select("profile_id, email");

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
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">অ্যাডমিন প্যানেল</h1>
      <p className="mt-1 text-ink/60">
        মোট {list.length} জন সদস্য — প্রতিটা কাজ audit log-e লেখা হচ্ছে।
      </p>

      <AdminMemberList members={list} actorRole={actorRole} />
    </div>
  );
}