-- Création de la table recettes
CREATE TABLE public.recettes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  montant DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  mode_paiement TEXT NOT NULL CHECK (mode_paiement IN ('Espèces', 'Mobile Money', 'CB')),
  date_recette TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Création de la table depenses
CREATE TABLE public.depenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  montant DECIMAL(10,2) NOT NULL,
  categorie TEXT NOT NULL,
  fournisseur TEXT,
  photo_ticket TEXT,
  date_depense TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Création de la table charges
CREATE TABLE public.charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type_charge TEXT NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  date_charge TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charges ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour un accès public (app de caisse locale)
CREATE POLICY "Accès public aux recettes"
ON public.recettes FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Accès public aux dépenses"
ON public.depenses FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Accès public aux charges"
ON public.charges FOR ALL
USING (true)
WITH CHECK (true);

-- Indexes pour améliorer les performances
CREATE INDEX idx_recettes_date ON public.recettes(date_recette DESC);
CREATE INDEX idx_depenses_date ON public.depenses(date_depense DESC);
CREATE INDEX idx_charges_date ON public.charges(date_charge DESC);
CREATE INDEX idx_depenses_categorie ON public.depenses(categorie);