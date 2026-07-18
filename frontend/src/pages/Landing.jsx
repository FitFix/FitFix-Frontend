import { MotionConfig } from 'framer-motion';
import MarketingNav from '../components/marketing/sections/MarketingNav';
import Hero from '../components/marketing/sections/Hero';
import CorrectionMoment from '../components/marketing/sections/CorrectionMoment';
import EngineFlow from '../components/marketing/sections/EngineFlow';
import FeatureBento from '../components/marketing/sections/FeatureBento';
import DashboardPreview from '../components/marketing/sections/DashboardPreview';
import PilotLog from '../components/marketing/sections/PilotLog';
import PricingContact from '../components/marketing/sections/PricingContact';
import FAQ from '../components/marketing/sections/FAQ';
import FinalCTA from '../components/marketing/sections/FinalCTA';
import Footer from '../components/layout/Footer';

// The FitFix marketing landing page. Dark-committed (.dark-zone re-declares both
// token layers), Outfit-scoped (.marketing), reduced-motion aware page-wide.
export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="dark-zone marketing overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-black focus:font-bold focus:rounded-xl"
        >
          Skip to content
        </a>
        <MarketingNav />
        <main id="main">
          <Hero />
          <CorrectionMoment />
          <EngineFlow />
          <FeatureBento />
          <DashboardPreview />
          <PilotLog />
          <PricingContact />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
