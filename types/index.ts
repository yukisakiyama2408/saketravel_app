export type Region = {
  id: string;
  name: string;
  region_level: string;
  country: string;
  latitude: number;
  longitude: number;
  climate: string | null;
  food_culture: string | null;
  annual_snowfall: string | null;
  avg_temperature: string | null;
  sake_breweries: number | null;
  rice_variety: string | null;
  water_hardness: string | null;
  created_at: string;
};

export type Drink = {
  id: string;
  name: string;
  name_kana: string | null;
  genre: string;
  genre_category: "sake" | "wine" | "beer" | "shochu" | null;
  region_id: string;
  description: string | null;
  nihonshu_do: number | null;
  seimaibuai: number | null;
  alcohol: number | null;
  shuzou_mai: string | null;
  created_at: string;
};

export type DrinkRecord = {
  id: string;
  user_id: string;
  drink_id: string;
  region_id: string;
  date: string;
  memo: string | null;
};

export type RecordWithJoin = DrinkRecord & {
  drinks: Drink;
  regions: Region;
};

export type Dish = {
  id: string;
  name: string;
  region_id: string;
  description: string | null;
  pairing_drink_ids: string[] | null;
};

export type Store = {
  id: string;
  name: string;
  address: string | null;
  hours: string | null;
  genre: string | null;
  google_maps_url: string | null;
  region_ids: string[] | null;
  drink_ids: string[] | null;
};
