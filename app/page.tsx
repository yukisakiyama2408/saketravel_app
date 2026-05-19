import { getRegions } from "@/lib/data";
import AppShell from "@/components/AppShell";

export default async function Home() {
  const regions = await getRegions();
  return <AppShell regions={regions} />;
}
