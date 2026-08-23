import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import TickerTape from "@/components/TickerTape";
import MarketCenter from "@/components/MarketCenter";
import LearningPaths from "@/components/LearningPaths";
import TradingJournal from "@/components/TradingJournal";
import BrokerRecommendation from "@/components/BrokerRecommendation";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import MobileStickyForm from "@/components/MobileStickyForm";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Section 1: Hero + Lead Form */}
        <HeroSection />

        {/* Section 2: Trust Bar */}
        <AnimateOnScroll animation="fade-up">
          <TrustBar />
        </AnimateOnScroll>

        {/* Ticker Tape */}
        <AnimateOnScroll animation="fade-in" duration={1000}>
          <TickerTape />
        </AnimateOnScroll>

        {/* Section 3: Market Center */}
        <AnimateOnScroll animation="fade-up" delay={100}>
          <MarketCenter />
        </AnimateOnScroll>

        {/* Section 4: Alat & Program */}
        <AnimateOnScroll animation="fade-up">
          <LearningPaths />
        </AnimateOnScroll>

        {/* Section 5: Trading Journal & Leaderboard */}
        <TradingJournal />

        {/* Section 6: Broker Rekomendasi */}
        <AnimateOnScroll animation="fade-up">
          <BrokerRecommendation />
        </AnimateOnScroll>

        {/* Section 7: Testimoni + Komunitas */}
        <Testimonials />
      </main>

      {/* Section 8: Footer + Form Ulang */}
      <AnimateOnScroll animation="fade-up">
        <Footer />
      </AnimateOnScroll>

      {/* Mobile Sticky Form */}
      <MobileStickyForm />
    </>
  );
}
