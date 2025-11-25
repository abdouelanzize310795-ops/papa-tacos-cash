import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Recettes from "./pages/Recettes";
import AjouterRecette from "./pages/AjouterRecette";
import Depenses from "./pages/Depenses";
import AjouterDepense from "./pages/AjouterDepense";
import Charges from "./pages/Charges";
import AjouterCharge from "./pages/AjouterCharge";
import Profil from "./pages/Profil";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recettes"
              element={
                <ProtectedRoute>
                  <Recettes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recettes/ajouter"
              element={
                <ProtectedRoute>
                  <AjouterRecette />
                </ProtectedRoute>
              }
            />
            <Route
              path="/depenses"
              element={
                <ProtectedRoute>
                  <Depenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/depenses/ajouter"
              element={
                <ProtectedRoute>
                  <AjouterDepense />
                </ProtectedRoute>
              }
            />
            <Route
              path="/charges"
              element={
                <ProtectedRoute>
                  <Charges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/charges/ajouter"
              element={
                <ProtectedRoute>
                  <AjouterCharge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profil />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
