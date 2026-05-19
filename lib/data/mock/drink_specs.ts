export type DrinkSpec = {
  seimaibuai: number | null;
  alcohol: number | null;
  nihonshu_do: number | null;
  shuzou_mai: string | null;
};

export const DRINK_SPECS: Record<string, DrinkSpec> = {
  "d-dassai":      { seimaibuai: 23, alcohol: 15.5, nihonshu_do: -4, shuzou_mai: "山田錦" },
  "d-touyoubijin": { seimaibuai: 50, alcohol: 15.0, nihonshu_do: -2, shuzou_mai: "山田錦" },
  "d-kubota":      { seimaibuai: 50, alcohol: 15.5, nihonshu_do:  5, shuzou_mai: "五百万石" },
  "d-hakkaisan":   { seimaibuai: 50, alcohol: 15.8, nihonshu_do:  3, shuzou_mai: "五百万石" },
  "d-gekkeikan":   { seimaibuai: 70, alcohol: 15.5, nihonshu_do:  3, shuzou_mai: "日本晴" },
  "d-margaux":     { seimaibuai: null, alcohol: 13.5, nihonshu_do: null, shuzou_mai: null },
  "d-opusone":     { seimaibuai: null, alcohol: 14.5, nihonshu_do: null, shuzou_mai: null },
  "d-pilsner":     { seimaibuai: null, alcohol:  4.4, nihonshu_do: null, shuzou_mai: null },
};
