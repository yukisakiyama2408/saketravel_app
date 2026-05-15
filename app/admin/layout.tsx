import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto bg-[#F8F3EC]">
      <header className="sticky top-0 z-10 bg-[#0D1B2A] px-5 py-3 flex items-center gap-4">
        <Link href="/" className="text-[#E8A045] text-sm font-medium">
          ← 地図
        </Link>
        <span className="text-white/40 text-sm">/</span>
        <span className="text-white text-sm font-semibold">Admin</span>
      </header>
      <main>{children}</main>
    </div>
  );
}
