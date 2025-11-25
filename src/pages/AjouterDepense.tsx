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

const categories = [
  "Viande",
  "Boissons",
  "Gaz",
  "Emballages",
  "Transport",
  "Légumes",
  "Condiments",
  "Maintenance",
  "Autre",
];

const AjouterDepense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [montant, setMontant] = useState("");
  const [categorie, setCategorie] = useState("");
  const [fournisseur, setFournisseur] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!montant || !categorie) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("depenses")
      .insert({
        montant: parseFloat(montant),
        categorie,
        fournisseur: fournisseur || null,
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la dépense",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Succès",
        description: "Dépense ajoutée avec succès",
      });
      navigate("/depenses");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="bg-gradient-warm shadow-warm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="text-primary-foreground">
              <Link to="/depenses">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">Nouvelle Dépense</h1>
              <p className="text-primary-foreground/90">Enregistrer un achat</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="border-primary/20 shadow-warm">
          <CardHeader>
            <CardTitle>Informations de la dépense</CardTitle>
            <CardDescription>Remplissez les détails de l'achat</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (F CFA) *</Label>
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
                <Label htmlFor="categorie">Catégorie *</Label>
                <Select value={categorie} onValueChange={setCategorie}>
                  <SelectTrigger id="categorie">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur (optionnel)</Label>
                <Input
                  id="fournisseur"
                  type="text"
                  placeholder="Nom du fournisseur"
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/depenses")}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading} variant="secondary" className="flex-1 shadow-warm">
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

export default AjouterDepense;
