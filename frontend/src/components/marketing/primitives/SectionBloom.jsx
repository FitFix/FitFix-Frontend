// Ambient radial cyan bloom — sections are zoned by pools of light, not dividers.
export default function SectionBloom({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full bg-accent/5 blur-[120px] -z-10 ${className}`}
    />
  );
}
