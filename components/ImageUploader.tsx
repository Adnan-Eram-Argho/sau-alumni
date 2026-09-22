"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export type UploadedImage = { path: string; publicUrl: string };

// Multi-purpose: notice-image (default) ba avatar —
// bucket / maxSide / square prop diye control hoy.
// Resize + EXIF-strip + WebP sob built-in.
export default function ImageUploader({
  onUploaded,
  bucket = "notice-images",
  maxSide = 1200,
  square = false,
}: {
  onUploaded?: (img: UploadedImage) => void;
  bucket?: string;
  maxSide?: number;
  square?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  async function handleFile(file: File) {
    setError(null);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("ছবির সাইজ সর্বোচ্চ ১০ মেগাবাইট হতে পারবে।");
      return;
    }

    setUploading(true);
    try {
      const bitmap = await createImageBitmap(file);

      // Avatar (square) hole center-crop
      let sx = 0;
      let sy = 0;
      let sw = bitmap.width;
      let sh = bitmap.height;
      if (square) {
        const side = Math.min(sw, sh);
        sx = Math.round((sw - side) / 2);
        sy = Math.round((sh - side) / 2);
        sw = side;
        sh = side;
      }

      const scale = Math.min(1, maxSide / Math.max(sw, sh));
      const width = Math.round(sw * scale);
      const height = Math.round(sh * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);

      // WebP prio — browser na parle JPEG
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
        .from(bucket)
        .upload(path, blob, { contentType });

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        setError("ছবি আপলোড হলো না। আবার চেষ্টা করো।");
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
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