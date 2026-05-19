"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_COLORS = ["#EF4444", "#F97316", "var(--amber)", "var(--success)"];
const STRENGTH_LABELS = ["弱い", "もう少し", "まあまあ", "強い"];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  async function handleEmailSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/` },
    });
    if (error) setError(error.message);
  }

  if (done) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center p-6"
        style={{ background: "var(--paper)" }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl"
            style={{ background: "var(--amber-tint)" }}
          >
            📩
          </div>
          <h2
            className="text-[22px] font-bold mb-3"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            確認メールを送信しました
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--ink-50)" }}>
            メール内のリンクをクリックして
            <br />
            登録を完了してください。
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium"
            style={{ color: "var(--amber)" }}
          >
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-dvh flex items-center justify-center p-6 overflow-hidden"
      style={{ background: "var(--paper)" }}
    >
      {/* Background decorations */}
      <div
        className="absolute -top-32 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200,137,61,0.16) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(200,137,61,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Wordmark */}
        <p
          className="text-[11px] tracking-widest uppercase mb-10"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
        >
          SAKEMAP
        </p>

        {/* Title */}
        <h1
          className="text-[28px] font-bold mb-1"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          旅をはじめる
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--ink-50)" }}>
          一杯で、世界を旅する。
        </p>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 text-sm font-medium mb-5"
          style={{
            border: "1px solid var(--ink-12)",
            color: "var(--ink)",
            background: "var(--paper-2)",
            borderRadius: "var(--r-lg)",
          }}
        >
          <GoogleIcon />
          Googleで登録
        </button>

        {/* OR divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "var(--ink-08)" }} />
          <span
            className="text-[11px]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
          >
            または
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--ink-08)" }} />
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-70)" }}
            >
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm outline-none"
              style={{
                border: "1px solid var(--ink-12)",
                background: "var(--paper-2)",
                color: "var(--ink)",
                borderRadius: "var(--r-lg)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ink-12)")}
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-70)" }}
            >
              パスワード（6文字以上）
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 pr-11 text-sm outline-none"
                style={{
                  border: "1px solid var(--ink-12)",
                  background: "var(--paper-2)",
                  color: "var(--ink)",
                  borderRadius: "var(--r-lg)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ink-12)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--ink-35)" }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Password strength bar */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          strength >= seg
                            ? STRENGTH_COLORS[strength - 1]
                            : "var(--ink-08)",
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-[11px] mt-1"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: strength > 0 ? STRENGTH_COLORS[strength - 1] : "var(--ink-35)",
                  }}
                >
                  {STRENGTH_LABELS[strength - 1] ?? ""}
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-70)" }}
            >
              パスワード（確認）
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 pr-11 text-sm outline-none"
                style={{
                  border: "1px solid var(--ink-12)",
                  background: "var(--paper-2)",
                  color: "var(--ink)",
                  borderRadius: "var(--r-lg)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ink-12)")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--ink-35)" }}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded flex items-center justify-center transition-colors"
                style={{
                  border: agreed ? "none" : "1.5px solid var(--ink-20)",
                  background: agreed ? "var(--amber)" : "transparent",
                }}
              >
                {agreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs leading-relaxed" style={{ color: "var(--ink-70)" }}>
              <Link
                href="/terms"
                className="underline"
                style={{ color: "var(--amber)" }}
              >
                利用規約
              </Link>
              および
              <Link
                href="/privacy"
                className="underline"
                style={{ color: "var(--amber)" }}
              >
                プライバシーポリシー
              </Link>
              に同意する
            </span>
          </label>

          {error && (
            <p
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: "#FEE2E2", color: "#DC2626" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full py-3 text-sm font-semibold disabled:opacity-40"
            style={{
              background: "var(--amber)",
              color: "var(--paper)",
              borderRadius: "var(--r-lg)",
            }}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--ink-50)" }}>
          すでにアカウントをお持ちの方は{" "}
          <Link href="/auth/login" className="font-medium" style={{ color: "var(--amber)" }}>
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    </svg>
  );
}
