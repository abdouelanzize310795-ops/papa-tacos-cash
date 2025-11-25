import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Recettes = () => {
  const { data: recettes = [], isLoading } = useQuery({
    queryKey: ["recettes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recettes")
        .select("*")
        .order("date_recette", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const total = recettes.reduce((sum, r) => sum + Number(r.montant), 0);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-warm shadow-warm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground">
              <Link to="/">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">Recettes</h1>
              <p className="text-primary-foreground/90">Historique des revenus</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Total</h2>
            <p className="text-3xl font-bold text-success">{total.toLocaleString()} F</p>
          </div>
          <Button asChild size="lg" className="shadow-warm">
            <Link to="/recettes/ajouter">
              <Plus className="mr-2 h-5 w-5" />
              Nouvelle Recette
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : recettes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Aucune recette enregistrée</p>
              </CardContent>
            </Card>
          ) : (
            recettes.map((recette) => (
              <Card key={recette.id} className="border-primary/20 shadow-sm hover:shadow-warm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{recette.description}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(recette.date_recette), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {recette.mode_paiement}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-bold text-success">
                    {Number(recette.montant).toLocaleString()} F
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

export default Recettes;
