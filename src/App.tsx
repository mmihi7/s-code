import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RegisterPremise from "./pages/RegisterPremise";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import PremiseLogin from "./pages/PremiseLogin";
import VisitorEntry from "./pages/VisitorEntry";
import Upgrade from "./pages/Upgrade";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/premise-login" element={<PremiseLogin />} />
          <Route path="/register-premise" element={<RegisterPremise />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/visitor/:premise_id" element={<VisitorEntry />} />
          <Route path="/entry" element={<VisitorEntry />} /> {/* <-- This line enables QR codes pointing to /entry */}
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;