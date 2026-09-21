export const metadata = {
    title: "গোপনীয়তা নীতি",
    description: "SAU Alumni Network-এ তোমার তথ্য কীভাবে সংগ্রহ ও ব্যবহৃত হয় — সহজ ভাষায়। Privacy policy for SAU Alumni Network.",
    alternates: {
        canonical: "https://sau-alumni.vercel.app/privacy",
    },
};

const sections = [
    {
        title: "আমরা কী তথ্য সংগ্রহ করি",
        body: "অ্যাকাউন্ট তথ্য (নাম, ইমেইল — পাসওয়ার্ড এনক্রিপ্টেড থাকে, আমরাও দেখতে পারি না), প্রোফাইল তথ্য (বিভাগ, ব্যাচ, দেশ, পদবি, প্রতিষ্ঠান, উচ্চশিক্ষা, পরিচিতি, প্রোফাইল ছবি), যোগাযোগ তথ্য (ইমেইল ও ফোন), এবং কোন নোটিশ পড়েছ তার হিসাব (শুধু অপঠিত-ব্যাজের জন্য)।",
    },
    {
        title: "প্রোফাইল ছবি নিয়ে",
        body: "ছবি আপলোডের সময় স্বয়ংক্রিয়ভাবে সাইজ ছোট করা হয়, ফরম্যাট বদলানো হয় (WebP), এবং ছবির ভেতরের EXIF তথ্য (GPS লোকেশন-সহ) মুছে ফেলা হয়। অর্থাৎ ছবির লোকেশন-তথ্য আমাদের সার্ভারে পৌঁছায় না।",
    },
    {
        title: "কে কী দেখতে পায়",
        body: "Public প্রোফাইল ইন্টারনেটের যে-কেউ দেখতে পারে; Private প্রোফাইল শুধু তুমি নিজে। ফোন নম্বর শুধু তোমার বাছাই করা দর্শকদের কাছে যায় (কারো না / শুধু লগইন-করা সদস্য / সবাই) — এই নিয়ন্ত্রণ একদম তোমার হাতে, যোগাযোগ সেটিংস থেকে যেকোনো সময় বদলাতে পারবে। অ্যাডমিনরা মডারেশনের প্রয়োজনে তথ্য দেখতে পারেন।",
    },
    {
        title: "তৃতীয় পক্ষের সেবা",
        body: "প্ল্যাটফর্মটি চালাতে আমরা ব্যবহার করি: Vercel (ওয়েবসাইট হোস্টিং), Supabase (ডেটাবেস, লগইন ও ছবি-সংরক্ষণ — সিঙ্গাপুর অঞ্চল), এবং Upstash (দুর্ব্যবহার ঠেকার রেট-লিমিটিং)। এই সেবাগুলো তথ্য ব্যবহার করে শুধু প্ল্যাটফর্ম চালানোর জন্য — কারো কাছে বিক্রি করা হয় না।",
    },
    {
        title: "তথ্য কতদিন থাকে",
        body: "অ্যাকাউন্ট সচল থাকলে তোমার তথ্য থাকে। অ্যাকাউন্ট ও সব তথ্য মুছে ফেলতে চাইলে নিচের যোগাযোগ ঠিকানায় জানাও — প্রোফাইল ও ছবি মুছে দেওয়া হবে।",
    },
    {
        title: "নিরাপত্তা",
        body: "সব যোগাযোগ এনক্রিপ্টেড (HTTPS), এবং ডেটাবেসে row-level security চালু — অর্থাৎ কার কী তথ্য দেখার অনুমতি আছে সেটা ডেটাবেস নিজেই নিশ্চিত করে।",
    },
];

export default function PrivacyPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold sm:text-3xl">গোপনীয়তা নীতি</h1>
            <p className="mt-1 text-ink/60">
                তোমার তথ্য কীভাবে সংগ্রহ ও ব্যবহৃত হয় — সহজ ভাষায়।
            </p>

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

                <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                    <h2 className="font-semibold">যোগাযোগ</h2>
                    <p className="mt-2 leading-relaxed text-ink/80">
                        যেকোনো প্রশ্ন বা অনুরোধে:{" "}
                        <a
                            href="mailto:adnaneramargho@gmail.com"
                            className="font-medium text-sau hover:underline dark:text-emerald-300"
                        >
                            adnaneramargho@gmail.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
}