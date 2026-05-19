import type { Region, Drink, DrinkRecord, RecordWithJoin, Dish, Store } from "@/types";
import { supabase } from "@/lib/supabase";
import { mockRegions } from "./mock/regions";
import { mockDrinks } from "./mock/drinks";
import { mockStores } from "./mock/stores";
import { mockDishes } from "./mock/dishes";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const MOCK_USER_ID = "mock-user-001";

// ── Mock records (localStorage, client-side only) ─────────────────────────

const RECORDS_KEY = "sakemap_mock_records";

function loadMockRecords(): DrinkRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveMockRecord(record: DrinkRecord): void {
  const records = loadMockRecords();
  records.push(record);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

// ── Region ────────────────────────────────────────────────────────────────

export async function getRegions(): Promise<Region[]> {
  if (USE_MOCK) return mockRegions;
  const { data } = await supabase.from("regions").select("*");
  return data ?? [];
}

export async function getRegionById(id: string): Promise<Region | null> {
  if (USE_MOCK) return mockRegions.find((r) => r.id === id) ?? null;
  const { data } = await supabase.from("regions").select("*").eq("id", id).single();
  return data ?? null;
}

// ── Drink ─────────────────────────────────────────────────────────────────

export async function getAllDrinks(): Promise<Drink[]> {
  if (USE_MOCK) return mockDrinks;
  const { data } = await supabase.from("drinks").select("*");
  return data ?? [];
}

export async function getDrinksByRegion(regionId: string): Promise<Drink[]> {
  if (USE_MOCK) return mockDrinks.filter((d) => d.region_id === regionId);
  const { data } = await supabase.from("drinks").select("*").eq("region_id", regionId);
  return data ?? [];
}

export async function getDrinkById(
  id: string
): Promise<(Drink & { region: Region }) | null> {
  if (USE_MOCK) {
    const drink = mockDrinks.find((d) => d.id === id);
    if (!drink) return null;
    const region = mockRegions.find((r) => r.id === drink.region_id);
    if (!region) return null;
    return { ...drink, region };
  }
  const { data } = await supabase
    .from("drinks")
    .select("*, region:regions(*)")
    .eq("id", id)
    .single();
  return data ?? null;
}

export async function getDrinksByIds(ids: string[]): Promise<Drink[]> {
  if (ids.length === 0) return [];
  if (USE_MOCK) return mockDrinks.filter((d) => ids.includes(d.id));
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
  if (USE_MOCK) {
    const q = query.toLowerCase();
    return mockDrinks
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.name_kana?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, 10)
      .map((d) => ({
        id: d.id,
        name: d.name,
        genre: d.genre,
        region: mockRegions.find((r) => r.id === d.region_id)!,
      }));
  }
  const { data } = await supabase
    .from("drinks")
    .select(
      "id, name, genre, region:regions(id, name, country, latitude, longitude, climate, food_culture, region_level, created_at)"
    )
    .ilike("name", `%${query}%`)
    .limit(10);
  return (data as unknown as DrinkSearchResult[]) ?? [];
}

// ── Store ─────────────────────────────────────────────────────────────────

export async function getStoresByRegion(regionId: string): Promise<Store[]> {
  if (USE_MOCK)
    return mockStores.filter((s) => s.region_ids?.includes(regionId) ?? false);
  const { data } = await supabase
    .from("stores")
    .select("*")
    .contains("region_ids", [regionId]);
  return data ?? [];
}

export async function getStoresByDrink(drinkId: string): Promise<Store[]> {
  if (USE_MOCK)
    return mockStores.filter((s) => s.drink_ids?.includes(drinkId) ?? false);
  const { data } = await supabase
    .from("stores")
    .select("*")
    .contains("drink_ids", [drinkId]);
  return data ?? [];
}

// ── Dish ──────────────────────────────────────────────────────────────────

export async function getDishById(id: string): Promise<Dish | null> {
  if (USE_MOCK) return mockDishes.find((d) => d.id === id) ?? null;
  const { data } = await supabase.from("dishes").select("*").eq("id", id).single();
  return data ?? null;
}

// ── Record ────────────────────────────────────────────────────────────────

export async function getRecordsByUser(userId: string): Promise<RecordWithJoin[]> {
  if (USE_MOCK) {
    return loadMockRecords()
      .filter((r) => r.user_id === userId)
      .map((r) => ({
        ...r,
        drinks: mockDrinks.find((d) => d.id === r.drink_id)!,
        regions: mockRegions.find((rg) => rg.id === r.region_id)!,
      }))
      .filter((r) => r.drinks && r.regions);
  }
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
  if (USE_MOCK) {
    return loadMockRecords()
      .filter((r) => r.drink_id === drinkId && r.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
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
  if (USE_MOCK) {
    saveMockRecord({ ...record, id: `mock-rec-${Date.now()}` });
    return { error: null };
  }
  const { error } = await supabase.from("records").insert(record);
  return { error: error ? new Error(error.message) : null };
}

export async function updateRecord(
  id: string,
  data: Pick<DrinkRecord, "date" | "memo">
): Promise<{ error: Error | null }> {
  if (USE_MOCK) {
    const records = loadMockRecords();
    const idx = records.findIndex((r) => r.id === id);
    if (idx !== -1) {
      records[idx] = { ...records[idx], ...data };
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }
    return { error: null };
  }
  const { error } = await supabase.from("records").update(data).eq("id", id);
  return { error: error ? new Error(error.message) : null };
}

export async function deleteRecord(id: string): Promise<{ error: Error | null }> {
  if (USE_MOCK) {
    const records = loadMockRecords().filter((r) => r.id !== id);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    return { error: null };
  }
  const { error } = await supabase.from("records").delete().eq("id", id);
  return { error: error ? new Error(error.message) : null };
}
