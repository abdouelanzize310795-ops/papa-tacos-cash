import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import logo from "@/assets/papa-tacos-logo.png";

const Charges = () => {
  const today = new Date();

  const { data: charges = [], isLoading } = useQuery({
    queryKey: ["charges-mois", format(today, "yyyy-MM")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charges")
        .select("*")
        .gte("date_charge", startOfMonth(today).toISOString())
        .lte("date_charge", endOfMonth(today).toISOString())
        .order("date_charge", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const total = charges.reduce((sum, c) => sum + Number(c.montant), 0);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-warm shadow-warm sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground min-h-touch active:scale-95 transition-transform">
              <Link to="/">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <img src={logo} alt="Papa Tacos" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-mobile-xl font-bold text-primary-foreground">Charges</h1>
              <p className="text-mobile-sm text-primary-foreground/90">
                {format(today, "MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5 max-w-screen-sm mx-auto pb-safe">
        <div className="flex flex-col gap-3 items-center">
          <div className="text-center">
            <h2 className="text-mobile-base font-medium text-muted-foreground">Total du mois</h2>
            <p className="text-mobile-3xl font-bold text-destructive">{total.toLocaleString()} F</p>
          </div>
          <Button asChild size="lg" variant="outline" className="w-full h-14 text-mobile-lg shadow-card active:scale-[0.98] transition-transform">
            <Link to="/charges/ajouter" className="flex items-center justify-center gap-2">
              <Plus className="h-6 w-6" />
              Nouvelle Charge
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-mobile-base">Chargement...</p>
            </div>
          ) : charges.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-mobile-base">Aucune charge enregistrée</p>
              </CardContent>
            </Card>
          ) : (
            charges.map((charge) => (
              <Card key={charge.id} className="border-primary/20 shadow-card hover:shadow-warm active:scale-[0.98] transition-all">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <CardTitle className="text-mobile-lg">{charge.type_charge}</CardTitle>
                    <p className="text-mobile-sm text-muted-foreground">
                      {format(new Date(charge.date_charge), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-mobile-3xl font-bold text-destructive">
                    {Number(charge.montant).toLocaleString()} F
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="border-primary/20 bg-muted/30 shadow-card">
          <CardHeader>
            <CardTitle className="text-mobile-lg">Types de charges courantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-mobile-base text-muted-foreground">
              <li>💰 Loyer</li>
              <li>👥 Salaires</li>
              <li>⚡ Électricité</li>
              <li>💧 Eau</li>
              <li>📡 Internet</li>
              <li>🔧 Maintenance</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Charges;
