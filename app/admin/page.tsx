import Link from "next/link";
import { adminClient } from "@/lib/supabase-admin";

const sections = [
  { href: "/admin/regions", label: "産地", desc: "緯度経度・気候・食文化", icon: "地" },
  { href: "/admin/drinks", label: "お酒", desc: "銘柄・ジャンル・写真・スペック", icon: "酒" },
  { href: "/admin/dishes", label: "料理", desc: "料理名・説明・ペアリング", icon: "食" },
  { href: "/admin/stores", label: "店舗", desc: "店名・住所・提供銘柄", icon: "店" },
];

async function getCount(table: "regions" | "drinks" | "dishes" | "stores") {
  const { count } = await adminClient()
    .from(table)
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminPage() {
  const [regionCount, drinkCount, dishCount, storeCount] = await Promise.all([
    getCount("regions"),
    getCount("drinks"),
    getCount("dishes"),
    getCount("stores"),
  ]);
  const stats = [
    { label: "REGIONS", value: regionCount },
    { label: "DRINKS", value: drinkCount },
    { label: "DISHES", value: dishCount },
    { label: "STORES", value: storeCount },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <div className="mb-6">
        <p
          className="mb-1 text-[11px] tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
        >
          ADMIN
        </p>
        <h1
          className="text-[30px] font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          データ管理
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>
          地図・銘柄詳細・店舗導線に使うマスターデータを管理します。
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}
          >
            <p
              className="mb-1 text-[10px]"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
            >
              {s.label}
            </p>
            <p className="text-2xl font-bold leading-none" style={{ color: "var(--ink)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex min-h-[132px] flex-col justify-between rounded-xl border p-4 transition-colors hover:bg-[#F4EFE6]"
              style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}
            >
              <div>
                <span
                  className="mb-4 grid h-9 w-9 place-items-center rounded-[10px] text-sm font-bold"
                  style={{ background: "var(--amber-tint)", color: "var(--amber-dk)" }}
                >
                  {s.icon}
                </span>
                <p
                  className="font-bold"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                >
                  {s.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--ink-50)" }}>
                  {s.desc}
                </p>
              </div>
              <span className="mt-4 self-end text-xs font-bold" style={{ color: "var(--amber)" }}>
                管理する →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
