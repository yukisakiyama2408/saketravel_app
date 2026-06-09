"use client";

import { usePathname } from "next/navigation";
import TabBar from "@/components/TabBar";

const TAB_PATHS = ["/", "/me", "/me/records"];

export default function TabBarWrapper() {
  const pathname = usePathname();
  if (!TAB_PATHS.includes(pathname) && !pathname.startsWith("/me/records/")) {
    return null;
  }
  return <TabBar />;
}
