export type Region = {
  id: string;
  name: string;
  region_level: string;
  country: string;
  latitude: number;
  longitude: number;
  climate: string | null;
  food_culture: string | null;
  created_at: string;
};

export type Drink = {
  id: string;
  name: string;
  name_kana: string | null;
  genre: string;
  region_id: string;
  description: string | null;
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
