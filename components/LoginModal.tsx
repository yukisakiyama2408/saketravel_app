"use client";

import Link from "next/link";

type Props = {
  onClose: () => void;
};

export default function LoginModal({ onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-6 pointer-events-none">
        <div className="bg-[#F8F3EC] rounded-2xl p-6 w-full max-w-sm pointer-events-auto shadow-2xl">
          <h2 className="text-lg font-bold text-[#0D1B2A] mb-2">
            ログインが必要です
          </h2>
          <p className="text-sm text-[#0D1B2A]/60 mb-6">
            飲んだ記録を保存するには、ログインまたは新規登録が必要です。
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full bg-[#0D1B2A] text-white text-center rounded-lg py-2.5 text-sm font-medium"
            >
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full border border-[#0D1B2A]/20 text-[#0D1B2A] text-center rounded-lg py-2.5 text-sm font-medium bg-white"
            >
              新規登録
            </Link>
          </div>
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-[#0D1B2A]/40 mt-4"
          >
            キャンセル
          </button>
        </div>
      </div>
    </>
  );
}
