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

      // Connexion directe avec email et PIN comme mot de passe
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
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Card className="w-full max-w-md border-2 border-primary/30 shadow-glow relative z-10 animate-fade-in backdrop-blur-sm bg-card/95">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-28 h-28 relative">
            <img src={logo} alt="Papa Tacos Logo" className="w-full h-full object-contain animate-fade-in drop-shadow-2xl" />
            <div className="absolute inset-0 bg-gradient-warm/30 rounded-full blur-2xl -z-10"></div>
          </div>
          <div>
            <CardTitle className="text-mobile-3xl bg-gradient-warm bg-clip-text text-transparent font-extrabold">Papa Tacos</CardTitle>
            <CardDescription className="text-mobile-base mt-2 font-medium">Gestion de Caisse</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
              <TabsTrigger value="login" className="text-mobile-base data-[state=active]:bg-gradient-warm data-[state=active]:text-primary-foreground transition-all-smooth">Connexion</TabsTrigger>
              <TabsTrigger value="signup" className="text-mobile-base data-[state=active]:bg-gradient-warm data-[state=active]:text-primary-foreground transition-all-smooth">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-5 mt-5">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-mobile-base">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-14 text-mobile-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-pin" className="text-mobile-base">Code PIN</Label>
                  <div className="relative">
                    <Input
                      id="login-pin"
                      type={showLoginPin ? "text" : "password"}
                      placeholder="••••"
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      maxLength={6}
                      className="h-14 text-mobile-xl text-center tracking-widest pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full min-h-touch"
                      onClick={() => setShowLoginPin(!showLoginPin)}
                    >
                      {showLoginPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-mobile-lg shadow-glow bg-gradient-warm hover:shadow-warm card-hover border-0" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-5">
              <form onSubmit={handleSignup} className="space-y-4">{/* ... */}
                <div className="space-y-2">
                  <Label htmlFor="signup-nom" className="text-mobile-base">Nom *</Label>
                  <Input
                    id="signup-nom"
                    type="text"
                    placeholder="Nom"
                    value={signupNom}
                    onChange={(e) => setSignupNom(e.target.value)}
                    className="h-14 text-mobile-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-prenom" className="text-mobile-base">Prénom</Label>
                  <Input
                    id="signup-prenom"
                    type="text"
                    placeholder="Prénom"
                    value={signupPrenom}
                    onChange={(e) => setSignupPrenom(e.target.value)}
                    className="h-14 text-mobile-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-telephone" className="text-mobile-base">Téléphone</Label>
                  <Input
                    id="signup-telephone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={signupTelephone}
                    onChange={(e) => setSignupTelephone(e.target.value)}
                    className="h-14 text-mobile-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-mobile-base">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="h-14 text-mobile-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-pin" className="text-mobile-base">Code PIN (4-6 chiffres) *</Label>
                  <div className="relative">
                    <Input
                      id="signup-pin"
                      type={showSignupPin ? "text" : "password"}
                      placeholder="••••"
                      value={signupPin}
                      onChange={(e) => setSignupPin(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      className="h-14 text-mobile-xl text-center tracking-widest pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full min-h-touch"
                      onClick={() => setShowSignupPin(!showSignupPin)}
                    >
                      {showSignupPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-mobile-base">Rôle *</Label>
                  <RadioGroup value={signupRole} onValueChange={(value) => setSignupRole(value as "proprietaire" | "caissier")}>
                    <div className="flex items-center space-x-3 border-2 rounded-xl p-4 active:scale-[0.98] transition-transform">
                      <RadioGroupItem value="caissier" id="caissier" className="min-h-touch min-w-[24px]" />
                      <Label htmlFor="caissier" className="flex-1 cursor-pointer text-mobile-base leading-snug">
                        👤 Caissier<br />
                        <span className="text-mobile-sm text-muted-foreground">Saisie des transactions</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border-2 rounded-xl p-4 bg-accent/20 active:scale-[0.98] transition-transform">
                      <RadioGroupItem value="proprietaire" id="proprietaire" className="min-h-touch min-w-[24px]" />
                      <Label htmlFor="proprietaire" className="flex-1 cursor-pointer text-mobile-base leading-snug">
                        👑 Propriétaire<br />
                        <span className="text-mobile-sm text-muted-foreground">Accès complet</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-mobile-lg shadow-glow bg-gradient-warm hover:shadow-warm card-hover border-0" 
                  disabled={isSigningUp}
                >
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
