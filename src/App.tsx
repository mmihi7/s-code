
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UserAccess from "./pages/UserAccess";
import RegisterPremise from "./pages/RegisterPremise";
import RegisterUser from "./pages/RegisterUser";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import PremiseLogin from "./pages/PremiseLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {/* TooltipProvider should be inside BrowserRouter */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/user-access" element={<UserAccess />} />
          <Route path="/premise-login" element={<PremiseLogin />} />
          <Route path="/register-premise" element={<RegisterPremise />} />
          <Route path="/register-user" element={<RegisterUser />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
