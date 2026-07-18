// A single gradient segment traveling the card perimeter via CSS offset-path.
// Pure compositor work; used on exactly ONE card per page (the featured one).
export default function BorderBeam({ duration = 7, size = 90 }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden motion-reduce:hidden">
      <div
        className="absolute"
        style={{
          width: size,
          height: 2,
          offsetPath: 'rect(0 100% 100% 0 round 16px)',
          background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)',
          animation: `ffx-beam ${duration}s linear infinite`,
        }}
      />
      <style>{`@keyframes ffx-beam { to { offset-distance: 100%; } }`}</style>
    </div>
  );
}
