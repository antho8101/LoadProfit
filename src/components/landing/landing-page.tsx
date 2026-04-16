import { LandingFaq } from "@/components/landing/sections/landing-faq";
import { LandingFeatures } from "@/components/landing/sections/landing-features";
import { LandingFinalCta } from "@/components/landing/sections/landing-final-cta";
import { LandingFooter } from "@/components/landing/sections/landing-footer";
import { LandingHeader } from "@/components/landing/sections/landing-header";
import { LandingHero } from "@/components/landing/sections/landing-hero";
import { LandingPricing } from "@/components/landing/sections/landing-pricing";
import { LandingProblem } from "@/components/landing/sections/landing-problem";
import { LandingProof } from "@/components/landing/sections/landing-proof";
import { LandingReferral } from "@/components/landing/sections/landing-referral";
import { LandingSolution } from "@/components/landing/sections/landing-solution";
import { LandingValueStrip } from "@/components/landing/sections/landing-value-strip";
import { LandingWhy } from "@/components/landing/sections/landing-why";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingValueStrip />
        <LandingProblem />
        <LandingSolution />
        <LandingFeatures />
        <LandingWhy />
        <LandingProof />
        <LandingPricing />
        <LandingReferral />
        <LandingFaq />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
