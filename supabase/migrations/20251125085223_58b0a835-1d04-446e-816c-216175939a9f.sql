-- Supprimer les anciennes politiques de SELECT restrictives
DROP POLICY IF EXISTS "Les caissiers peuvent voir leurs propres recettes" ON public.recettes;
DROP POLICY IF EXISTS "Les caissiers peuvent voir leurs propres dépenses" ON public.depenses;
DROP POLICY IF EXISTS "Les caissiers peuvent voir leurs propres charges" ON public.charges;
DROP POLICY IF EXISTS "Les propriétaires peuvent tout voir sur recettes" ON public.recettes;
DROP POLICY IF EXISTS "Les propriétaires peuvent tout voir sur dépenses" ON public.depenses;
DROP POLICY IF EXISTS "Les propriétaires peuvent tout voir sur charges" ON public.charges;

-- Créer de nouvelles politiques permettant à tous les utilisateurs authentifiés de voir toutes les données
CREATE POLICY "Tous les utilisateurs authentifiés peuvent voir toutes les recettes"
ON public.recettes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tous les utilisateurs authentifiés peuvent voir toutes les dépenses"
ON public.depenses
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tous les utilisateurs authentifiés peuvent voir toutes les charges"
ON public.charges
FOR SELECT
TO authenticated
USING (true);