import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/papa-tacos-logo.png";

const typesCharges = [
  "Loyer",
  "Salaire",
  "Électricité",
  "Eau",
  "Internet",
  "Maintenance",
  "Assurance",
  "Autre",
];

const AjouterCharge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [montant, setMontant] = useState("");
  const [typeCharge, setTypeCharge] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!montant || !typeCharge) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("charges")
      .insert({
        montant: parseFloat(montant),
        type_charge: typeCharge,
        user_id: user?.id,
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la charge",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Charge ajoutée avec succès",
      });
      navigate("/charges");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-warm shadow-warm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground">
              <Link to="/charges">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <img src={logo} alt="Papa Tacos" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">Nouvelle Charge</h1>
              <p className="text-sm text-primary-foreground/90">Enregistrer une charge fixe</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="border-primary/20 shadow-warm">
          <CardHeader>
            <CardTitle>Informations de la charge</CardTitle>
            <CardDescription>Remplissez les détails de la charge mensuelle</CardDescription>
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
                <Label htmlFor="type">Type de charge</Label>
                <Select value={typeCharge} onValueChange={setTypeCharge}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesCharges.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/charges")}
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

export default AjouterCharge;
