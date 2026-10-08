export function LoadingScreen({ leaving = false }: { leaving?: boolean }) {
  return <div className={`app-loading${leaving ? " is-leaving" : ""}`} role="status" aria-live="polite">
    <div className="app-loading-mark" aria-hidden="true">
      <span />
      <svg viewBox="0 0 46 52">
        <path d="M5 2h36a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5H30v29a8 8 0 0 1-16 0V15H5a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" />
      </svg>
    </div>
    <p>Loading Terratora</p>
  </div>;
}
