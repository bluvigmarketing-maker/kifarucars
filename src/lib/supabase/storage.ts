import { createClient } from "./client";

const MAX_LOGBOOK_SIZE_BYTES = 10 * 1024 * 1024; // 10MB, matches the bucket's file_size_limit
const ALLOWED_LOGBOOK_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/**
 * Uploads a car-owner's logbook photo/PDF to the private `logbooks` bucket
 * from the browser (anon insert-only — see supabase/migrations/0004). Called
 * directly from the public application form, before an admin account or
 * server-side session exists for that applicant.
 */
export async function uploadLogbookFile(
  file: File
): Promise<{ path: string } | { error: string }> {
  if (!ALLOWED_LOGBOOK_TYPES.includes(file.type)) {
    return { error: "Logbook must be a JPG, PNG, WEBP, or PDF file." };
  }
  if (file.size > MAX_LOGBOOK_SIZE_BYTES) {
    return { error: "Logbook file must be 10MB or smaller." };
  }

  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `applications/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from("logbooks").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { error: "Could not upload logbook. Please try again." };
  return { path };
}

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB, matches vehicle-images bucket limit
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB, matches vehicle-videos bucket limit
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_VIDEO_DURATION_SECONDS = 60;

const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches vehicle-audio bucket limit
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"];

function safeFileName(file: File) {
  return file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadPublicFile(
  bucket: string,
  folder: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();
  const path = `${folder}/${crypto.randomUUID()}-${safeFileName(file)}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { error: "Upload failed. Please try again." };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

/** Uploads a vehicle gallery/cover photo to the public `vehicle-images` bucket. */
export async function uploadVehicleImage(
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Image must be a JPG, PNG, or WEBP file." };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { error: "Image must be 8MB or smaller." };
  }
  return uploadPublicFile("vehicle-images", "vehicles", file);
}

/** Reads a video file's duration in the browser via a temporary <video> element. */
function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata."));
    };
    video.src = url;
  });
}

/**
 * Uploads a hover-autoplay vehicle video to the public `vehicle-videos`
 * bucket. Size and type are also enforced by the bucket config; duration
 * (60s max) can only be checked here in the browser — there's no
 * media-processing backend to re-verify it server-side.
 */
export async function uploadVehicleVideo(
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { error: "Video must be an MP4 or WEBM file." };
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return { error: "Video must be 50MB or smaller." };
  }

  try {
    const duration = await getVideoDurationSeconds(file);
    if (duration > MAX_VIDEO_DURATION_SECONDS) {
      return { error: "Video must be 60 seconds or shorter." };
    }
  } catch {
    return { error: "Could not read video file. Please try a different file." };
  }

  return uploadPublicFile("vehicle-videos", "vehicles", file);
}

/** Uploads a custom per-vehicle hover sound to the public `vehicle-audio` bucket. */
export async function uploadVehicleHoverSound(
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return { error: "Sound must be an MP3, WAV, or OGG file." };
  }
  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return { error: "Sound file must be 5MB or smaller." };
  }
  return uploadPublicFile("vehicle-audio", "vehicles", file);
}
