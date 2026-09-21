"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import ImageUploader from "@/components/ImageUploader";
import {
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    ImagePlus,
} from "lucide-react";

type ImageItem = { id: string; image_url: string };

// Admin: homepage carousel chobi add/remove.
// Shob chobi sorano hoye gele homepage automatic default
// design-e fire jay.
export default function HomepageImageManager({
    images,
}: {
    images: ImageItem[];
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ text: string; success: boolean } | null>(
        null
    );
    const [uploading, setUploading] = useState(false);

    async function handleUpload(publicUrl: string) {
        setUploading(true);
        setMessage(null);
        try {
            const supabase = createClient();
            // Notoon chobi shesh-e jabe — sort_order boro
            const maxSort = images.length;
            const { error } = await supabase.from("homepage_images").insert({
                image_url: publicUrl,
                sort_order: maxSort,
            });

            if (error) {
                console.error("Homepage image insert failed:", error.message);
                setMessage({ text: "যোগ করা গেলো না", success: false });
                return;
            }

            setMessage({ text: "ছবি যোগ হয়েছে ✓", success: true });
            router.refresh();
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("ছবিটা homepage carousel থেকে সরাবে? Storage থেকেও মুছে যাবে।")) {
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete_homepage_image", target_id: id }),
            });

            if (!res.ok) {
                setMessage({ text: "সরানো গেলো না", success: false });
                return;
            }

            setMessage({ text: "সরানো হয়েছে ✓", success: true });
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="glass-card gradient-border rounded-2xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ImagePlus className="h-5 w-5 text-sau" />
                Homepage Carousel
            </h2>
            <p className="mt-1 text-sm text-ink/50">
                ছবি থাকলে homepage-এ hero-র জায়গায় carousel দেখাবে; কোনো ছবি না থাকলে
                ডিফল্ট 3D design দেখাবে।
            </p>

            {message && (
                <div
                    className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm ${message.success
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                >
                    {message.success ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Existing chobi */}
            {images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="group relative overflow-hidden rounded-xl border border-line"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.image_url}
                                alt="Homepage slide"
                                className="h-28 w-full object-cover"
                            />
                            <button
                                onClick={() => handleDelete(img.id)}
                                disabled={busy}
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-red-600 disabled:opacity-50 group-hover:opacity-100"
                                aria-label="ছবি সরাও"
                            >
                                {busy ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Notun chobi upload */}
            <div className="mt-5">
                {uploading && (
                    <p className="mb-2 flex items-center gap-2 text-sm text-ink/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        প্রসেস + আপলোড হচ্ছে...
                    </p>
                )}
                <ImageUploader
                    bucket="homepage-images"
                    maxSide={1920}
                    onUploaded={(img) => handleUpload(img.publicUrl)}
                />
                <p className="mt-2 text-xs text-ink/40">
                    বড় ছবি দাও (ক্যাম্পাস/ইভেন্ট) — ১৯২০px পর্যন্ত resize হয়ে WebP-তে সেভ
                    হবে, quality থাকবে ঝকঝকে।
                </p>
            </div>
        </div>
    );
}