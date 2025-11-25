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
      <header className="bg-gradient-warm shadow-warm sticky top-0 z-50 backdrop-blur-sm">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={logo} alt="Papa Tacos" className="w-14 h-14 object-contain animate-fade-in drop-shadow-lg" />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl -z-10"></div>
              </div>
              <div>
                <h1 className="text-mobile-2xl font-bold text-primary-foreground drop-shadow-md">Papa Tacos</h1>
                <p className="text-mobile-sm text-primary-foreground/95 font-medium">
                  {userRole === "proprietaire" ? "👑 Propriétaire" : "👤 Caissier"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="text-primary-foreground min-h-touch hover:bg-white/20 active:scale-95 transition-all-smooth backdrop-blur-sm">
                <Link to="/profil">
                  <User className="h-6 w-6 drop-shadow" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut} 
                className="text-primary-foreground min-h-touch hover:bg-white/20 active:scale-95 transition-all-smooth backdrop-blur-sm"
              >
                <LogOut className="h-6 w-6 drop-shadow" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5 max-w-screen-sm mx-auto">
        <div className="text-center animate-fade-in">
          <h2 className="text-mobile-lg font-semibold text-foreground">
            {format(today, "EEEE d MMMM", { locale: fr })}
          </h2>
          <p className="text-mobile-sm text-muted-foreground">{format(today, "yyyy", { locale: fr })}</p>
        </div>

        {/* Stats du Jour */}
        <div className="grid gap-4 animate-fade-in">
          <Card className="border-2 border-success/30 shadow-card card-hover overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-mobile-base font-semibold">Recettes du Jour</CardTitle>
              <div className="p-2 bg-success/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-mobile-3xl font-bold text-success">
                {totalRecettesJour.toLocaleString()} F
              </div>
              <p className="text-mobile-sm text-muted-foreground mt-1">
                {recettesJour.length} transaction(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-destructive/30 shadow-card card-hover overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-mobile-base font-semibold">Dépenses du Jour</CardTitle>
              <div className="p-2 bg-destructive/10 rounded-xl">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-mobile-3xl font-bold text-destructive">
                {totalDepensesJour.toLocaleString()} F
              </div>
              <p className="text-mobile-sm text-muted-foreground mt-1">
                {depensesJour.length} dépense(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-glow bg-gradient-warm card-hover overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
              <CardTitle className="text-mobile-base font-semibold text-primary-foreground drop-shadow">Solde du Jour</CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-primary-foreground drop-shadow" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-mobile-3xl font-bold text-primary-foreground drop-shadow-lg">
                {soldeJour.toLocaleString()} F
              </div>
              <p className="text-mobile-sm text-primary-foreground/95 mt-1 drop-shadow">
                Recettes - Dépenses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats du Mois */}
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-mobile-xl font-bold text-foreground text-center">
            {format(today, "MMMM yyyy", { locale: fr })}
          </h3>
          <Card className="border-2 border-primary/20 shadow-card card-hover overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-accent opacity-10 rounded-full -translate-y-20 translate-x-20 blur-2xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-mobile-lg">Bilan Mensuel</CardTitle>
              <CardDescription className="text-mobile-sm">Recettes - (Dépenses + Charges)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex justify-between items-center py-2">
                <span className="text-mobile-base text-muted-foreground font-medium">Recettes</span>
                <span className="text-mobile-xl font-bold text-success">
                  {totalRecettesMois.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-mobile-base text-muted-foreground font-medium">Dépenses</span>
                <span className="text-mobile-xl font-bold text-destructive">
                  {totalDepensesMois.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-mobile-base text-muted-foreground font-medium">Charges</span>
                <span className="text-mobile-xl font-bold text-destructive">
                  {totalChargesMois.toLocaleString()} F
                </span>
              </div>
              <div className="border-t-2 border-primary/20 pt-4 flex justify-between items-center bg-gradient-accent/10 -mx-6 px-6 py-4 rounded-b-lg">
                <span className="text-mobile-lg font-bold">Résultat</span>
                <span className={`text-mobile-3xl font-bold ${resultatMois >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {resultatMois.toLocaleString()} F
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div className="grid gap-4 animate-fade-in">
          <Button asChild size="lg" className="h-16 text-mobile-lg shadow-glow hover:shadow-warm card-hover bg-gradient-warm border-0">
            <Link to="/recettes/ajouter" className="flex items-center justify-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <Receipt className="h-7 w-7 drop-shadow" />
              </div>
              <span className="drop-shadow">Ajouter Recette</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-16 text-mobile-lg shadow-card hover:shadow-hover card-hover">
            <Link to="/depenses/ajouter" className="flex items-center justify-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <span>Ajouter Dépense</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 text-mobile-lg shadow-card hover:shadow-hover card-hover border-2">
            <Link to="/charges" className="flex items-center justify-center gap-3">
              <div className="p-1.5 bg-accent/10 rounded-lg">
                <DollarSign className="h-7 w-7" />
              </div>
              <span>Voir Charges</span>
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <div className="grid gap-3 pt-2 animate-fade-in">
          <Button asChild variant="outline" size="lg" className="h-14 text-mobile-base card-hover border-2">
            <Link to="/recettes">📊 Historique des recettes</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 text-mobile-base card-hover border-2">
            <Link to="/depenses">📋 Historique des dépenses</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
