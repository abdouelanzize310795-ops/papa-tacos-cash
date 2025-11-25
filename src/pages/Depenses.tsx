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
      <header className="bg-gradient-warm shadow-warm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground">
              <Link to="/">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <img src={logo} alt="Papa Tacos" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">Dépenses</h1>
              <p className="text-sm text-primary-foreground/90">Historique des achats</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Total</h2>
            <p className="text-3xl font-bold text-destructive">{total.toLocaleString()} F</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="shadow-warm">
            <Link to="/depenses/ajouter">
              <Plus className="mr-2 h-5 w-5" />
              Nouvelle Dépense
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : depenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Aucune dépense enregistrée</p>
              </CardContent>
            </Card>
          ) : (
            depenses.map((depense) => (
              <Card key={depense.id} className="border-primary/20 shadow-sm hover:shadow-warm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-muted">
                          {depense.categorie}
                        </Badge>
                        {depense.fournisseur && (
                          <span className="text-sm text-muted-foreground">
                            • {depense.fournisseur}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(depense.date_depense), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-bold text-destructive">
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
