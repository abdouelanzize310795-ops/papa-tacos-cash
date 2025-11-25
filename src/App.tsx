import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Recettes from "./pages/Recettes";
import AjouterRecette from "./pages/AjouterRecette";
import Depenses from "./pages/Depenses";
import AjouterDepense from "./pages/AjouterDepense";
import Charges from "./pages/Charges";
import AjouterCharge from "./pages/AjouterCharge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recettes" element={<Recettes />} />
          <Route path="/recettes/ajouter" element={<AjouterRecette />} />
          <Route path="/depenses" element={<Depenses />} />
          <Route path="/depenses/ajouter" element={<AjouterDepense />} />
          <Route path="/charges" element={<Charges />} />
          <Route path="/charges/ajouter" element={<AjouterCharge />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
