// FAQ — human, confident voice. Privacy first, then the questions every
// owner actually asks on the first call. One panel open at a time.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import GlassCard from '../primitives/GlassCard';
import {
  containerVariants,
  itemVariants,
  blurRiseVariants,
  VIEWPORT_ONCE,
} from '../motion/orchestration';

const FAQ_ITEMS = [
  {
    question: 'Where does the camera footage go?',
    answer: (
      <>
        Nowhere. Inference runs on-device at the edge &mdash; video is
        processed in the building and never uploaded. What leaves the floor
        is numbers: joint angles, reps, scores.
      </>
    ),
  },
  {
    question: 'Do members have to wear anything?',
    answer: (
      <>
        No. No wearables, no straps, no phone strapped to the rack. One
        camera watches the floor and the pose engine reads 17 joints on its
        own &mdash; members just walk in and train.
      </>
    ),
  },
  {
    question: 'How long does install take?',
    answer: (
      <>
        Under two weeks, one camera per floor. We handle mounting,
        calibration, and dashboard setup &mdash; your floor stays open the
        whole time, and it works with the cameras you can actually buy.
      </>
    ),
  },
  {
    question: 'How accurate is it?',
    answer: (
      <>
        17 tracked joints at 30fps with &lt;30ms inference on pilot
        hardware. We publish accuracy numbers with sources as pilot data
        lands &mdash; no marketing math.
      </>
    ),
  },
  {
    question: 'Does it work with our existing gym software?',
    answer: (
      <>
        The dashboard stands alone and the data is yours; integrations are
        scoped per pilot.
      </>
    ),
  },
  {
    question: 'What does the pilot cost?',
    answer: (
      <>
        It depends on your floor &mdash; book the walkthrough and we will
        quote it in one call. Email{' '}
        <a
          href="mailto:fitfix@gmail.com"
          className="text-accent hover:underline"
        >
          fitfix@gmail.com
        </a>{' '}
        or call{' '}
        <a
          href="tel:+918146830484"
          className="text-accent hover:underline tabular-nums"
        >
          +91 81468 30484
        </a>
        .
      </>
    ),
  },
];

function FaqItem({ item, index, isOpen, onToggle }) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <motion.div variants={itemVariants}>
      <GlassCard className="overflow-hidden">
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 py-4 px-6 text-left text-text font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-2xl"
        >
          <span>{item.question}</span>
          <ChevronDown
            size={20}
            aria-hidden="true"
            className={`shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-accent' : 'text-[var(--text-muted)]'
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--text-muted)]">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" aria-labelledby="faq-h" className="relative py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center"
        >
          <h2
            id="faq-h"
            className="font-extrabold tracking-tight text-text text-[length:clamp(1.9rem,1.4rem+1.8vw,2.8rem)] leading-tight"
          >
            Asked by every gym owner.
          </h2>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            Straight answers &mdash; the same ones we give on the phone.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mt-10 flex flex-col gap-3"
        >
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex((current) => (current === index ? null : index))
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
