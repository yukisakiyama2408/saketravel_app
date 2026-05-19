export type RegionStat = {
  annual_snowfall: string | null;
  avg_temperature: string | null;
  sake_breweries: number | null;
  rice_variety: string | null;
  water_hardness: string | null;
};

export const REGION_STATS: Record<string, RegionStat> = {
  "r-yamaguchi": {
    annual_snowfall: "約 20 cm",
    avg_temperature: "14.8°C",
    sake_breweries: 28,
    rice_variety: "西都の雫",
    water_hardness: "軟水（硬度 35）",
  },
  "r-niigata": {
    annual_snowfall: "約 300 cm",
    avg_temperature: "13.2°C",
    sake_breweries: 89,
    rice_variety: "五百万石",
    water_hardness: "軟水（硬度 25）",
  },
  "r-kyoto": {
    annual_snowfall: "約 30 cm",
    avg_temperature: "15.1°C",
    sake_breweries: 42,
    rice_variety: "日本晴",
    water_hardness: "軟水（硬度 28）",
  },
  "r-bordeaux": {
    annual_snowfall: null,
    avg_temperature: "13.5°C",
    sake_breweries: null,
    rice_variety: null,
    water_hardness: null,
  },
  "r-napa": {
    annual_snowfall: null,
    avg_temperature: "14.0°C",
    sake_breweries: null,
    rice_variety: null,
    water_hardness: null,
  },
  "r-czech": {
    annual_snowfall: "約 50 cm",
    avg_temperature: "8.5°C",
    sake_breweries: null,
    rice_variety: null,
    water_hardness: null,
  },
};
