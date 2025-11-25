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
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/papa-tacos-logo.png";

const AjouterRecette = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
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
        user_id: user?.id,
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
      <header className="bg-gradient-warm shadow-warm sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground min-h-touch active:scale-95 transition-transform">
              <Link to="/recettes">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <img src={logo} alt="Papa Tacos" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-mobile-xl font-bold text-primary-foreground">Nouvelle Recette</h1>
              <p className="text-mobile-sm text-primary-foreground/90">Ajouter un revenu</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-screen-sm mx-auto pb-safe">
        <Card className="border-primary/20 shadow-warm">
          <CardHeader>
            <CardTitle className="text-mobile-xl">Informations</CardTitle>
            <CardDescription className="text-mobile-base">Détails de la transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="montant" className="text-mobile-base">Montant (F CFA)</Label>
                <Input
                  id="montant"
                  type="number"
                  placeholder="0"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="text-mobile-3xl font-bold h-20 text-center"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-mobile-base">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Ex: Vente tacos, boissons..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-14 text-mobile-base"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-mobile-base">Mode de paiement</Label>
                <RadioGroup value={modePaiement} onValueChange={setModePaiement}>
                  <div className="flex items-center space-x-3 border-2 rounded-xl p-4 active:scale-[0.98] transition-transform">
                    <RadioGroupItem value="Espèces" id="especes" className="min-h-touch min-w-[24px]" />
                    <Label htmlFor="especes" className="flex-1 cursor-pointer text-mobile-base">
                      💵 Espèces
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border-2 rounded-xl p-4 active:scale-[0.98] transition-transform">
                    <RadioGroupItem value="Mobile Money" id="mobile" className="min-h-touch min-w-[24px]" />
                    <Label htmlFor="mobile" className="flex-1 cursor-pointer text-mobile-base">
                      📱 Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border-2 rounded-xl p-4 active:scale-[0.98] transition-transform">
                    <RadioGroupItem value="CB" id="cb" className="min-h-touch min-w-[24px]" />
                    <Label htmlFor="cb" className="flex-1 cursor-pointer text-mobile-base">
                      💳 Carte Bancaire
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/recettes")}
                  className="flex-1 h-14 text-mobile-base active:scale-[0.98] transition-transform"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 h-14 text-mobile-base shadow-warm active:scale-[0.98] transition-transform"
                >
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
