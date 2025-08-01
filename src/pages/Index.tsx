import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AuctionGrid } from "@/components/AuctionGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <AuctionGrid />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
