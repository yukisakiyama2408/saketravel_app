import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

export default async function Home() {
  const { data: regions } = await supabase.from("regions").select("*");

  return <AppShell regions={regions ?? []} />;
}
