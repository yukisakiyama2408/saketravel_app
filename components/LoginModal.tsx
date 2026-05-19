"use client";

import Link from "next/link";

type Props = {
  onClose: () => void;
};

export default function LoginModal({ onClose }: Props) {
  return (
    <>
      <div
        className="fixed inset-0 z-30"
        style={{ background: "rgba(13,27,42,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm pointer-events-auto"
          style={{
            background: "var(--washi)",
            borderRadius: "var(--r-xl)",
            boxShadow: "var(--sh-sheet)",
            padding: "32px 24px 28px",
          }}
        >
          {/* Wordmark */}
          <p
            className="text-center text-[11px] tracking-widest uppercase mb-6"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
          >
            SAKEMAP
          </p>

          {/* Title */}
          <h2
            className="text-center text-[22px] font-bold leading-snug mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            記録を残すには
            <br />
            ログインが必要です
          </h2>

          {/* Sub */}
          <p className="text-center text-xs mb-8" style={{ color: "var(--ink-50)" }}>
            一杯で、世界を旅する。
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full text-center py-3 text-sm font-semibold"
              style={{
                background: "var(--amber)",
                color: "var(--paper)",
                borderRadius: "var(--r-lg)",
              }}
            >
              ログインして記録する
            </Link>

            <Link
              href="/auth/signup"
              className="block w-full text-center py-3 text-sm font-medium"
              style={{
                border: "1px solid var(--ink-12)",
                color: "var(--ink)",
                borderRadius: "var(--r-lg)",
              }}
            >
              新規登録はこちら
            </Link>
          </div>

          <button
            onClick={onClose}
            className="w-full text-center text-sm mt-5"
            style={{ color: "var(--ink-35)" }}
          >
            あとで
          </button>
        </div>
      </div>
    </>
  );
}
