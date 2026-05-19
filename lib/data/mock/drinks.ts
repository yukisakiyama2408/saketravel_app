import type { Drink } from "@/types";

export const mockDrinks: Drink[] = [
  {
    id: "d-dassai",
    name: "獺祭",
    name_kana: "だっさい",
    genre: "日本酒",
    region_id: "r-yamaguchi",
    description:
      "山口県岩国市の旭酒造が醸す純米大吟醸。「磨き二割三分」など精米歩合へのこだわりが特徴。フルーティーな香りと繊細な味わいで、国内外で高い評価を受ける。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "d-touyoubijin",
    name: "東洋美人",
    name_kana: "とうようびじん",
    genre: "日本酒",
    region_id: "r-yamaguchi",
    description:
      "山口県萩市の澄川酒造場が醸す銘酒。上品で繊細な甘みと透明感のある味わい。東杜氏・澄川宜史の技が光る一本。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "d-kubota",
    name: "久保田",
    name_kana: "くぼた",
    genre: "日本酒",
    region_id: "r-niigata",
    description:
      "新潟県長岡市の朝日酒造が醸す辛口日本酒の代表格。「淡麗辛口」という新潟の酒スタイルを確立した一本。シャープなキレと後味の美しさが特徴。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "d-hakkaisan",
    name: "八海山",
    name_kana: "はっかいさん",
    genre: "日本酒",
    region_id: "r-niigata",
    description:
      "新潟県南魚沼市の八海醸造が造る銘酒。霊峰八海山の伏流水を使用。すっきりとした飲み口と米の旨みのバランスが絶妙な辛口酒。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "d-gekkeikan",
    name: "月桂冠",
    name_kana: "げっけいかん",
    genre: "日本酒",
    region_id: "r-kyoto",
    description:
      "京都府伏見区の月桂冠株式会社が醸す歴史ある日本酒。創業1637年。伏見の名水「伏水」を使い、まろやかで飲みやすい味わいが特徴。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "d-margaux",
    name: "シャトー・マルゴー",
    name_kana: null,
    genre: "ワイン",
    region_id: "r-bordeaux",
    description:
      "ボルドー5大シャトーの一つ。カベルネ・ソーヴィニヨンを主体とし、深い色調と複雑な香り、シルキーなタンニンが特徴。「ボルドーの女王」とも称される。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "d-opusone",
    name: "オーパス・ワン",
    name_kana: null,
    genre: "ワイン",
    region_id: "r-napa",
    description:
      "ロバート・モンダヴィとムートン・ロートシルトの共同プロジェクトから生まれたカリフォルニアを代表するプレミアムワイン。豊かな果実味と長い余韻が特徴。",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "d-pilsner",
    name: "ピルスナーウルケル",
    name_kana: null,
    genre: "ビール",
    region_id: "r-czech",
    description:
      "世界初のピルスナービール。1842年にボヘミアのプルゼニュで誕生。ザーツ産ホップの爽やかな苦みと黄金色の透明感が特徴。ピルスナーという種類の元祖。",
    created_at: "2026-01-01T00:00:00Z",
  },
];
