import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/papa-tacos-logo.png";
import { z } from "zod";

const pinSchema = z.object({
  ancienPin: z.string().min(4, "Le code PIN doit contenir au moins 4 chiffres").max(6),
  nouveauPin: z.string().min(4, "Le code PIN doit contenir au moins 4 chiffres").max(6).regex(/^\d+$/, "Le code PIN doit contenir uniquement des chiffres"),
  confirmPin: z.string(),
}).refine((data) => data.nouveauPin === data.confirmPin, {
  message: "Les codes PIN ne correspondent pas",
  path: ["confirmPin"],
});

const profileSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50),
  prenom: z.string().max(50).optional(),
  telephone: z.string().min(8, "Numéro invalide").max(15).optional(),
});

const Profil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPin, setIsLoadingPin] = useState(false);

  // États pour les infos de profil
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  // États pour le changement de PIN
  const [ancienPin, setAncienPin] = useState("");
  const [nouveauPin, setNouveauPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showAncienPin, setShowAncienPin] = useState(false);
  const [showNouveauPin, setShowNouveauPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setNom(profile.nom || "");
      setPrenom(profile.prenom || "");
      setTelephone(profile.telephone || "");
    }

    setEmail(user.email || "");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      profileSchema.parse({
        nom,
        prenom: prenom || undefined,
        telephone: telephone || undefined,
      });

      setIsLoadingProfile(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          nom,
          prenom: prenom || null,
          telephone: telephone || null,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le profil",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = pinSchema.parse({
        ancienPin,
        nouveauPin,
        confirmPin,
      });

      setIsLoadingPin(true);

      // Vérifier l'ancien PIN
      const { data: profile } = await supabase
        .from("profiles")
        .select("pin_code")
        .eq("id", user?.id)
        .single();

      if (!profile || profile.pin_code !== validatedData.ancienPin) {
        toast({
          title: "Erreur",
          description: "L'ancien code PIN est incorrect",
          variant: "destructive",
        });
        setIsLoadingPin(false);
        return;
      }

      // Mettre à jour le PIN dans la table profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ pin_code: validatedData.nouveauPin })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      // Mettre à jour le mot de passe d'authentification
      const { error: authError } = await supabase.auth.updateUser({
        password: validatedData.nouveauPin,
      });

      if (authError) throw authError;

      toast({
        title: "Succès",
        description: "Code PIN modifié avec succès",
      });

      // Réinitialiser les champs
      setAncienPin("");
      setNouveauPin("");
      setConfirmPin("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le code PIN",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingPin(false);
    }
  };

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
              <h1 className="text-mobile-xl font-bold text-primary-foreground">Mon Profil</h1>
              <p className="text-mobile-sm text-primary-foreground/90">
                {userRole === "proprietaire" ? "👑 Propriétaire" : "👤 Caissier"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-5 max-w-screen-sm mx-auto pb-safe">
        {/* Informations du profil */}
        <Card className="border-primary/20 shadow-card">
          <CardHeader>
            <CardTitle className="text-mobile-xl">Informations personnelles</CardTitle>
            <CardDescription className="text-mobile-base">Modifier vos informations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-mobile-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="h-14 text-mobile-base bg-muted"
                />
                <p className="text-mobile-sm text-muted-foreground">L'email ne peut pas être modifié</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom" className="text-mobile-base">Nom *</Label>
                <Input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="h-14 text-mobile-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-mobile-base">Prénom</Label>
                <Input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="h-14 text-mobile-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone" className="text-mobile-base">Téléphone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="h-14 text-mobile-base"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoadingProfile}
                className="w-full h-14 text-mobile-base shadow-warm active:scale-[0.98] transition-transform"
              >
                {isLoadingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Changement de code PIN */}
        <Card className="border-primary/20 shadow-card">
          <CardHeader>
            <CardTitle className="text-mobile-xl">Modifier le code PIN</CardTitle>
            <CardDescription className="text-mobile-base">Changez votre code de sécurité</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="ancien-pin" className="text-mobile-base">Ancien code PIN</Label>
                <div className="relative">
                  <Input
                    id="ancien-pin"
                    type={showAncienPin ? "text" : "password"}
                    placeholder="••••"
                    value={ancienPin}
                    onChange={(e) => setAncienPin(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="h-14 text-mobile-xl text-center tracking-widest pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full min-h-touch"
                    onClick={() => setShowAncienPin(!showAncienPin)}
                  >
                    {showAncienPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nouveau-pin" className="text-mobile-base">Nouveau code PIN (4-6 chiffres)</Label>
                <div className="relative">
                  <Input
                    id="nouveau-pin"
                    type={showNouveauPin ? "text" : "password"}
                    placeholder="••••"
                    value={nouveauPin}
                    onChange={(e) => setNouveauPin(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="h-14 text-mobile-xl text-center tracking-widest pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full min-h-touch"
                    onClick={() => setShowNouveauPin(!showNouveauPin)}
                  >
                    {showNouveauPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pin" className="text-mobile-base">Confirmer le nouveau code PIN</Label>
                <div className="relative">
                  <Input
                    id="confirm-pin"
                    type={showConfirmPin ? "text" : "password"}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="h-14 text-mobile-xl text-center tracking-widest pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full min-h-touch"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                  >
                    {showConfirmPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="bg-accent/20 border border-accent rounded-lg p-4">
                <p className="text-mobile-sm text-muted-foreground">
                  ⚠️ Le changement de code PIN vous déconnectera automatiquement. 
                  Vous devrez vous reconnecter avec votre nouveau code.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoadingPin}
                variant="secondary"
                className="w-full h-14 text-mobile-base shadow-card active:scale-[0.98] transition-transform"
              >
                {isLoadingPin ? "Modification..." : "Modifier le code PIN"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profil;
