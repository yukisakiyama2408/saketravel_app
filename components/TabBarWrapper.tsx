"use client";

import { usePathname } from "next/navigation";
import TabBar from "@/components/TabBar";

const TAB_PATHS = ["/", "/me", "/me/records"];

export default function TabBarWrapper() {
  const pathname = usePathname();
  if (!TAB_PATHS.includes(pathname)) return null;
  return <TabBar />;
}
