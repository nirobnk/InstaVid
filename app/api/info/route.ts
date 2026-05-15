import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import ffmpegStatic from "ffmpeg-static";

const YT_DLP_BIN = path.join(
  process.cwd(),
  "node_modules",
  "youtube-dl-exec",
  "bin",
  "yt-dlp",
);

// ffmpeg: env var takes priority (e.g. local dev), then ffmpeg-static bundle (works on Vercel Linux)
const FFMPEG_BIN =
  process.env.FFMPEG_PATH ?? ffmpegStatic ?? "/opt/homebrew/bin/ffmpeg";

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

function runYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(YT_DLP_BIN, args);
    const chunks: Buffer[] = [];
    const errChunks: Buffer[] = [];

    proc.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    proc.stderr.on("data", (chunk: Buffer) => errChunks.push(chunk));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf-8"));
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
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const { url } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  if (!isValidInstagramUrl(url)) {
    return NextResponse.json(
      { error: "Please provide a valid Instagram URL (Reel, Post, or Story)." },
      { status: 400 },
    );
  }

  const args: string[] = [
    "--dump-single-json",
    "--no-check-certificates",
    "--no-warnings",
    "--no-playlist",
    "--skip-download",
    "--no-write-thumbnail",
    "--socket-timeout",
    "10",
    "--retries",
    "2",
    "--ffmpeg-location",
    FFMPEG_BIN,
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
    const raw = await runYtDlp(args);
    const data = JSON.parse(raw) as Record<string, unknown>;

    // Use our thumbnail proxy so the image loads reliably
    const rawThumb = (data.thumbnail as string) || "";
    const thumbnail = rawThumb
      ? `/api/thumbnail?url=${encodeURIComponent(rawThumb)}`
      : "";

    return NextResponse.json({
      title: (data.title as string) || "Instagram Video",
      thumbnail,
      duration: (data.duration as number) || 0,
      uploader: (data.uploader as string) || (data.channel as string) || "",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[info] yt-dlp error:", msg);

    const needsCookies =
      msg.includes("empty media response") ||
      msg.includes("login") ||
      msg.includes("API is not granting") ||
      msg.includes("private") ||
      msg.includes("not granting access");

    return NextResponse.json(
      {
        error: needsCookies
          ? "This video requires authentication. The server session may be expired — please check INSTAGRAM_SESSION_ID in your .env.local."
          : "Could not fetch video info. The post may be deleted or Instagram temporarily blocked the request.",
        needsCookies,
      },
      { status: 500 },
    );
  }
}
