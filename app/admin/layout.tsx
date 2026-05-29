import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/regions", label: "産地" },
    { href: "/admin/drinks", label: "お酒" },
    { href: "/admin/dishes", label: "料理" },
    { href: "/admin/stores", label: "店舗" },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--canvas)" }}>
      <header
        className="sticky top-0 z-20 flex min-h-[68px] items-center gap-5 border-b px-5 py-3 md:px-8"
        style={{
          background: "rgba(248,243,236,0.96)",
          borderColor: "var(--ink-08)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link
          href="/admin"
          className="text-[20px] font-bold"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          Sakemap
        </Link>
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--amber)" }}>
          ← 地図
        </Link>
        <nav
          className="ml-auto hidden items-center gap-1 rounded-full border p-1 md:flex"
          style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ color: "var(--ink-50)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
