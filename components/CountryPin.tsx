type Props = {
  flag: string;
  country: string;
  count: number;
};

export default function CountryPin({ flag, country, count }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-full flex items-center justify-center text-xl"
        style={{
          width: 34,
          height: 34,
          background: "var(--amber)",
          border: "3px solid white",
          boxShadow: "var(--sh-2)",
        }}
      >
        {flag}
      </div>
      <div
        className="rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap"
        style={{
          background: "white",
          color: "var(--ink)",
          fontFamily: "var(--font-mono)",
          boxShadow: "var(--sh-1)",
        }}
      >
        {country} · {count}件
      </div>
    </div>
  );
}
