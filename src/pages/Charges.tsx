import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

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
      <header className="bg-gradient-warm shadow-warm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground">
              <Link to="/">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">Charges Fixes</h1>
              <p className="text-primary-foreground/90">
                {format(today, "MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Total du mois</h2>
            <p className="text-3xl font-bold text-destructive">{total.toLocaleString()} F</p>
          </div>
          <Button asChild size="lg" variant="outline" className="shadow-warm">
            <Link to="/charges/ajouter">
              <Plus className="mr-2 h-5 w-5" />
              Nouvelle Charge
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Chargement...</p>
          ) : charges.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Aucune charge enregistrée pour ce mois</p>
              </CardContent>
            </Card>
          ) : (
            charges.map((charge) => (
              <Card key={charge.id} className="border-primary/20 shadow-sm hover:shadow-warm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{charge.type_charge}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(charge.date_charge), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-bold text-destructive">
                    {Number(charge.montant).toLocaleString()} F
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="border-primary/20 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Types de charges courantes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Loyer</li>
              <li>• Salaires</li>
              <li>• Électricité</li>
              <li>• Eau</li>
              <li>• Internet</li>
              <li>• Maintenance</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Charges;
