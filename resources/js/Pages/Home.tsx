import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import TickerTape from "@/components/TickerTape";
import MarketCenter from "@/components/MarketCenter";
import LearningPaths from "@/components/LearningPaths";
import EventSection from "@/components/EventSection";
import TradingJournal from "@/components/TradingJournal";
import BrokerRecommendation from "@/components/BrokerRecommendation";
import FAQSection from "@/components/FAQSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import MobileStickyForm from "@/components/MobileStickyForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import LatestEventPopupModal from "@/components/LatestEventPopupModal";
import { Head } from "@inertiajs/react";

export default function Home() {
  return (
    <>
      <Head>
        <title>Semakin Pede: Komunitas Trader Futures Gold, Oil, CPO Indonesia</title>
        <meta
          name="description"
          content="Semakin Pede: Komunitas trader futures Indonesia. Belajar trading Gold, Oil, CPO bareng mentor BAPPEBTI. Edukasi gratis, diskusi market, komunitas aktif trader Indonesia."
        />
        <meta
          name="keywords"
          content="komunitas trading, komunitas futures, semakin pede, trader indonesia, belajar trading gold, trading oil, CPO trading, BAPPEBTI, komunitas trader komoditas, grup trading gratis"
        />
      </Head>
      <Navbar />
      <main>
        {/* Section 1: Hero + Lead Capture */}
        <HeroSection />

        {/* Section 2: Institutional Trust & Regulatory Standards */}
        <TrustBar />

        {/* Live Market Ticker Tape */}
        <TickerTape />

        {/* Section 3: Live Market Terminal (TradingView + Kalender Ekonomi) */}
        <MarketCenter />

        {/* Section 4: Interactive Tools & Curriculum */}
        <LearningPaths />

        {/* Section 5: Bagan Event Terkini, Akan Datang & Arsip Semakin Pede */}
        <EventSection />

        {/* Section 6: Trading Journal & Risk Discipline Heatmap */}
        <TradingJournal />

        {/* Section 7: Official Regulated Broker (TPFX & BAPPEBTI Standards) */}
        <BrokerRecommendation />

        {/* Section 8: FAQ & Public Inquiries */}
        <FAQSection />

        {/* Section 9: Community Culture & Real Member Discussions */}
        <Testimonials />
      </main>

      {/* Section 10: Footer & Disclaimers */}
      <Footer />

      {/* Mobile Sticky Form */}
      <MobileStickyForm />

      {/* Floating Action Button */}
      <WhatsAppButton />

      {/* Pop-up Modal Event Terkini (Otomatis muncul 5 detik setelah landing) */}
      <LatestEventPopupModal />
    </>
  );
}
