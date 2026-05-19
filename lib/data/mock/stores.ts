import type { Store } from "@/types";

export const mockStores: Store[] = [
  {
    id: "s-01",
    name: "酒趣 虎ノ門",
    address: "東京都港区虎ノ門2-1-1",
    hours: "18:00〜24:00（月〜土）",
    genre: "日本酒バー",
    google_maps_url: null,
    region_ids: ["r-yamaguchi", "r-niigata", "r-kyoto"],
    drink_ids: ["d-dassai", "d-touyoubijin", "d-kubota", "d-hakkaisan", "d-gekkeikan"],
  },
  {
    id: "s-02",
    name: "ワインバー Le Verre",
    address: "東京都渋谷区恵比寿1-2-3",
    hours: "17:00〜25:00（火〜日）",
    genre: "ワインバー",
    google_maps_url: null,
    region_ids: ["r-bordeaux", "r-napa"],
    drink_ids: ["d-margaux", "d-opusone"],
  },
  {
    id: "s-03",
    name: "地酒専門 酒蔵 銀座",
    address: "東京都中央区銀座6-7-8",
    hours: "17:30〜23:30（月〜土）",
    genre: "日本酒専門店",
    google_maps_url: null,
    region_ids: ["r-yamaguchi", "r-niigata"],
    drink_ids: ["d-dassai", "d-kubota", "d-hakkaisan"],
  },
  {
    id: "s-04",
    name: "ビアホール プラハ",
    address: "東京都新宿区西新宿3-4-5",
    hours: "16:00〜24:00（毎日）",
    genre: "ビアホール",
    google_maps_url: null,
    region_ids: ["r-czech"],
    drink_ids: ["d-pilsner"],
  },
];
