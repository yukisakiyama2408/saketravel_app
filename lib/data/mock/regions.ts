import type { Region } from "@/types";

export const mockRegions: Region[] = [
  {
    id: "r-yamaguchi",
    name: "山口県",
    region_level: "prefecture",
    country: "日本",
    latitude: 34.1857,
    longitude: 131.4706,
    climate:
      "温暖な瀬戸内海性気候。年間を通じて温暖で降水量が少なく、日照時間が長い。山地と海岸線が複雑に入り組んだ地形が、良質な水源を生む。",
    food_culture:
      "フグ料理（ふぐ刺し・ふぐちり）が有名。新鮮な海産物と山の幸が揃い、豊かな食文化を形成。地酒との相性が抜群。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "r-niigata",
    name: "新潟県",
    region_level: "prefecture",
    country: "日本",
    latitude: 37.9022,
    longitude: 139.0236,
    climate:
      "日本海側気候。冬は豪雪地帯として知られ、雪解け水が豊富で清冽な軟水が日本酒造りに最適。昼夜の寒暖差が大きい。",
    food_culture:
      "コシヒカリなど高品質な米の産地。へぎそば・のっぺ汁など独自の郷土料理が多い。日本一の酒蔵数を誇る地域。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "r-kyoto",
    name: "京都府",
    region_level: "prefecture",
    country: "日本",
    latitude: 35.0116,
    longitude: 135.7681,
    climate:
      "盆地特有の内陸性気候。夏は蒸し暑く、冬は底冷えする。伏見の地下水「伏見の御香水」は硬度が低く、まろやかな口当たりの酒を生む。",
    food_culture:
      "精進料理・懐石料理など繊細な京料理の本場。湯豆腐・京漬物・おばんざいなど上品な食文化が根付く。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "r-bordeaux",
    name: "ボルドー",
    region_level: "region",
    country: "フランス",
    latitude: 44.8378,
    longitude: -0.5792,
    climate:
      "海洋性気候。ガロンヌ川とドルドーニュ川が流れ込むジロンド川河口の温暖な気候。年間降水量は適度でブドウ栽培に理想的。",
    food_culture:
      "カヌレ・マカロン・カスレなど地方料理が豊富。牛フィレのボルドー風など肉料理とワインの組み合わせが文化として根付いている。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "r-napa",
    name: "ナパバレー",
    region_level: "region",
    country: "アメリカ",
    latitude: 38.5025,
    longitude: -122.2654,
    climate:
      "地中海性気候。日中は温暖で夜は冷涼。カブリオソ山とマヤカマス山脈に囲まれた谷で、カベルネ・ソーヴィニヨンに最適な環境。",
    food_culture:
      "ファームtoテーブルの発祥地の一つ。新鮮な食材を活かしたカリフォルニア料理と世界トップクラスのワインが融合。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "r-czech",
    name: "ボヘミア",
    region_level: "region",
    country: "チェコ",
    latitude: 49.7384,
    longitude: 13.3736,
    climate:
      "穏やかな大陸性気候。ザーツ産ホップの産地として世界的に有名。適度な降水量と温度差がホップの香りを豊かにする。",
    food_culture:
      "豚のすね肉のロースト・グラーシュなど濃厚な煮込み料理が主流。1人あたりのビール消費量が世界一と言われるビール文化の中心地。",
    created_at: "2026-01-01T00:00:00Z",
  },
];
