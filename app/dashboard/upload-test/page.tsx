import ImageUploader from "@/components/ImageUploader";

export const metadata = {
  title: "ছবি আপলোড টেস্ট — SAU Alumni",
};

export default function UploadTestPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-xl font-bold">ছবি আপলোড টেস্ট</h1>
      <p className="mt-1 text-sm text-ink/60">
        ছবি বাছলে: সেটা ছোট হবে (সর্বোচ্চ ১২০০px), GPS-তথ্য মুছে যাবে, আর
        যাবে সরাসরি Cloudflare R2-তে — তোমার server হালকা থাকবে।
      </p>
      <div className="mt-6">
        <ImageUploader />
      </div>
    </div>
  );
}