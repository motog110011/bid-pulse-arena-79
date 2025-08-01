import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AuctionGrid } from "@/components/AuctionGrid";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <AuctionGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
