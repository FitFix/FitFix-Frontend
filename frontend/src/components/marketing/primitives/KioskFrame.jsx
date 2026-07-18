// Gym-floor kiosk bezel: the hardware context for product-UI mocks.
export default function KioskFrame({ children, className = '' }) {
  return (
    <div className={`relative rounded-3xl border border-white/10 bg-[#0d0d15] p-3 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.10),0_30px_60px_rgba(0,0,0,0.5)] ${className}`}>
      <div aria-hidden="true" className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/10" />
      <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#09090E]">
        {children}
      </div>
    </div>
  );
}
