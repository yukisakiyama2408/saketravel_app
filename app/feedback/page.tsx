"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { FeedbackType } from "@/types";

const inputClass =
  "w-full rounded-xl border border-[#0D1B2A]/10 bg-[#FFFDF7] px-3 py-3 text-sm text-[#0D1B2A] outline-none focus:border-[#C8893D] focus:ring-1 focus:ring-[#C8893D]";
const labelClass = "mb-1.5 block text-[11px] font-semibold text-[#0D1B2A]/55";

export default function FeedbackPage() {
  const { user, loading } = useAuth();
  const [type, setType] = useState<FeedbackType>("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from("feedback_items").insert({
      user_id: user.id,
      reporter_email: user.email ?? "",
      type,
      title: title.trim(),
      description: description.trim(),
      page_path: pagePath.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setPagePath("");
    setType("feature");
    setSent(true);
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--canvas)" }}>
      <header
        className="sticky top-0 z-10 border-b px-5 pb-4 pt-12"
        style={{ background: "rgba(248,243,236,0.96)", borderColor: "var(--ink-08)" }}
      >
        <p
          className="mb-1 text-[11px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
        >
          FEEDBACK
        </p>
        <h1
          className="text-[24px] font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          要望・不具合を報告
        </h1>
      </header>

      <main className="mx-auto max-w-xl px-5 py-6 pb-28">
        {loading && (
          <p className="text-sm" style={{ color: "var(--ink-50)" }}>
            読み込み中です
          </p>
        )}

        {!loading && !user && (
          <section
            className="rounded-2xl border p-5"
            style={{ background: "var(--paper-2)", borderColor: "var(--ink-08)" }}
          >
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              ログインが必要です
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-60)" }}>
              要望や不具合の報告は、ログイン済みユーザーのみ送信できます。
            </p>
            <Link
              href="/auth/login"
              className="mt-5 block rounded-xl py-3 text-center text-sm font-semibold"
              style={{ background: "var(--amber)", color: "var(--paper)" }}
            >
              ログインする
            </Link>
          </section>
        )}

        {!loading && user && (
          <>
            {sent && (
              <div
                className="mb-4 rounded-xl border px-4 py-3 text-sm"
                style={{
                  background: "rgba(200,137,61,0.08)",
                  borderColor: "rgba(200,137,61,0.22)",
                  color: "var(--amber-dk)",
                }}
              >
                送信しました。内容を確認して対応を検討します。
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border p-5"
              style={{ background: "var(--paper-2)", borderColor: "var(--ink-08)" }}
            >
              <label className="block">
                <span className={labelClass}>種別 *</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as FeedbackType)}
                  className={inputClass}
                >
                  <option value="feature">機能要望</option>
                  <option value="bug">不具合</option>
                  <option value="improvement">改善提案</option>
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>タイトル *</span>
                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  placeholder="例: 地図で地域名を検索したい"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>詳細 *</span>
                <textarea
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={7}
                  placeholder="期待する動き、実際に起きたこと、再現手順など"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>関連ページ</span>
                <input
                  value={pagePath}
                  onChange={(event) => setPagePath(event.target.value)}
                  placeholder="例: /drinks/..."
                  className={inputClass}
                />
              </label>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  送信できませんでした: {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim()}
                className="w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
                style={{ background: "var(--amber)", color: "var(--paper)" }}
              >
                {submitting ? "送信中" : "送信する"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
