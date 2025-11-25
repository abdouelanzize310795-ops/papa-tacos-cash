import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, TrendingDown, DollarSign, Receipt, ShoppingCart, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
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
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-warm shadow-warm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary-foreground">Papa Tacos</h1>
          <p className="text-primary-foreground/90">Gestion de Caisse</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            {format(today, "EEEE d MMMM yyyy", { locale: fr })}
          </h2>
        </div>

        {/* Stats du Jour */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20 shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recettes du Jour</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {totalRecettesJour.toLocaleString()} F
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {recettesJour.length} transaction(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dépenses du Jour</CardTitle>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {totalDepensesJour.toLocaleString()} F
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {depensesJour.length} dépense(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-warm bg-gradient-warm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground">Solde du Jour</CardTitle>
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-primary-foreground`}>
                {soldeJour.toLocaleString()} F
              </div>
              <p className="text-xs text-primary-foreground/80 mt-1">
                Recettes - Dépenses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats du Mois */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground">
            Résultat du Mois ({format(today, "MMMM yyyy", { locale: fr })})
          </h3>
          <Card className="border-primary/20 shadow-warm">
            <CardHeader>
              <CardTitle>Bilan Mensuel</CardTitle>
              <CardDescription>Recettes - (Dépenses + Charges)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recettes totales</span>
                <span className="text-xl font-bold text-success">
                  {totalRecettesMois.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dépenses totales</span>
                <span className="text-xl font-bold text-destructive">
                  {totalDepensesMois.toLocaleString()} F
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Charges fixes</span>
                <span className="text-xl font-bold text-destructive">
                  {totalChargesMois.toLocaleString()} F
                </span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">Résultat</span>
                <span className={`text-2xl font-bold ${resultatMois >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {resultatMois.toLocaleString()} F
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild size="lg" className="h-24 text-lg">
            <Link to="/recettes/ajouter">
              <Receipt className="mr-2 h-6 w-6" />
              Ajouter Recette
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-24 text-lg">
            <Link to="/depenses/ajouter">
              <ShoppingCart className="mr-2 h-6 w-6" />
              Ajouter Dépense
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-24 text-lg">
            <Link to="/charges">
              <DollarSign className="mr-2 h-6 w-6" />
              Voir Charges
            </Link>
          </Button>
        </div>

        {/* Navigation */}
        <div className="grid gap-4 md:grid-cols-2">
          <Button asChild variant="outline" size="lg">
            <Link to="/recettes">Voir toutes les recettes</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/depenses">Voir toutes les dépenses</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
