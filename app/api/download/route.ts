import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import fs from "fs";
import crypto from "crypto";
import ffmpegStatic from "ffmpeg-static";

const YT_DLP_BIN = path.join(
  process.cwd(),
  "node_modules",
  "youtube-dl-exec",
  "bin",
  "yt-dlp",
);

// ffmpeg: env var takes priority (e.g. local dev), then ffmpeg-static bundle (works on Vercel Linux)
const FFMPEG_BIN = process.env.FFMPEG_PATH ?? ffmpegStatic ?? "/opt/homebrew/bin/ffmpeg";

const INSTAGRAM_URL_PATTERN =
  /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/[A-Za-z0-9_-]+/;

function isValidInstagramUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === "www.instagram.com" ||
        parsed.hostname === "instagram.com") &&
      INSTAGRAM_URL_PATTERN.test(url)
    );
  } catch {
    return false;
  }
}

function buildCookieHeader(): string | null {
  const sessionId = process.env.INSTAGRAM_SESSION_ID?.trim();
  if (!sessionId) return null;

  const parts: string[] = [`sessionid=${sessionId}`];
  const dsUserId = process.env.INSTAGRAM_DS_USER_ID?.trim();
  if (dsUserId) parts.push(`ds_user_id=${dsUserId}`);
  const csrf = process.env.INSTAGRAM_CSRFTOKEN?.trim();
  if (csrf) parts.push(`csrftoken=${csrf}`);

  return parts.join("; ");
}

/**
 * Download to a temp file (required for proper MP4 moov atom placement),
 * then stream that file to the client, then delete it.
 */
function downloadToTempFile(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(YT_DLP_BIN, args);
    const errChunks: Buffer[] = [];

    proc.stderr.on("data", (chunk: Buffer) => {
      errChunks.push(chunk);
      process.stderr.write(chunk); // live logs
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve("ok");
      } else {
        reject(new Error(Buffer.concat(errChunks).toString("utf-8")));
      }
    });

    proc.on("error", reject);
  });
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const { url } = body;

  if (!url || typeof url !== "string") {
    return new Response("Missing url parameter.", { status: 400 });
  }

  if (!isValidInstagramUrl(url)) {
    return new Response("Invalid Instagram URL.", { status: 400 });
  }

  // Unique temp file — yt-dlp writes the merged MP4 here
  const tmpFile = path.join(
    os.tmpdir(),
    `instavid_${crypto.randomBytes(8).toString("hex")}.mp4`
  );

  const args: string[] = [
    "--no-playlist",
    "--no-check-certificates",
    "--ffmpeg-location", FFMPEG_BIN,
    // Best quality: separate video+audio merged by ffmpeg into a proper MP4
    "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best",
    "--merge-output-format", "mp4",
    // Write to temp file (NOT stdout) so ffmpeg can properly place moov atom
    "-o", tmpFile,
    "--add-header",
    "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "--add-header",
    "accept-language:en-US,en;q=0.9",
  ];

  const cookieHeader = buildCookieHeader();
  if (cookieHeader) {
    args.push("--add-header", `cookie:${cookieHeader}`);
  }

  args.push(url);

  try {
    // Wait for full download + merge to complete
    await downloadToTempFile(args);

    const stat = fs.statSync(tmpFile);
    const fileStream = fs.createReadStream(tmpFile);

    // Stream the completed MP4 to client, then delete temp file
    const readable = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) =>
          controller.enqueue(
            typeof chunk === "string" ? Buffer.from(chunk) : chunk
          )
        );
        fileStream.on("end", () => {
          controller.close();
          // Clean up temp file after streaming
          fs.unlink(tmpFile, (err) => {
            if (err) console.error("[download] cleanup error:", err);
          });
        });
        fileStream.on("error", (err) => {
          controller.error(err);
          fs.unlink(tmpFile, () => {});
        });
      },
      cancel() {
        fileStream.destroy();
        fs.unlink(tmpFile, () => {});
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(stat.size),
        "Content-Disposition": 'attachment; filename="instagram-video.mp4"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // Ensure temp file is cleaned up on error
    fs.unlink(tmpFile, () => {});
    console.error("[download] error:", err);
    return new Response("Download failed. The video may be unavailable.", {
      status: 500,
    });
  }
}
