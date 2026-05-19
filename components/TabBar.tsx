"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; icon: (active: boolean) => React.ReactNode };

const tabs: Tab[] = [
  {
    href: "/",
    label: "マップ",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2C7.686 2 5 4.686 5 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <circle cx="11" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/me/records",
    label: "記録",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect
          x="4" y="3" width="14" height="16" rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <path d="M7 8h8M7 11h8M7 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/me",
    label: "マイページ",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle
          cx="11" cy="8" r="3"
          stroke="currentColor"
          strokeWidth="1.5"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <path d="M4 19c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/me") return pathname === "/me";
    return pathname === href;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        borderTop: "1px solid var(--ink-08)",
        background: "rgba(255, 254, 250, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
              style={{
                color: active ? "var(--amber-dk)" : "var(--ink-35)",
                fontWeight: active ? 700 : 400,
              }}
            >
              {tab.icon(active)}
              <span className="text-[10px] leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </nav>
  );
}
