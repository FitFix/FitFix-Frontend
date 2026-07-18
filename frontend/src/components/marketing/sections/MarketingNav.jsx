import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { containerVariants, itemVariants } from '../motion/orchestration';
import logo from '../../../assets/finallogo.png';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

// GlassCard's recipe, applied inline so the pill can be rounded-full and
// toggle on scroll without swapping components.
const GLASS_PILL =
  'glass shadow-[inset_0_0.5px_0_rgba(255,255,255,0.10),0_10px_30px_rgba(0,0,0,0.35)]';

function BrandLockup() {
  // On the landing page a same-route Link click is a no-op in React Router,
  // so the lockup explicitly scrolls back to the top (smooth unless the user
  // prefers reduced motion).
  const handleClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      // Some environments silently ignore smooth scrolling — guarantee arrival.
      window.setTimeout(() => {
        if (window.scrollY > 4) window.scrollTo(0, 0);
      }, 900);
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      aria-label="FitFix home — back to top"
      title="Back to top"
      className="flex items-center gap-2 shrink-0 rounded-full transition-opacity hover:opacity-80"
    >
      <img src={logo} alt="" className="h-9 w-auto" />
      <span className="text-lg font-extrabold tracking-tight text-text">
        FitFix <span className="text-accent">AI</span>
      </span>
    </Link>
  );
}

// Floating glass nav. Renders <header> outside <main> (placed by Landing.jsx).
// Transparent at the top of the page, condenses into a glass pill past 80px.
export default function MarketingNav() {
  // Lazy init: landing on an anchor (e.g. /#pricing) means first paint is mid-page.
  const [scrolled, setScrolled] = useState(() => window.scrollY > 80);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const overlayRef = useRef(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 80));

  // restoreFocus: true for Esc / close button (user stays put), false for
  // link clicks (the anchor jump owns focus next).
  const close = useCallback((restoreFocus) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Body scroll-lock while the overlay is open.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Esc closes (focus back to trigger); Tab is kept inside the overlay.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const root = overlayRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll('a[href], button:not([disabled])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  // If the viewport crosses into md while open, drop the overlay (it is
  // md:hidden anyway — this also releases the scroll lock).
  useEffect(() => {
    if (!open) return undefined;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (event) => {
      if (event.matches) setOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [open]);

  // Move focus into the overlay once it mounts.
  useEffect(() => {
    if (!open) return undefined;
    const raf = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return (
    <header className="fixed top-4 inset-x-0 z-40 px-4 sm:px-6">
      <nav
        aria-label="Main"
        className={`max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full border border-transparent px-4 sm:px-5 py-2 transition-all duration-300 ${
          scrolled ? GLASS_PILL : 'bg-transparent'
        }`}
      >
        <BrandLockup />

        {/* Center links — desktop only */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[var(--text-muted)] hover:text-text transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right cluster — desktop only */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            className="px-4 py-2 text-sm bg-transparent border border-white/15 text-text font-bold rounded-xl hover:bg-white/5 transition-colors"
          >
            Log in
          </Link>
          <a
            href="#walkthrough"
            className="px-4 py-2 text-sm bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all inline-block"
          >
            Book a walkthrough
          </a>
        </div>

        {/* Hamburger — mobile only */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full text-text hover:bg-white/5 transition-colors"
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-50 md:hidden bg-[#09090E]/95 backdrop-blur-xl overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between px-4 pt-6 sm:px-6">
              <BrandLockup />
              <button
                ref={closeRef}
                type="button"
                onClick={() => close(true)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full text-text hover:bg-white/5 transition-colors"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <motion.nav
              aria-label="Mobile"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col px-6 pt-12 pb-12"
            >
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  variants={itemVariants}
                  href={link.href}
                  onClick={() => close(false)}
                  className="py-3 text-3xl font-extrabold tracking-tight text-text hover:text-accent transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div variants={itemVariants} className="mt-10 flex flex-col gap-3">
                <a
                  href="#walkthrough"
                  onClick={() => close(false)}
                  className="px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all inline-block text-center"
                >
                  Book a walkthrough
                </a>
                <Link
                  to="/login"
                  onClick={() => close(false)}
                  className="px-6 py-3 bg-transparent border border-white/15 text-text font-bold rounded-xl hover:bg-white/5 transition-colors text-center"
                >
                  Log in
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
