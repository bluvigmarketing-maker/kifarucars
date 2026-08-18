"use client";

import { useId, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import {
  uploadVehicleHoverSound,
  uploadVehicleImage,
  uploadVehicleVideo,
} from "@/lib/supabase/storage";

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";

const GALLERY_MAX = 9; // + 1 cover image = 10 total

export function CoverImageField({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  return (
    <div>
      <label className={labelClasses}>Cover image</label>
      <div className="mt-1.5 flex gap-2">
        <input
          name="imageUrl"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className={`${inputClasses} mt-0 flex-1`}
          placeholder="/vehicles/placeholder-suv.svg or upload a photo"
        />
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-charcoal-200 px-3.5 py-2.5 text-sm text-charcoal-600 hover:border-burgundy-500 dark:border-charcoal-700 dark:text-charcoal-300"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Upload
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setUploading(true);
            setUploadError("");
            const result = await uploadVehicleImage(file);
            setUploading(false);
            if ("error" in result) setUploadError(result.error);
            else setValue(result.url);
          }}
        />
      </div>
      {uploadError ? <p className="mt-1 text-xs text-burgundy-600">{uploadError}</p> : null}
      {error ? <p className="mt-1 text-xs text-burgundy-600">{error}</p> : null}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview thumbnail, arbitrary external URL
        <img src={value} alt="" className="mt-2 h-24 w-32 rounded-lg object-cover" />
      ) : null}
    </div>
  );
}

export function GalleryUploadField({ defaultValue }: { defaultValue?: string[] }) {
  const id = useId();
  const [urls, setUrls] = useState<string[]>(defaultValue ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <label className={labelClasses}>
        Gallery photos ({urls.length}/{GALLERY_MAX})
      </label>
      <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
        Shown on the vehicle&apos;s detail page, in addition to the cover image above (10 photos total).
      </p>

      {urls.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {urls.map((url, i) => (
            <div key={url} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview thumbnail, arbitrary external URL */}
              <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setUrls((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal-900 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3">
        <label
          htmlFor={id}
          className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-charcoal-300 px-3.5 py-2.5 text-sm text-charcoal-600 hover:border-burgundy-500 dark:border-charcoal-700 dark:text-charcoal-300"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Add photos
        </label>
        <input
          id={id}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={urls.length >= GALLERY_MAX}
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []).slice(0, GALLERY_MAX - urls.length);
            e.target.value = "";
            if (files.length === 0) return;
            setUploading(true);
            setError("");
            for (const file of files) {
              const result = await uploadVehicleImage(file);
              if ("error" in result) {
                setError(result.error);
              } else {
                setUrls((prev) => (prev.length < GALLERY_MAX ? [...prev, result.url] : prev));
              }
            }
            setUploading(false);
          }}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-burgundy-600">{error}</p> : null}
      <input type="hidden" name="galleryUrls" value={JSON.stringify(urls)} />
    </div>
  );
}

export function VideoUploadField({ defaultValue }: { defaultValue?: string | null }) {
  const id = useId();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <label className={labelClasses}>Hover-autoplay video</label>
      <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
        MP4 or WEBM, 60 seconds or shorter, up to 50MB. Plays muted &amp; looped when a visitor hovers the vehicle card.
      </p>

      <div className="mt-2 flex items-center gap-3">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-charcoal-200 px-3.5 py-2.5 text-sm text-charcoal-600 hover:border-burgundy-500 dark:border-charcoal-700 dark:text-charcoal-300"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {url ? "Replace video" : "Upload video"}
        </label>
        <input
          id={id}
          type="file"
          accept="video/mp4,video/webm"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setUploading(true);
            setError("");
            const result = await uploadVehicleVideo(file);
            setUploading(false);
            if ("error" in result) setError(result.error);
            else setUrl(result.url);
          }}
        />
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-xs text-charcoal-500 underline hover:text-burgundy-600 dark:text-charcoal-400"
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-xs text-burgundy-600">{error}</p> : null}
      {url ? <video src={url} controls muted className="mt-2 h-32 rounded-lg" /> : null}
      <input type="hidden" name="videoUrl" value={url} />
    </div>
  );
}

export function HoverSoundUploadField({ defaultValue }: { defaultValue?: string | null }) {
  const id = useId();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <label className={labelClasses}>Custom hover sound</label>
      <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
        MP3, WAV, or OGG, up to 5MB. Plays when a visitor hovers the vehicle card, instead of the default engine sound.
      </p>

      <div className="mt-2 flex items-center gap-3">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-charcoal-200 px-3.5 py-2.5 text-sm text-charcoal-600 hover:border-burgundy-500 dark:border-charcoal-700 dark:text-charcoal-300"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {url ? "Replace sound" : "Upload sound"}
        </label>
        <input
          id={id}
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setUploading(true);
            setError("");
            const result = await uploadVehicleHoverSound(file);
            setUploading(false);
            if ("error" in result) setError(result.error);
            else setUrl(result.url);
          }}
        />
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-xs text-charcoal-500 underline hover:text-burgundy-600 dark:text-charcoal-400"
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-xs text-burgundy-600">{error}</p> : null}
      {url ? <audio src={url} controls className="mt-2 h-9" /> : null}
      <input type="hidden" name="hoverSoundUrl" value={url} />
    </div>
  );
}
