"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";
import { COUNTRIES } from "@/utils/countries";

const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "নাম অন্তত ২ অক্ষরের হতে হবে" })
    .max(100, { message: "নাম খুব বড় হয়ে গেছে" }),
  email: z.string().trim().email({ message: "সঠিক ইমেইল ঠিকানা দিন" }),
  password: z
    .string()
    .min(10, { message: "পাসওয়ার্ড অন্তত ১০ অক্ষরের হতে হবে" })
    .max(72, { message: "পাসওয়ার্ড ৭২ অক্ষরের মধ্যে রাখুন" }),
  departmentId: z.string().min(1, { message: "বিভাগ বেছে নাও" }),
  status: z.enum(["alumnus", "current_student"]),
  currentCountry: z.string().min(1, { message: "দেশ বেছে নাও" }),
  graduationYear: z
    .number()
    .int({ message: "বছরটা সংখ্যায় দাও" })
    .min(1900, { message: "বছরটা দেখে নাও" })
    .max(2105, { message: "বছরটা দেখে নাও" })
    .nullable(),
  currentDesignation: z.string().trim().max(100).nullable(),
  currentCompany: z.string().trim().max(100).nullable(),
  linkedinUrl: z
    .string()
    .trim()
    .refine((v) => !v || /^https:\/\/(www\.)?linkedin\.com\/.+/i.test(v), {
      message: "LinkedIn-এর পূর্ণ লিংক দাও (https:// দিয়ে শুরু)",
    })
    .nullable(),
  higherStudyProgram: z.string().trim().max(200).nullable(),
  higherStudyInstitution: z.string().trim().max(200).nullable(),
});

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [departments, setDepartments] = useState<
    { id: string; name: string; facultyName: string | null }[]
  >([]);
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<"alumnus" | "current_student">("alumnus");
  const [currentCountry, setCurrentCountry] = useState("Bangladesh");
  const [batchYear, setBatchYear] = useState("");

  const [skipBatch, setSkipBatch] = useState(false);
  const [skipCareer, setSkipCareer] = useState(false);
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [skipLinkedin, setSkipLinkedin] = useState(false);
  const [linkedin, setLinkedin] = useState("");
  const [skipHigher, setSkipHigher] = useState(false);
  const [higherProgram, setHigherProgram] = useState("");
  const [higherInstitution, setHigherInstitution] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("departments")
      .select("id, name, faculties(name)")
      .order("name")
      .then(({ data }) => {
        const list = (data ?? []) as unknown as {
          id: string;
          name: string;
          faculties: { name: string } | null;
        }[];
        const mapped = list.map((d) => ({
          id: d.id,
          name: d.name,
          facultyName: d.faculties?.name ?? null,
        }));
        setDepartments(mapped);
        if (mapped.length === 1) setDepartmentId(mapped[0].id);
      });
  }, []);

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const result = signupSchema.safeParse({
      fullName,
      email,
      password,
      departmentId,
      status,
      currentCountry,
      graduationYear: skipBatch ? null : batchYear ? Number(batchYear) : null,
      currentDesignation: skipCareer ? null : designation || null,
      currentCompany: skipCareer ? null : company || null,
      linkedinUrl: skipLinkedin ? null : linkedin || null,
      higherStudyProgram: skipHigher ? null : higherProgram || null,
      higherStudyInstitution: skipHigher ? null : higherInstitution || null,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: { full_name: result.data.fullName },
        },
      });

      if (signupError) {
        const msg = signupError.message.toLowerCase();
        if (msg.includes("already")) {
          setError("এই ইমেইল দিয়ে অ্যাকাউন্ট ইতিমধ্যে আছে। লগইন করুন।");
        } else if (msg.includes("password")) {
          setError(
            "পাসওয়ার্ডটি দুর্বল বা চুরি-হওয়া তালিকায় ধরা পড়েছে। একদম নতুন, এলোমেলা একটা পাসওয়ার্ড দিন।"
          );
        } else {
          setError("কিছু একটা সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।");
        }
        return;
      }

      if (data.user) {
        // Profile row — ekhon purno info soho
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: result.data.fullName,
          department_id: result.data.departmentId,
          graduation_year: result.data.graduationYear,
          status: result.data.status,
          current_country: result.data.currentCountry,
          current_designation: result.data.currentDesignation,
          current_company: result.data.currentCompany,
          linkedin_url: result.data.linkedinUrl,
          higher_study_program: result.data.higherStudyProgram,
          higher_study_institution: result.data.higherStudyInstitution,
        });

        if (insertError) {
          console.error("Profile insert failed:", insertError.message);
        }

        const { error: contactError } = await supabase
          .from("profile_contacts")
          .insert({
            profile_id: data.user.id,
            email: result.data.email,
          });

        if (contactError) {
          console.error("Contact insert failed:", contactError.message);
        }
      }

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm transition-all focus:border-sau focus:outline-none focus:ring-2 focus:ring-sau/10";

  const sectionTitle = "text-sm font-semibold text-sau dark:text-emerald-300";
  const laterBox =
    "flex cursor-pointer items-center gap-2 text-xs text-ink/50 hover:text-ink/70";

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-line shadow-xl">
        {/* Left panel — decorative gradient */}
        <div className="hidden w-2/5 gradient-hero p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-lg font-black backdrop-blur-sm">
              SAU
            </div>
            <h2 className="mt-6 text-2xl font-bold leading-snug">
              SAU পরিবারে
              <br />
              যোগ দাও!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
              একবারেই প্রোফাইল বানিয়ে ফেলো — ব্যাচমেটরা সাথে সাথে খুঁজে পাবে।
              সম্পূর্ণ বিনামূল্যে।
            </p>
          </div>
          <p className="text-xs text-emerald-100/50">
            গবেষণা · শিক্ষা · সম্প্রসারণ
          </p>
        </div>

        {/* Right panel — form */}
        <div
          data-lenis-prevent="true"
          className="max-h-[85vh] flex-1 overflow-y-auto overscroll-contain scroll-smooth bg-surface p-8 sm:p-10"
        >
          <h1 className="text-2xl font-bold">নতুন অ্যাকাউন্ট খুলুন</h1>
          <p className="mt-1 text-sm text-ink/50">SAU Alumni নেটওয়ার্কে যোগ দিন</p>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <p className={sectionTitle}>অ্যাকাউন্ট</p>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium">
                পুরো নাম <span className="text-ink/35">(ইংরেজিতে লিখুন)</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Adnan Eram Argho"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                ইমেইল
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                পাসওয়ার্ড
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="অন্তত ১০ অক্ষর"
                className={inputClass}
                required
              />
              <p className="mt-1.5 text-xs text-ink/40">অন্তত ১০ অক্ষর দিন</p>
            </div>

            <p className="pt-3 text-sm font-semibold text-sau dark:text-emerald-300">
              তোমার পরিচয়
            </p>

            <div>
              <label htmlFor="department" className="block text-sm font-medium">
                বিভাগ
              </label>
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">— বিভাগ বেছে নাও —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.facultyName ? ` (${d.facultyName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium">আমি একজন</span>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "alumnus"}
                    onChange={() => setStatus("alumnus")}
                    className="accent-sau"
                  />
                  প্রাক্তন শিক্ষার্থী
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "current_student"}
                    onChange={() => setStatus("current_student")}
                    className="accent-sau"
                  />
                  বর্তমান শিক্ষার্থী
                </label>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="country" className="block text-sm font-medium">
                  বর্তমানে কোথায় আছো?
                </label>
                <select
                  id="country"
                  value={currentCountry}
                  onChange={(e) => setCurrentCountry(e.target.value)}
                  className={inputClass}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="batch" className="block text-sm font-medium">
                    ব্যাচের বছর
                  </label>
                  <label className={laterBox}>
                    <input
                      type="checkbox"
                      checked={skipBatch}
                      onChange={(e) => setSkipBatch(e.target.checked)}
                      className="accent-sau"
                    />
                    পরে দেব
                  </label>
                </div>
                <input
                  id="batch"
                  type="number"
                  disabled={skipBatch}
                  value={skipBatch ? "" : batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  placeholder="e.g. 2020"
                  className={inputClass}
                />
              </div>
            </div>

            {/* বর্তমান কর্মক্ষেত্র */}
            <div>
              <div className="flex items-center justify-between">
                <p className={sectionTitle}>বর্তমান কর্মক্ষেত্র</p>
                <label className={laterBox}>
                  <input
                    type="checkbox"
                    checked={skipCareer}
                    onChange={(e) => setSkipCareer(e.target.checked)}
                    className="accent-sau"
                  />
                  পরে দেব
                </label>
              </div>
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="designation"
                    className="block text-sm font-medium"
                  >
                    পদবি (Designation)
                  </label>
                  <input
                    id="designation"
                    type="text"
                    disabled={skipCareer}
                    value={skipCareer ? "" : designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Agricultural Officer"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium"
                  >
                    প্রতিষ্ঠান / কোম্পানি
                  </label>
                  <input
                    id="company"
                    type="text"
                    disabled={skipCareer}
                    value={skipCareer ? "" : company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. BRAC"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="linkedin"
                  className="block text-sm font-medium"
                >
                  LinkedIn প্রোফাইলের লিংক
                </label>
                <label className={laterBox}>
                  <input
                    type="checkbox"
                    checked={skipLinkedin}
                    onChange={(e) => setSkipLinkedin(e.target.checked)}
                    className="accent-sau"
                  />
                  পরে দেব
                </label>
              </div>
              <input
                id="linkedin"
                type="url"
                disabled={skipLinkedin}
                value={skipLinkedin ? "" : linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/..."
                className={inputClass}
              />
            </div>

            {/* উচ্চশিক্ষা */}
            <div>
              <div className="flex items-center justify-between">
                <p className={sectionTitle}>
                  উচ্চশিক্ষা{" "}
                  <span className="text-xs font-normal text-ink/40">
                    (প্রযোজ্য হলে)
                  </span>
                </p>
                <label className={laterBox}>
                  <input
                    type="checkbox"
                    checked={skipHigher}
                    onChange={(e) => setSkipHigher(e.target.checked)}
                    className="accent-sau"
                  />
                  পরে দেব
                </label>
              </div>
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="higherProgram"
                    className="block text-sm font-medium"
                  >
                    প্রোগ্রাম
                  </label>
                  <input
                    id="higherProgram"
                    type="text"
                    disabled={skipHigher}
                    value={skipHigher ? "" : higherProgram}
                    onChange={(e) => setHigherProgram(e.target.value)}
                    placeholder="e.g. MSc Agricultural Economics"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="higherInstitution"
                    className="block text-sm font-medium"
                  >
                    প্রতিষ্ঠান
                  </label>
                  <input
                    id="higherInstitution"
                    type="text"
                    disabled={skipHigher}
                    value={skipHigher ? "" : higherInstitution}
                    onChange={(e) => setHigherInstitution(e.target.value)}
                    placeholder="e.g. University of Tokyo"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl bg-sau py-3 font-semibold text-white transition-all hover:bg-sau-hover disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? "অপেক্ষা করুন..." : "অ্যাকাউন্ট খুলুন"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/50">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-sau transition-colors hover:underline dark:text-emerald-300"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}