import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/papa-tacos-logo.png";
import { z } from "zod";

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  pinCode: z.string().min(4, "Le code PIN doit contenir au moins 4 chiffres").max(6, "Le code PIN ne peut pas dépasser 6 chiffres"),
});

const signupSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50),
  prenom: z.string().max(50).optional(),
  telephone: z.string().min(8, "Numéro de téléphone invalide").max(15).optional(),
  email: z.string().email("Email invalide"),
  pinCode: z.string().min(4, "Le code PIN doit contenir au moins 4 chiffres").max(6, "Le code PIN ne peut pas dépasser 6 chiffres").regex(/^\d+$/, "Le code PIN doit contenir uniquement des chiffres"),
  role: z.enum(["proprietaire", "caissier"]),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup states
  const [signupNom, setSignupNom] = useState("");
  const [signupPrenom, setSignupPrenom] = useState("");
  const [signupTelephone, setSignupTelephone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPin, setSignupPin] = useState("");
  const [showSignupPin, setShowSignupPin] = useState(false);
  const [signupRole, setSignupRole] = useState<"proprietaire" | "caissier">("caissier");
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = loginSchema.parse({
        email: loginEmail,
        pinCode: loginPin,
      });

      setIsLoggingIn(true);

      // Vérifier d'abord si le profil existe avec ce PIN
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("pin_code")
        .eq("pin_code", validatedData.pinCode)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Erreur",
          description: "Code PIN incorrect",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }

      // Connexion avec email et PIN comme mot de passe
      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.pinCode,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erreur",
            description: "Email ou code PIN incorrect",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Papa Tacos",
        });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = signupSchema.parse({
        nom: signupNom,
        prenom: signupPrenom || undefined,
        telephone: signupTelephone || undefined,
        email: signupEmail,
        pinCode: signupPin,
        role: signupRole,
      });

      setIsSigningUp(true);

      const redirectUrl = `${window.location.origin}/`;

      // Inscription avec les métadonnées
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.pinCode,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nom: validatedData.nom,
            prenom: validatedData.prenom || "",
            pin_code: validatedData.pinCode,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Erreur",
            description: "Cet email est déjà utilisé",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data.user) {
        // Mettre à jour le rôle si c'est un propriétaire
        if (validatedData.role === "proprietaire") {
          await supabase
            .from("user_roles")
            .update({ role: "proprietaire" })
            .eq("user_id", data.user.id);
        }

        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
        });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-warm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-32 h-32">
            <img src={logo} alt="Papa Tacos Logo" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl">Papa Tacos</CardTitle>
          <CardDescription>Connexion à votre espace</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-pin">Code PIN</Label>
                  <div className="relative">
                    <Input
                      id="login-pin"
                      type={showLoginPin ? "text" : "password"}
                      placeholder="••••"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      maxLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowLoginPin(!showLoginPin)}
                    >
                      {showLoginPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full shadow-warm" disabled={isLoggingIn}>
                  {isLoggingIn ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nom">Nom *</Label>
                  <Input
                    id="signup-nom"
                    type="text"
                    placeholder="Nom"
                    value={signupNom}
                    onChange={(e) => setSignupNom(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-prenom">Prénom</Label>
                  <Input
                    id="signup-prenom"
                    type="text"
                    placeholder="Prénom"
                    value={signupPrenom}
                    onChange={(e) => setSignupPrenom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-telephone">Téléphone</Label>
                  <Input
                    id="signup-telephone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={signupTelephone}
                    onChange={(e) => setSignupTelephone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-pin">Code PIN (4-6 chiffres) *</Label>
                  <div className="relative">
                    <Input
                      id="signup-pin"
                      type={showSignupPin ? "text" : "password"}
                      placeholder="••••"
                      value={signupPin}
                      onChange={(e) => setSignupPin(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowSignupPin(!showSignupPin)}
                    >
                      {showSignupPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Rôle *</Label>
                  <RadioGroup value={signupRole} onValueChange={(value) => setSignupRole(value as "proprietaire" | "caissier")}>
                    <div className="flex items-center space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value="caissier" id="caissier" />
                      <Label htmlFor="caissier" className="flex-1 cursor-pointer">
                        Caissier - Saisie des transactions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 bg-accent/30">
                      <RadioGroupItem value="proprietaire" id="proprietaire" />
                      <Label htmlFor="proprietaire" className="flex-1 cursor-pointer">
                        Propriétaire - Accès complet
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full shadow-warm" disabled={isSigningUp}>
                  {isSigningUp ? "Inscription..." : "Créer mon compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
