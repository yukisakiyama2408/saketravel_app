import Link from "next/link";

const sections = [
  { href: "/admin/regions", label: "産地", desc: "緯度経度・気候・食文化" },
  { href: "/admin/drinks",  label: "お酒",  desc: "銘柄・ジャンル・産地" },
  { href: "/admin/dishes",  label: "料理",  desc: "料理名・説明・ペアリング" },
  { href: "/admin/stores",  label: "店舗",  desc: "店名・住所・GoogleマップURL" },
];

export default function AdminPage() {
  return (
    <div className="max-w-lg mx-auto px-5 py-8">
      <h1 className="text-xl font-bold text-[#0D1B2A] mb-6">データ管理</h1>
      <ul className="space-y-3">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-center justify-between border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white hover:bg-[#F8F3EC] transition-colors"
            >
              <div>
                <p className="font-medium text-[#0D1B2A]">{s.label}</p>
                <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{s.desc}</p>
              </div>
              <span className="text-[#0D1B2A]/30 text-sm">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
