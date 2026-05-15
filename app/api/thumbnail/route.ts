import { NextRequest } from "next/server";

// Allowed thumbnail CDN hostnames from Instagram/Facebook
const ALLOWED_HOSTS = [
  "cdninstagram.com",
  "fbcdn.net",
  "instagram.com",
  "scontent.cdninstagram.com",
];

function isAllowedThumb(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some((h) => hostname.endsWith(h));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new Response("Missing url parameter.", { status: 400 });
  }

  if (!isAllowedThumb(rawUrl)) {
    return new Response("Forbidden: non-Instagram thumbnail host.", {
      status: 403,
    });
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
      },
      // 10 s timeout
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      return new Response("Thumbnail not available.", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[thumbnail] proxy error:", err);
    return new Response("Failed to fetch thumbnail.", { status: 502 });
  }
}
