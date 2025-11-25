import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, TrendingDown, DollarSign, Receipt, ShoppingCart, Wallet, LogOut, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/papa-tacos-logo.png";

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const today = new Date();

  // Requête pour les recettes du jour
  const { data: recettesJour = [] } = useQuery({
    queryKey: ["recettes-jour", format(today, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recettes")
        .select("*")
        .gte("date_recette", startOfDay(today).toISOString())
        .lte("date_recette", endOfDay(today).toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  // Requête pour les dépenses du jour
  const { data: depensesJour = [] } = useQuery({
    queryKey: ["depenses-jour", format(today, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depenses")
        .select("*")
        .gte("date_depense", startOfDay(today).toISOString())
        .lte("date_depense", endOfDay(today).toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  // Requête pour les recettes du mois
  const { data: recettesMois = [] } = useQuery({
    queryKey: ["recettes-mois", format(today, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recettes")
        .select("*")
        .gte("date_recette", startOfMonth(today).toISOString())
        .lte("date_recette", endOfMonth(today).toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  // Requête pour les dépenses du mois
  const { data: depensesMois = [] } = useQuery({
    queryKey: ["depenses-mois", format(today, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depenses")
        .select("*")
        .gte("date_depense", startOfMonth(today).toISOString())
        .lte("date_depense", endOfMonth(today).toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  // Requête pour les charges du mois
  const { data: chargesMois = [] } = useQuery({
    queryKey: ["charges-mois", format(today, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charges")
        .select("*")
        .gte("date_charge", startOfMonth(today).toISOString())
        .lte("date_charge", endOfMonth(today).toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculs
  const totalRecettesJour = recettesJour.reduce((sum, r) => sum + Number(r.montant), 0);
  const totalDepensesJour = depensesJour.reduce((sum, d) => sum + Number(d.montant), 0);
  const soldeJour = totalRecettesJour - totalDepensesJour;

  const totalRecettesMois = recettesMois.reduce((sum, r) => sum + Number(r.montant), 0);
  const totalDepensesMois = depensesMois.reduce((sum, d) => sum + Number(d.montant), 0);
  const totalChargesMois = chargesMois.reduce((sum, c) => sum + Number(c.montant), 0);
  const resultatMois = totalRecettesMois - (totalDepensesMois + totalChargesMois);

  return (
    <div className="min-h-screen bg-gradient-soft pb-safe">
      <header className="bg-gradient-warm shadow-warm sticky top-0 z-50">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Papa Tacos" className="w-14 h-14 object-contain" />
              <div>
                <h1 className="text-mobile-2xl font-bold text-primary-foreground">Papa Tacos</h1>
                <p className="text-mobile-sm text-primary-foreground/90">
                  {userRole === "proprietaire" ? "👑 Propriétaire" : "👤 Caissier"}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut} 
              className="text-primary-foreground min-h-touch min-w-[44px] active:scale-95 transition-transform"
            >
              <LogOut className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5 max-w-screen-sm mx-auto">
        <div className="text-center">
          <h2 className="text-mobile-lg font-semibold text-foreground">
            {format(today, "EEEE d MMMM", { locale: fr })}
          </h2>
          <p className="text-mobile-sm text-muted-foreground">{format(today, "yyyy", { locale: fr })}</p>
        </div>

        {/* Stats du Jour */}
        <div className="grid gap-4">
          <Card className="border-primary/20 shadow-card active:scale-[0.98] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-mobile-base font-semibold">Recettes du Jour</CardTitle>
              <TrendingUp className="h-6 w-6 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-mobile-3xl font-bold text-success">
                {totalRecettesJour.toLocaleString()} F
              </div>
              <p className="text-mobile-sm text-muted-foreground mt-1">
                {recettesJour.length} transaction(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-card active:scale-[0.98] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-mobile-base font-semibold">Dépenses du Jour</CardTitle>
              <TrendingDown className="h-6 w-6 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-mobile-3xl font-bold text-destructive">
                {totalDepensesJour.toLocaleString()} F
              </div>
              <p className="text-mobile-sm text-muted-foreground mt-1">
                {depensesJour.length} dépense(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-warm bg-gradient-warm active:scale-[0.98] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-mobile-base font-semibold text-primary-foreground">Solde du Jour</CardTitle>
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-mobile-3xl font-bold text-primary-foreground">
                {soldeJour.toLocaleString()} F
              </div>
              <p className="text-mobile-sm text-primary-foreground/90 mt-1">
                Recettes - Dépenses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats du Mois */}
        <div className="space-y-4">
          <h3 className="text-mobile-xl font-bold text-foreground text-center">
            {format(today, "MMMM yyyy", { locale: fr })}
          </h3>
          <Card className="border-primary/20 shadow-card">
            <CardHeader>
              <CardTitle className="text-mobile-lg">Bilan Mensuel</CardTitle>
              <CardDescription className="text-mobile-sm">Recettes - (Dépenses + Charges)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-mobile-base text-muted-foreground">Recettes</span>
                <span className="text-mobile-xl font-bold text-success">
                  {totalRecettesMois.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-mobile-base text-muted-foreground">Dépenses</span>
                <span className="text-mobile-xl font-bold text-destructive">
                  {totalDepensesMois.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-mobile-base text-muted-foreground">Charges</span>
                <span className="text-mobile-xl font-bold text-destructive">
                  {totalChargesMois.toLocaleString()} F
                </span>
              </div>
              <div className="border-t-2 pt-4 flex justify-between items-center">
                <span className="text-mobile-lg font-bold">Résultat</span>
                <span className={`text-mobile-3xl font-bold ${resultatMois >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {resultatMois.toLocaleString()} F
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div className="grid gap-4">
          <Button asChild size="lg" className="h-16 text-mobile-lg shadow-warm active:scale-[0.98] transition-transform">
            <Link to="/recettes/ajouter" className="flex items-center justify-center gap-3">
              <Receipt className="h-7 w-7" />
              <span>Ajouter Recette</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-16 text-mobile-lg shadow-card active:scale-[0.98] transition-transform">
            <Link to="/depenses/ajouter" className="flex items-center justify-center gap-3">
              <ShoppingCart className="h-7 w-7" />
              <span>Ajouter Dépense</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 text-mobile-lg shadow-card active:scale-[0.98] transition-transform">
            <Link to="/charges" className="flex items-center justify-center gap-3">
              <DollarSign className="h-7 w-7" />
              <span>Voir Charges</span>
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <div className="grid gap-3 pt-2">
          <Button asChild variant="outline" size="lg" className="h-14 text-mobile-base active:scale-[0.98] transition-transform">
            <Link to="/recettes">📊 Historique des recettes</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 text-mobile-base active:scale-[0.98] transition-transform">
            <Link to="/depenses">📋 Historique des dépenses</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
