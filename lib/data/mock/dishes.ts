import type { Dish } from "@/types";

export const mockDishes: Dish[] = [
  {
    id: "dish-01",
    name: "ふぐ刺し",
    region_id: "r-yamaguchi",
    description:
      "山口県（下関）名物のふぐの薄造り。コリコリとした食感と上品な甘みが特徴。山口の日本酒との相性が抜群。",
    pairing_drink_ids: ["d-dassai", "d-touyoubijin"],
  },
  {
    id: "dish-02",
    name: "へぎそば",
    region_id: "r-niigata",
    description:
      "新潟県魚沼地方発祥の郷土料理。布海苔（ふのり）をつなぎに使った独特の弾力と喉越しが特徴。冷たいそばを一口ずつ「へぎ」と呼ばれる器に盛る。",
    pairing_drink_ids: ["d-kubota", "d-hakkaisan"],
  },
  {
    id: "dish-03",
    name: "鴨のロースト",
    region_id: "r-bordeaux",
    description:
      "ボルドー地方の伝統料理。鴨の胸肉をローストしポルト酒ソースで仕上げる。カベルネ・ソーヴィニヨンとの相性は格別。",
    pairing_drink_ids: ["d-margaux"],
  },
];
