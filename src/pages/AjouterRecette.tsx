import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const AjouterRecette = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [modePaiement, setModePaiement] = useState("Espèces");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!montant || !description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("recettes")
      .insert({
        montant: parseFloat(montant),
        description,
        mode_paiement: modePaiement,
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la recette",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Recette ajoutée avec succès",
      });
      navigate("/recettes");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-warm shadow-warm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground">
              <Link to="/recettes">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">Nouvelle Recette</h1>
              <p className="text-primary-foreground/90">Enregistrer un revenu</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="border-primary/20 shadow-warm">
          <CardHeader>
            <CardTitle>Informations de la recette</CardTitle>
            <CardDescription>Remplissez les détails de la transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (F CFA)</Label>
                <Input
                  id="montant"
                  type="number"
                  placeholder="0"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="text-2xl font-bold h-16"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ex: Vente tacos, boissons..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Mode de paiement</Label>
                <RadioGroup value={modePaiement} onValueChange={setModePaiement}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="Espèces" id="especes" />
                    <Label htmlFor="especes" className="flex-1 cursor-pointer">
                      Espèces
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="Mobile Money" id="mobile" />
                    <Label htmlFor="mobile" className="flex-1 cursor-pointer">
                      Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="CB" id="cb" />
                    <Label htmlFor="cb" className="flex-1 cursor-pointer">
                      Carte Bancaire
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/recettes")}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 shadow-warm">
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AjouterRecette;
