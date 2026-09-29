export function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className={`marquee ${dark ? "marquee-dark" : ""}`} aria-label={items.join(", ")}>
      <div className="marquee-track">
        {row.map((item, i) => <span key={`${item}-${i}`}>{item}<i>✦</i></span>)}
      </div>
    </div>
  );
}
