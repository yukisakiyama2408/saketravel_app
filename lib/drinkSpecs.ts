export type SpecDef = { key: string; label: string; placeholder: string };

export const GENRE_SPECS: Record<string, SpecDef[]> = {
  "日本酒": [
    { key: "nihonshu_do", label: "日本酒度", placeholder: "+5" },
    { key: "seimaibuai", label: "精米歩合", placeholder: "50%" },
    { key: "alcohol",    label: "アルコール", placeholder: "15%" },
    { key: "shuzou_mai", label: "酒米",      placeholder: "山田錦" },
  ],
  "ワイン": [
    { key: "vintage", label: "ヴィンテージ", placeholder: "2021年" },
    { key: "grape",   label: "ブドウ品種",   placeholder: "シャルドネ" },
    { key: "alcohol", label: "アルコール",   placeholder: "13%" },
  ],
  "クラフトビール": [
    { key: "style",   label: "スタイル",   placeholder: "IPA" },
    { key: "ibu",     label: "IBU",        placeholder: "45" },
    { key: "alcohol", label: "アルコール", placeholder: "6%" },
  ],
  "ウイスキー": [
    { key: "age",        label: "熟成年数", placeholder: "12年" },
    { key: "distillery", label: "蒸留所",   placeholder: "山崎蒸留所" },
    { key: "alcohol",    label: "アルコール", placeholder: "43%" },
  ],
  "スピリッツ": [
    { key: "ingredient", label: "原料",     placeholder: "ジュニパーベリー" },
    { key: "alcohol",    label: "アルコール", placeholder: "40%" },
  ],
  "焼酎": [
    { key: "ingredient", label: "原料",     placeholder: "さつまいも" },
    { key: "method",     label: "製法",     placeholder: "本格焼酎" },
    { key: "alcohol",    label: "アルコール", placeholder: "25%" },
  ],
  "泡盛": [
    { key: "age",     label: "熟成年数", placeholder: "3年" },
    { key: "alcohol", label: "アルコール", placeholder: "30%" },
  ],
};

export const ALL_SPEC_KEYS = [
  ...new Set(Object.values(GENRE_SPECS).flatMap((defs) => defs.map((d) => d.key))),
];
