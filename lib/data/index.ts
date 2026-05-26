import type { Region, Drink, DrinkRecord, RecordWithJoin, Dish, Store } from "@/types";
import { supabase } from "@/lib/supabase";

// ── Region ────────────────────────────────────────────────────────────────

export async function getRegions(): Promise<Region[]> {
  const { data } = await supabase.from("regions").select("*");
  return data ?? [];
}

export async function getRegionById(id: string): Promise<Region | null> {
  const { data } = await supabase.from("regions").select("*").eq("id", id).single();
  return data ?? null;
}

// ── Drink ─────────────────────────────────────────────────────────────────

export async function getAllDrinks(): Promise<Drink[]> {
  const { data } = await supabase.from("drinks").select("*");
  return data ?? [];
}

export async function getDrinksByRegion(regionId: string): Promise<Drink[]> {
  const { data } = await supabase.from("drinks").select("*").eq("region_id", regionId);
  return data ?? [];
}

export async function getDrinkById(
  id: string
): Promise<(Drink & { region: Region }) | null> {
  const { data } = await supabase
    .from("drinks")
    .select("*, region:regions(*)")
    .eq("id", id)
    .single();
  return data ?? null;
}

export async function getDrinksByIds(ids: string[]): Promise<Drink[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase.from("drinks").select("*").in("id", ids);
  return data ?? [];
}

export type DrinkSearchResult = {
  id: string;
  name: string;
  genre: string;
  region: Region;
};

export async function searchDrinks(query: string): Promise<DrinkSearchResult[]> {
  const { data } = await supabase
    .from("drinks")
    .select("id, name, genre, region:regions(*)")
    .ilike("name", `%${query}%`)
    .limit(10);
  return (data as unknown as DrinkSearchResult[]) ?? [];
}

// ── Store ─────────────────────────────────────────────────────────────────

export async function getStoresByRegion(regionId: string): Promise<Store[]> {
  const { data } = await supabase
    .from("stores")
    .select("*")
    .contains("region_ids", [regionId]);
  return data ?? [];
}

export async function getStoresByDrink(drinkId: string): Promise<Store[]> {
  const { data } = await supabase
    .from("stores")
    .select("*")
    .contains("drink_ids", [drinkId]);
  return data ?? [];
}

// ── Dish ──────────────────────────────────────────────────────────────────

export async function getDishById(id: string): Promise<Dish | null> {
  const { data } = await supabase.from("dishes").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getDishesByRegion(regionId: string): Promise<Dish[]> {
  const { data } = await supabase.from("dishes").select("*").eq("region_id", regionId);
  return data ?? [];
}

// ── Record ────────────────────────────────────────────────────────────────

export async function getRecordsByUser(userId: string): Promise<RecordWithJoin[]> {
  const { data } = await supabase
    .from("records")
    .select("*, drinks(*), regions(*)")
    .eq("user_id", userId);
  return (data as RecordWithJoin[]) ?? [];
}

export async function getRecordsByDrink(
  drinkId: string,
  userId: string
): Promise<DrinkRecord[]> {
  const { data } = await supabase
    .from("records")
    .select("*")
    .eq("drink_id", drinkId)
    .eq("user_id", userId)
    .order("date", { ascending: false });
  return data ?? [];
}

export async function insertRecord(
  record: Omit<DrinkRecord, "id">
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("records").insert(record);
  return { error: error ? new Error(error.message) : null };
}

export async function updateRecord(
  id: string,
  data: Pick<DrinkRecord, "date" | "memo">
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("records").update(data).eq("id", id);
  return { error: error ? new Error(error.message) : null };
}

export async function deleteRecord(id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("records").delete().eq("id", id);
  return { error: error ? new Error(error.message) : null };
}
