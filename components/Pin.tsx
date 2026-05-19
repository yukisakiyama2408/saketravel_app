type Props = {
  recorded?: boolean;
  halo?: boolean;
};

export default function Pin({ recorded = false, halo = false }: Props) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 48, height: 48 }}
    >
      {halo && (
        <div
          className="absolute rounded-full"
          style={{
            width: 48,
            height: 48,
            background: "var(--amber)",
            opacity: 0.22,
            animation: "sakemap-pulse 2.4s ease-in-out infinite",
          }}
        />
      )}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 22,
          height: 22,
          background: recorded ? "var(--success)" : "var(--amber)",
          border: "2.5px solid white",
          boxShadow: "var(--sh-2)",
        }}
      >
        {recorded && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
