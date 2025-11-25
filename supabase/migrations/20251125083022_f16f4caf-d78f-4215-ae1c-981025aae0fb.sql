-- Créer l'enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('proprietaire', 'caissier');

-- Table des profils utilisateur
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT,
  telephone TEXT,
  avatar_url TEXT,
  pin_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des rôles utilisateur (séparée pour la sécurité)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fonction sécurisée pour vérifier les rôles (évite la récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Fonction pour créer automatiquement le profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, pin_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'pin_code', '')
  );
  
  -- Assigner le rôle par défaut (caissier)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'caissier');
  
  RETURN NEW;
END;
$$;

-- Trigger pour la création automatique du profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger pour updated_at sur profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies pour profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Les propriétaires peuvent voir tous les profils"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- RLS Policies pour user_roles
CREATE POLICY "Les utilisateurs peuvent voir leurs propres rôles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les propriétaires peuvent voir tous les rôles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- Modifier les RLS des tables existantes pour prendre en compte les rôles
DROP POLICY IF EXISTS "Accès public aux recettes" ON public.recettes;
DROP POLICY IF EXISTS "Accès public aux dépenses" ON public.depenses;
DROP POLICY IF EXISTS "Accès public aux charges" ON public.charges;

-- Ajouter une colonne user_id aux tables existantes pour tracer qui a créé l'entrée
ALTER TABLE public.recettes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.depenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.charges ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- RLS pour recettes
CREATE POLICY "Les propriétaires peuvent tout voir sur recettes"
  ON public.recettes FOR SELECT
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE POLICY "Les caissiers peuvent voir leurs propres recettes"
  ON public.recettes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des recettes"
  ON public.recettes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les propriétaires peuvent modifier toutes les recettes"
  ON public.recettes FOR UPDATE
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE POLICY "Les caissiers peuvent modifier leurs propres recettes"
  ON public.recettes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les propriétaires peuvent supprimer toutes les recettes"
  ON public.recettes FOR DELETE
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- RLS pour dépenses
CREATE POLICY "Les propriétaires peuvent tout voir sur dépenses"
  ON public.depenses FOR SELECT
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE POLICY "Les caissiers peuvent voir leurs propres dépenses"
  ON public.depenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des dépenses"
  ON public.depenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les propriétaires peuvent modifier toutes les dépenses"
  ON public.depenses FOR UPDATE
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE POLICY "Les caissiers peuvent modifier leurs propres dépenses"
  ON public.depenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les propriétaires peuvent supprimer toutes les dépenses"
  ON public.depenses FOR DELETE
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- RLS pour charges
CREATE POLICY "Les propriétaires peuvent tout voir sur charges"
  ON public.charges FOR SELECT
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE POLICY "Les caissiers peuvent voir leurs propres charges"
  ON public.charges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer des charges"
  ON public.charges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les propriétaires peuvent modifier toutes les charges"
  ON public.charges FOR UPDATE
  USING (public.has_role(auth.uid(), 'proprietaire'));

CREATE POLICY "Les caissiers peuvent modifier leurs propres charges"
  ON public.charges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les propriétaires peuvent supprimer toutes les charges"
  ON public.charges FOR DELETE
  USING (public.has_role(auth.uid(), 'proprietaire'));

-- Créer des index pour améliorer les performances
CREATE INDEX idx_recettes_user_id ON public.recettes(user_id);
CREATE INDEX idx_depenses_user_id ON public.depenses(user_id);
CREATE INDEX idx_charges_user_id ON public.charges(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);