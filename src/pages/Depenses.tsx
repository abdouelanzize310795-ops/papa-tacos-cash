import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import logo from "@/assets/papa-tacos-logo.png";

const Depenses = () => {
  const { data: depenses = [], isLoading } = useQuery({
    queryKey: ["depenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("depenses")
        .select("*")
        .order("date_depense", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const total = depenses.reduce((sum, d) => sum + Number(d.montant), 0);

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
              <h1 className="text-mobile-xl font-bold text-primary-foreground">Dépenses</h1>
              <p className="text-mobile-sm text-primary-foreground/90">Historique</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5 max-w-screen-sm mx-auto pb-safe">
        <div className="flex flex-col gap-3 items-center">
          <div className="text-center">
            <h2 className="text-mobile-base font-medium text-muted-foreground">Total</h2>
            <p className="text-mobile-3xl font-bold text-destructive">{total.toLocaleString()} F</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="w-full h-14 text-mobile-lg shadow-card active:scale-[0.98] transition-transform">
            <Link to="/depenses/ajouter" className="flex items-center justify-center gap-2">
              <Plus className="h-6 w-6" />
              Nouvelle Dépense
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-mobile-base">Chargement...</p>
            </div>
          ) : depenses.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-mobile-base">Aucune dépense enregistrée</p>
              </CardContent>
            </Card>
          ) : (
            depenses.map((depense) => (
              <Card key={depense.id} className="border-primary/20 shadow-card hover:shadow-warm active:scale-[0.98] transition-all">
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-muted text-mobile-sm px-3 py-1">
                        {depense.categorie}
                      </Badge>
                      {depense.fournisseur && (
                        <span className="text-mobile-sm text-muted-foreground">
                          • {depense.fournisseur}
                        </span>
                      )}
                    </div>
                    <p className="text-mobile-sm text-muted-foreground">
                      {format(new Date(depense.date_depense), "EEEE d MMM yyyy", { locale: fr })}
                    </p>
                    <p className="text-mobile-sm text-muted-foreground">
                      {format(new Date(depense.date_depense), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-mobile-3xl font-bold text-destructive">
                    {Number(depense.montant).toLocaleString()} F
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Depenses;
