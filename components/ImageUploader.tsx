"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export type UploadedImage = { path: string; publicUrl: string };

const BUCKET = "notice-images";

// Chobi barle: 1) resize (max 1200px) — EXIF/GPS muchhe dey,
// 2) WEBP-e convert (space bachai!), 3) sora Storage-te upload
export default function ImageUploader({
  onUploaded,
}: {
  onUploaded?: (img: UploadedImage) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      // Resize + EXIF strip
      const bitmap = await createImageBitmap(file);
      const maxSide = 1200;
      const scale = Math.min(
        1,
        maxSide / Math.max(bitmap.width, bitmap.height)
      );
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(bitmap, 0, 0, width, height);

      // Prio WEBP — ~25-35% chhoto file. Browser na parle
      // toBlob nijei PNG-e neme jay — sei khetre JPEG fallback
      let blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.85)
      );
      let contentType = "image/webp";

      if (!blob || blob.type !== "image/webp") {
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.85)
        );
        contentType = "image/jpeg";
      }
      if (!blob) throw new Error("blob");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("unauthorized");

      const ext = contentType === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
          contentType,
        });

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        setError("ছবি আপলোড হলো না। আবার চেষ্টা করো (JPEG/PNG/WebP)।");
        return;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      setPreview(urlData.publicUrl);
      if (onUploaded) onUploaded({ path, publicUrl: urlData.publicUrl });
    } catch (e) {
      console.error("Upload failed:", e);
      setError("ছবি আপলোড হলো না। আবার চেষ্টা করো।");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium hover:bg-base disabled:opacity-50"
      >
        {uploading ? "আপলোড হচ্ছে..." : "🖼️ ছবি বাছুন"}
      </button>

      {preview && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded"
            className="max-h-48 rounded-xl border border-line"
          />
          <p className="mt-1 break-all text-xs text-ink/50">{preview}</p>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}