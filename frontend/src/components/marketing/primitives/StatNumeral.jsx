import NumberTicker from './NumberTicker';

// Instrument-panel stat: giant tabular numeral, whispering label, honest source line.
export default function StatNumeral({ value, text, label, source, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-text leading-none">
        {typeof value === 'number' ? <NumberTicker value={value} /> : <span style={{ fontVariantNumeric: 'tabular-nums' }}>{text ?? value}</span>}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</div>
      {source && <div className="text-[10px] text-[var(--text-muted)]/70">{source}</div>}
    </div>
  );
}
