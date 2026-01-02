import { z } from "zod";
import { readFile, stat } from "fs/promises";
import { loadTokens, isTokenExpired } from "../config/tokens.js";
import { refreshAccessToken } from "../auth/oauth.js";
import { AuthError, APIError } from "../types/errors.js";

const UPLOAD_BASE_URL = "https://upload.twitter.com/1.1";
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

/**
 * Media upload response schema
 */
const MediaUploadResponseSchema = z.object({
  media_id: z.number(),
  media_id_string: z.string(),
  size: z.number().optional(),
  expires_after_secs: z.number().optional(),
  image: z.object({
    image_type: z.string(),
    w: z.number(),
    h: z.number(),
  }).optional(),
  video: z.object({
    video_type: z.string(),
  }).optional(),
  processing_info: z.object({
    state: z.enum(["pending", "in_progress", "failed", "succeeded"]),
    check_after_secs: z.number().optional(),
    progress_percent: z.number().optional(),
    error: z.object({
      code: z.number(),
      name: z.string(),
      message: z.string(),
    }).optional(),
  }).optional(),
});

export type MediaUploadResponse = z.infer<typeof MediaUploadResponseSchema>;

/**
 * Media status response
 */
const MediaStatusResponseSchema = z.object({
  media_id: z.number(),
  media_id_string: z.string(),
  processing_info: z.object({
    state: z.enum(["pending", "in_progress", "failed", "succeeded"]),
    check_after_secs: z.number().optional(),
    progress_percent: z.number().optional(),
    error: z.object({
      code: z.number(),
      name: z.string(),
      message: z.string(),
    }).optional(),
  }).optional(),
});

/**
 * Get valid access token
 */
async function getAccessToken(): Promise<string> {
  let tokens = await loadTokens();

  if (!tokens) {
    throw new AuthError("Not authenticated. Run 'x auth login' first.");
  }

  if (isTokenExpired(tokens) && tokens.refresh_token) {
    tokens = await refreshAccessToken(tokens.refresh_token);
  }

  return tokens.access_token;
}

/**
 * Detect media type from file extension
 */
function getMediaType(filePath: string): string {
  const ext = filePath.toLowerCase().split(".").pop();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mov: "video/quicktime",
  };
  return types[ext || ""] || "application/octet-stream";
}

/**
 * Detect media category from MIME type
 */
function getMediaCategory(mimeType: string): string {
  if (mimeType.startsWith("image/gif")) return "tweet_gif";
  if (mimeType.startsWith("image/")) return "tweet_image";
  if (mimeType.startsWith("video/")) return "tweet_video";
  return "tweet_image";
}

/**
 * Simple upload for small images (< 5MB)
 */
export async function simpleUpload(
  filePath: string,
  onProgress?: (percent: number) => void
): Promise<MediaUploadResponse> {
  const accessToken = await getAccessToken();
  const fileData = await readFile(filePath);
  const base64Data = fileData.toString("base64");

  onProgress?.(50);

  const formData = new URLSearchParams();
  formData.append("media_data", base64Data);

  const response = await fetch(`${UPLOAD_BASE_URL}/media/upload.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new APIError(`Media upload failed: ${error}`);
  }

  onProgress?.(100);

  const data = await response.json();
  return MediaUploadResponseSchema.parse(data);
}

/**
 * Chunked upload for large files and videos
 */
export async function chunkedUpload(
  filePath: string,
  onProgress?: (percent: number) => void
): Promise<MediaUploadResponse> {
  const accessToken = await getAccessToken();
  const fileStats = await stat(filePath);
  const fileData = await readFile(filePath);
  const mimeType = getMediaType(filePath);
  const mediaCategory = getMediaCategory(mimeType);

  // INIT
  const initParams = new URLSearchParams();
  initParams.append("command", "INIT");
  initParams.append("total_bytes", fileStats.size.toString());
  initParams.append("media_type", mimeType);
  initParams.append("media_category", mediaCategory);

  const initResponse = await fetch(`${UPLOAD_BASE_URL}/media/upload.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: initParams.toString(),
  });

  if (!initResponse.ok) {
    const error = await initResponse.text();
    throw new APIError(`Media INIT failed: ${error}`);
  }

  const initData = await initResponse.json();
  const mediaId = initData.media_id_string;

  // APPEND chunks
  const totalChunks = Math.ceil(fileData.length / CHUNK_SIZE);
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileData.length);
    const chunk = fileData.subarray(start, end);
    const base64Chunk = chunk.toString("base64");

    const appendParams = new URLSearchParams();
    appendParams.append("command", "APPEND");
    appendParams.append("media_id", mediaId);
    appendParams.append("media_data", base64Chunk);
    appendParams.append("segment_index", i.toString());

    const appendResponse = await fetch(`${UPLOAD_BASE_URL}/media/upload.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: appendParams.toString(),
    });

    if (!appendResponse.ok) {
      const error = await appendResponse.text();
      throw new APIError(`Media APPEND failed: ${error}`);
    }

    onProgress?.(Math.round(((i + 1) / totalChunks) * 80));
  }

  // FINALIZE
  const finalizeParams = new URLSearchParams();
  finalizeParams.append("command", "FINALIZE");
  finalizeParams.append("media_id", mediaId);

  const finalizeResponse = await fetch(`${UPLOAD_BASE_URL}/media/upload.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: finalizeParams.toString(),
  });

  if (!finalizeResponse.ok) {
    const error = await finalizeResponse.text();
    throw new APIError(`Media FINALIZE failed: ${error}`);
  }

  onProgress?.(100);

  const finalizeData = await finalizeResponse.json();
  return MediaUploadResponseSchema.parse(finalizeData);
}

/**
 * Upload media file (auto-selects simple or chunked)
 */
export async function uploadMedia(
  filePath: string,
  onProgress?: (percent: number) => void
): Promise<MediaUploadResponse> {
  const fileStats = await stat(filePath);
  const mimeType = getMediaType(filePath);

  // Use chunked upload for videos or files > 5MB
  if (mimeType.startsWith("video/") || fileStats.size > CHUNK_SIZE) {
    return chunkedUpload(filePath, onProgress);
  }

  return simpleUpload(filePath, onProgress);
}

/**
 * Check media processing status
 */
export async function getMediaStatus(mediaId: string): Promise<MediaUploadResponse> {
  const accessToken = await getAccessToken();

  const params = new URLSearchParams();
  params.append("command", "STATUS");
  params.append("media_id", mediaId);

  const response = await fetch(
    `${UPLOAD_BASE_URL}/media/upload.json?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new APIError(`Media status check failed: ${error}`);
  }

  const data = await response.json();
  return MediaStatusResponseSchema.parse(data);
}

/**
 * Wait for media processing to complete
 */
export async function waitForProcessing(
  mediaId: string,
  onProgress?: (state: string, percent?: number) => void,
  maxWaitMs = 120000
): Promise<MediaUploadResponse> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getMediaStatus(mediaId);
    const processingInfo = status.processing_info;

    if (!processingInfo) {
      return status; // No processing needed
    }

    onProgress?.(processingInfo.state, processingInfo.progress_percent);

    if (processingInfo.state === "succeeded") {
      return status;
    }

    if (processingInfo.state === "failed") {
      const errorMsg = processingInfo.error?.message || "Processing failed";
      throw new APIError(`Media processing failed: ${errorMsg}`);
    }

    // Wait before checking again
    const waitTime = (processingInfo.check_after_secs || 5) * 1000;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  throw new APIError("Media processing timed out");
}

/**
 * Set alt text for uploaded media
 */
export async function setMediaAltText(
  mediaId: string,
  altText: string
): Promise<void> {
  const accessToken = await getAccessToken();

  const body = {
    media_id: mediaId,
    alt_text: { text: altText },
  };

  const response = await fetch(
    `${UPLOAD_BASE_URL}/media/metadata/create.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new APIError(`Setting alt text failed: ${error}`);
  }
}
