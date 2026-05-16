"use client";

import { useState, useRef, useEffect } from "react";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [pasteHint, setPasteHint] = useState(false);
  const [downloadCount, setDownloadCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setDownloadCount(d.downloads ?? null))
      .catch(() => {});
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // Clipboard API blocked (HTTP context) — focus input so user can Ctrl+V
      inputRef.current?.focus();
      setPasteHint(true);
      setTimeout(() => setPasteHint(false), 3000);
    }
  };

  const handleFetch = async () => {
    if (!url.trim()) {
      setError("Please enter an Instagram URL.");
      return;
    }
    setLoading(true);
    setError("");
    setVideoInfo(null);
    setDownloadError("");
    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch video info.");
      } else {
        setVideoInfo(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) {
        setDownloadError(
          "Download failed. Please try fetching the video again.",
        );
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${(videoInfo.title || "instagram-video").replace(/[^a-z0-9]/gi, "_")}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      // Track download event in GA4
      if (
        typeof window !== "undefined" &&
        typeof (window as unknown as { gtag?: unknown }).gtag === "function"
      ) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
          "event",
          "download_complete",
          {
            event_category: "engagement",
            event_label: url.trim(),
          },
        );
      }

      // Refresh displayed download count
      fetch("/api/stats")
        .then((r) => r.json())
        .then((d) => setDownloadCount(d.downloads ?? null))
        .catch(() => {});
    } catch {
      setDownloadError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] mb-4 shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 17l-3 3m0 0l-3-3m3 3V14"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">InstaVid</h1>
        <p className="text-slate-400 text-base">
          Download Instagram Reels, Posts &amp; Stories — free, fast, no
          watermark.
        </p>
        {downloadCount !== null && downloadCount > 0 && (
          <p className="mt-3 text-sm font-medium text-pink-400">
            🎉 {downloadCount.toLocaleString()} videos downloaded
          </p>
        )}
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* URL Input Row */}
        <label className="block text-sm text-slate-400 mb-2 font-medium">
          Paste Instagram URL
        </label>
        <div className="flex gap-2 mb-5">
          <input
            type="url"
            placeholder="https://www.instagram.com/reel/..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
              setVideoInfo(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition"
            ref={inputRef}
          />
          <button
            onClick={handlePaste}
            title="Paste from clipboard"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white rounded-xl px-4 py-3 text-sm font-medium transition flex items-center gap-1.5 shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Paste
          </button>
        </div>

        {pasteHint && (
          <p className="text-xs text-slate-400 -mt-3 mb-3 text-right">
            <span className="hidden sm:inline">
              Press{" "}
              <kbd className="bg-white/10 px-1 py-0.5 rounded text-xs">⌘V</kbd>{" "}
              /{" "}
              <kbd className="bg-white/10 px-1 py-0.5 rounded text-xs">
                Ctrl+V
              </kbd>{" "}
              to paste
            </span>
            <span className="sm:hidden">
              Tap &amp; hold the input, then tap <strong>Paste</strong>
            </span>
          </p>
        )}

        {/* Fetch Button */}
        <button
          onClick={handleFetch}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Fetching video info...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Fetch Video
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Video Preview Card */}
        {videoInfo && (
          <div className="mt-5 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {videoInfo.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full max-h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="p-4">
              <p className="text-white font-medium text-sm line-clamp-2 mb-1">
                {videoInfo.title || "Instagram Video"}
              </p>
              <div className="flex items-center gap-3 text-slate-400 text-xs mb-4">
                {videoInfo.uploader && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    @{videoInfo.uploader}
                  </span>
                )}
                {videoInfo.duration > 0 && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatDuration(videoInfo.duration)}
                  </span>
                )}
              </div>
              {downloadError && (
                <p className="text-red-400 text-xs mb-2">{downloadError}</p>
              )}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-2.5 rounded-lg font-semibold text-white text-sm bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Downloading... (may take a moment)
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download MP4 (HD with Audio)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-xl text-center">
        {[
          {
            icon: "📋",
            title: "Paste URL",
            desc: "Copy the Instagram post link",
          },
          {
            icon: "🔍",
            title: "Fetch Info",
            desc: "Preview the video instantly",
          },
          { icon: "⬇️", title: "Download", desc: "Save HD video with audio" },
        ].map((step) => (
          <div
            key={step.title}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="text-2xl mb-2">{step.icon}</div>
            <p className="text-white text-xs font-semibold">{step.title}</p>
            <p className="text-slate-500 text-xs mt-1">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-12 w-full max-w-xl">
        <h2 className="text-white font-bold text-lg mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {[
            {
              q: "How do I download Instagram Reels?",
              a: "Copy the Instagram Reel URL, paste it into InstaVid, click Fetch Video, then click Download MP4. The video saves to your device in HD.",
            },
            {
              q: "Is InstaVid free to use?",
              a: "Yes, InstaVid is completely free. No account, no subscription, and no hidden fees.",
            },
            {
              q: "Does InstaVid add a watermark?",
              a: "No. All downloads are clean HD MP4 files with no watermark added.",
            },
            {
              q: "What types of Instagram content can I download?",
              a: "InstaVid supports Instagram Reels, Posts (photos and videos), and Stories.",
            },
            {
              q: "Does it work on mobile?",
              a: "Yes. InstaVid works on iPhone, Android, and any desktop browser — no app install needed.",
            },
          ].map(({ q, a }) => (
            <details
              key={q}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <summary className="text-white text-sm font-medium cursor-pointer list-none flex justify-between items-center gap-2">
                {q}
                <svg
                  className="w-4 h-4 text-slate-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="text-slate-400 text-sm mt-3">{a}</p>
            </details>
          ))}
        </div>
      </div>

      <p className="mt-8 text-slate-600 text-xs text-center max-w-sm">
        For personal use only. Only download content you own or have permission
        to download.{" "}
        <a href="/terms" className="underline hover:text-slate-400 transition">
          Terms of Use
        </a>
      </p>

      <p className="mt-4 text-slate-700 text-xs text-center">
        Built by <span className="text-slate-500 font-medium">nirobnk</span>
      </p>
    </main>
  );
}

//dd