// Pricing + contact — human, confident voice. No tiers, no invented numbers:
// pilot pricing is scoped after a walkthrough. The "what a pilot includes"
// card carries the page's ONLY BorderBeam.
import { motion } from 'framer-motion';
import { Mail, Phone, Check } from 'lucide-react';
import { blurRiseVariants, VIEWPORT_ONCE } from '../motion/orchestration';
import GlassCard from '../primitives/GlassCard';
import BorderBeam from '../primitives/BorderBeam';

const PILOT_INCLUDES = [
  'One floor, fully covered',
  'Install in under two weeks',
  'Trainer dashboard + alerts',
  'No member wearables, ever',
  'Keep the data either way',
];

const CONTACT_ROWS = [
  {
    icon: Mail,
    label: 'Email',
    display: 'fitfix@gmail.com',
    href: 'mailto:fitfix@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    display: '+91 81468 30484',
    href: 'tel:+918146830484',
  },
];

export default function PricingContact() {
  return (
    <section id="pricing" aria-labelledby="pricing-h" className="relative py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center"
        >
          <h2
            id="pricing-h"
            className="font-extrabold tracking-tight text-text text-[length:clamp(1.9rem,1.4rem+1.8vw,2.8rem)] leading-tight"
          >
            Pilot pricing, shaped to your floor.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-[var(--text-muted)] leading-relaxed">
            Every gym floor is different &mdash; camera positions, stations,
            hours. We price the pilot after a 20-minute walkthrough of yours.
          </p>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          {/* Talk to us */}
          <motion.div
            variants={blurRiseVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <GlassCard className="p-8 h-full flex flex-col">
              <h3 className="text-xl font-extrabold tracking-tight text-text">
                Talk to us
              </h3>

              <ul className="mt-6 space-y-4">
                {CONTACT_ROWS.map(({ icon: Icon, label, display, href }) => (
                  <li key={label} className="flex items-center gap-4">
                    <span className="shrink-0 grid place-items-center w-10 h-10 rounded-lg bg-accent/10">
                      <Icon size={18} className="text-accent" aria-hidden="true" />
                    </span>
                    <a
                      href={href}
                      className="text-text font-medium tabular-nums hover:text-accent transition-colors"
                    >
                      <span className="sr-only">{label}: </span>
                      {display}
                    </a>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm text-[var(--text-muted)] leading-relaxed">
                Or start with the walkthrough form &mdash; we reply within one
                business day.
              </p>
            </GlassCard>
          </motion.div>

          {/* What a pilot includes — the page's only border beam */}
          <motion.div
            variants={blurRiseVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <GlassCard className="p-8 h-full flex flex-col relative overflow-hidden">
              <BorderBeam duration={7} size={90} />

              <h3 className="text-xl font-extrabold tracking-tight text-text">
                What a pilot includes
              </h3>

              <ul className="mt-6 space-y-3">
                {PILOT_INCLUDES.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check size={18} className="shrink-0 text-accent" aria-hidden="true" />
                    <span className="text-text/90">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <a
                  href="#walkthrough"
                  className="px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all inline-block w-full text-center"
                >
                  Book a 20-min walkthrough
                </a>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
