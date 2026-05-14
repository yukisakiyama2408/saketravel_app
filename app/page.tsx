import { supabase } from "@/lib/supabase";
import MapView from "@/components/MapView";

export default async function Home() {
  const { data: regions } = await supabase.from("regions").select("*");

  return <MapView regions={regions ?? []} />;
}
