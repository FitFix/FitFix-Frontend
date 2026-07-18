// Detection-log eyebrow label. DOM text stays sentence case (screen readers hate
// letterspaced all-caps source text); uppercase happens in CSS.
export default function Eyebrow({ children, live = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 border border-accent/30 rounded-full px-3 py-1 text-[11px] font-semibold text-accent uppercase tracking-[0.16em] ${className}`}
    >
      {live && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
      )}
      {children}
    </span>
  );
}
