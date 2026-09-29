import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`logo ${light ? "logo-light" : ""}`} aria-label="Terratora home">
      <svg className="logo-mark" viewBox="0 0 46 52" aria-hidden="true">
        <defs>
          <linearGradient id="terratora-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9BDFE7" />
            <stop offset="0.48" stopColor="#189AB4" />
            <stop offset="1" stopColor="#05708C" />
          </linearGradient>
        </defs>
        <path fill="url(#terratora-gradient)" d="M5 2h36a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5H30v29a8 8 0 0 1-16 0V15H5a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" />
      </svg>
      <span>Terratora</span>
    </Link>
  );
}
