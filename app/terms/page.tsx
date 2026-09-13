export const metadata = {
    title: "শর্তাবলী — SAU Alumni",
};

const sections = [
    {
        title: "এই প্ল্যাটফর্মটি কী",
        body: "শেরে-বাংলা কৃষি বিশ্ববিদ্যালয়ের প্রাক্তন ও বর্তমান শিক্ষার্থীদের জন্য একটি সম্প্রদায়-চালিত, অবাণিজ্যিক সংযোগস্থল।",
    },
    {
        title: "তোমার দায়িত্ব",
        body: "সত্য তথ্য দাও। শুধু নিজের তথ্য দাও — অন্য কারো অনুমতি ছাড়া তার তথ্য বা ছবি পোস্ট কোরো না। সম্মানজনক আচরণ করো — spam, harassment, বা ভুয়া পরিচয় কঠোরভাবে নিষিদ্ধ।",
    },
    {
        title: "কনটেন্ট",
        body: "তুমি যা লেখো বা ছবি দাও, তার দায়িত্ব তোমার। সম্প্রদায়ের সুরক্ষার জন্য রিপোর্ট ব্যবস্থা আছে — অনুপযুক্ত কনটেন্ট বা অ্যাকাউন্ট অপসারণ/সাসপেন্ড করা হতে পারে।",
    },
    {
        title: "অ্যাকাউন্ট",
        body: "নিয়ম ভাঙলে বা প্ল্যাটফর্মের সুরক্ষা বিপন্ন করলে অ্যাকাউন্ট সাসপেন্ড করা হতে পারে। নিজে অ্যাকাউন্ট মুছতে চাইলে গোপনীয়তা নীতির যোগাযোগ ঠিকানায় জানাও।",
    },
    {
        title: "পরিবর্তন",
        body: "এই শর্তাবলী ভবিষ্যতে হালনাগাদ হতে পারে — সর্বশেষ সংস্করণ সবসময় এই পেজেই থাকবে।",
    },
];

export default function TermsPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold sm:text-3xl">শর্তাবলী</h1>
            <p className="mt-1 text-ink/60">প্ল্যাটফর্ম ব্যবহারের সহজ নিয়মগুলো।</p>

            <div className="mt-8 space-y-6">
                {sections.map((s) => (
                    <section
                        key={s.title}
                        className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
                    >
                        <h2 className="font-semibold">{s.title}</h2>
                        <p className="mt-2 leading-relaxed text-ink/80">{s.body}</p>
                    </section>
                ))}
            </div>
        </div>
    );
}