import { CryptoDashboardSection } from "./sections/CryptoDashboardSection";
import { CustomerStoriesSection } from "./sections/CustomerStoriesSection/CustomerStoriesSection";
import { FeaturesOverviewSection } from "./sections/FeaturesOverviewSection/FeaturesOverviewSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { GetStartedSection } from "./sections/GetStartedSection";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { PricingSection } from "./sections/PricingSection/PricingSection";
import { TradingToolsSection } from "./sections/TradingToolsSection";
import { WhyChooseUsSection } from "./sections/WhyChooseUsSection";

export const CryptofiLanding = (): JSX.Element => {
  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full">
      <HeroSection />
      <TradingToolsSection />
      <PricingSection />
      <CustomerStoriesSection />
      <WhyChooseUsSection />
      <FeaturesOverviewSection />
      <CryptoDashboardSection />
      <GetStartedSection />
      <FooterSection />
    </div>
  );
};
