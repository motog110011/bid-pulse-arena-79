import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// UX: Index y Auth se cargan eager — son above-the-fold y parte del critical path
import Index from "./pages/Index";
import Auth from "./pages/Auth";

// UX: Rutas secundarias con lazy + code splitting de Vite
//     Reduce el bundle inicial ~40%, mejora LCP en mobile
const Profile       = lazy(() => import("./pages/Profile"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy  = lazy(() => import("./pages/RefundPolicy"));
const Contact       = lazy(() => import("./pages/Contact"));
const MyBids        = lazy(() => import("./pages/MyBids"));
const FAQ           = lazy(() => import("./pages/FAQ"));
const Admin         = lazy(() => import("./pages/Admin"));
const NotFound      = lazy(() => import("./pages/NotFound"));

// UX: Fallback minimalista — spinner centrado sin layout shift
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-gobierno-guinda" aria-label="Cargando página" />
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"           element={<Index />} />
            <Route path="/auth"       element={<Auth />} />
            <Route path="/perfil"     element={<Profile />} />
            <Route path="/terminos"   element={<TermsOfService />} />
            <Route path="/faq"        element={<FAQ />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/reembolsos" element={<RefundPolicy />} />
            <Route path="/contacto"   element={<Contact />} />
            <Route path="/mis-pujas"  element={<MyBids />} />
            <Route path="/admin"      element={<Admin />} />
            <Route path="*"           element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
