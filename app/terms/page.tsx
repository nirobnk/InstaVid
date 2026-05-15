import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use – InstaVid",
  description: "Terms of use for InstaVid, an Instagram video downloader tool.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to InstaVid
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Use</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              1. Personal Use Only
            </h2>
            <p>
              InstaVid is provided strictly for personal, non-commercial use.
              You may only use this tool to download video content that you own,
              have created, or have explicit permission from the copyright
              holder to download and save.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              2. Respect Copyright
            </h2>
            <p>
              All videos, images, and media posted on Instagram are protected by
              copyright law and belong to their respective creators.
              Downloading, redistributing, republishing, or using third-party
              content without the creator&apos;s explicit permission is a
              violation of copyright law and may expose you to legal liability.
            </p>
            <p className="mt-2">
              You are solely responsible for ensuring you have the right to
              download any content you access through this tool.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              3. No Redistribution of Downloaded Content
            </h2>
            <p>
              Downloaded content must not be re-uploaded, sold, licensed, or
              publicly distributed without the original copyright holder&apos;s
              consent. This includes posting downloaded videos to other social
              media platforms, websites, or monetised channels.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              4. Third-Party Platform Terms
            </h2>
            <p>
              Use of this tool may be subject to Instagram&apos;s and
              Meta&apos;s{" "}
              <a
                href="https://help.instagram.com/581066165581870"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 underline"
              >
                Terms of Use
              </a>
              . It is your responsibility to comply with any third-party
              platform terms that apply to the content you are accessing.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              5. No Warranty
            </h2>
            <p>
              InstaVid is provided &quot;as is&quot; without any warranty of any
              kind. We make no guarantees about availability, accuracy, or
              fitness for any particular purpose. Use at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              The operators of InstaVid accept no liability for any damages,
              losses, or legal consequences arising from your use of this tool
              or any content downloaded through it.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              7. Prohibited Uses
            </h2>
            <p>You agree not to use InstaVid to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>
                Download content belonging to others without their permission
              </li>
              <li>Harass, stalk, or infringe the privacy of any individual</li>
              <li>
                Distribute, sell, or commercially exploit downloaded content
              </li>
              <li>
                Circumvent security measures beyond what is necessary for
                personal use
              </li>
              <li>Use downloaded content in any unlawful manner</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              8. Changes to These Terms
            </h2>
            <p>
              These terms may be updated at any time. Continued use of InstaVid
              after changes are posted constitutes acceptance of the revised
              terms.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-2.5 transition"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to InstaVid
          </Link>
        </div>
      </div>
    </main>
  );
}
