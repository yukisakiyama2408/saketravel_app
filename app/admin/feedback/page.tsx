import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";
import type { FeedbackItem, FeedbackStatus, FeedbackType } from "@/types";

const statusLabels: Record<FeedbackStatus, string> = {
  new: "未確認",
  reviewing: "確認中",
  planned: "対応予定",
  in_progress: "対応中",
  done: "完了",
  declined: "対応しない",
};

const typeLabels: Record<FeedbackType, string> = {
  feature: "機能要望",
  bug: "不具合",
  improvement: "改善提案",
};

const inputClass =
  "w-full rounded-lg border border-[#0D1B2A]/10 bg-[#F8F3EC] px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:ring-1 focus:ring-[#E8A045]";

async function updateFeedback(fd: FormData) {
  "use server";
  const id = fd.get("id") as string;
  const status = fd.get("status") as FeedbackStatus;
  const adminNote = ((fd.get("admin_note") as string) ?? "").trim() || null;

  await adminClient()
    .from("feedback_items")
    .update({
      status,
      admin_note: adminNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin/feedback");
}

async function deleteFeedback(fd: FormData) {
  "use server";
  const id = fd.get("id") as string;
  await adminClient().from("feedback_items").delete().eq("id", id);
  revalidatePath("/admin/feedback");
}

export default async function AdminFeedbackPage() {
  const { data } = await adminClient()
    .from("feedback_items")
    .select("*")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as FeedbackItem[];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-12 md:px-8">
      <div className="mb-6">
        <p
          className="mb-1 text-[11px] tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
        >
          FEEDBACK
        </p>
        <h1
          className="text-[30px] font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          要望・不具合
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>
          ユーザーから送られた機能要望、不具合、改善提案を管理します。
        </p>
      </div>

      <section
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}
      >
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--ink-08)" }}>
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            報告一覧
          </h2>
          <p className="mt-1 text-xs" style={{ color: "var(--ink-50)" }}>
            {items.length}件
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--ink-08)" }}>
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-50)" }}>
              まだ報告はありません。
            </p>
          )}

          {items.map((item) => (
            <article key={item.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: "var(--amber-tint)",
                      border: "1px solid rgba(200,137,61,0.22)",
                      color: "var(--amber-dk)",
                    }}
                  >
                    {typeLabels[item.type]}
                  </span>
                  <span
                    className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                    style={{ borderColor: "var(--ink-08)", color: "var(--ink-50)" }}
                  >
                    {statusLabels[item.status]}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--ink-35)" }}>
                    {new Date(item.created_at).toLocaleString("ja-JP")}
                  </span>
                </div>

                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>
                  {item.description}
                </p>
                <dl className="mt-4 grid gap-2 text-xs" style={{ color: "var(--ink-50)" }}>
                  <div>
                    <dt className="font-semibold">報告者</dt>
                    <dd>{item.reporter_email}</dd>
                  </div>
                  {item.page_path && (
                    <div>
                      <dt className="font-semibold">関連ページ</dt>
                      <dd className="break-all">{item.page_path}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <form action={updateFeedback} className="space-y-3 rounded-xl border p-3" style={{ borderColor: "var(--ink-08)" }}>
                <input type="hidden" name="id" value={item.id} />
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: "var(--ink-50)" }}>
                    ステータス
                  </span>
                  <select name="status" defaultValue={item.status} className={inputClass}>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold" style={{ color: "var(--ink-50)" }}>
                    管理者メモ
                  </span>
                  <textarea
                    name="admin_note"
                    defaultValue={item.admin_note ?? ""}
                    rows={4}
                    className={inputClass}
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg py-2 text-sm font-semibold"
                    style={{ background: "var(--amber)", color: "var(--paper)" }}
                  >
                    保存
                  </button>
                  <button
                    formAction={deleteFeedback}
                    className="rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--ink-12)", color: "var(--ink-50)" }}
                  >
                    削除
                  </button>
                </div>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
