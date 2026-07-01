# MuNAF — Migration SQL complète à exécuter manuellement dans Supabase

> Copier-coller intégralement dans **SQL Editor** de Supabase puis exécuter.
> Sécurisé pour ré-exécution (IF NOT EXISTS / DROP ... IF EXISTS).
> Couvre : rôles étendus, associations, ayants droit / bénéficiaires, notifications,
> journal d'audit, synchronisation NSIA, paramètres système, paiements d'assistance.

---

## 1. Extension de l'énumération des rôles

```sql
-- Ajouter super_admin, association, nsia, equipe à l'enum existant app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'association';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'nsia';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'equipe';
```

> ⚠️ Postgres exige que les `ADD VALUE` soient committés avant utilisation : exécuter ce bloc **seul** d'abord, puis le reste.

---

## 2. Table `associations` (mutuelles / tontines / coopératives)

```sql
CREATE TABLE IF NOT EXISTS public.associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'mutuelle', -- mutuelle, tontine, cooperative, religieuse, syndicat
  numero_registre TEXT,
  representant_nom TEXT NOT NULL,
  representant_telephone TEXT NOT NULL,
  email TEXT,
  quartier TEXT NOT NULL,
  ville TEXT NOT NULL DEFAULT 'Daloa',
  logo_url TEXT,
  compte_mobile_money TEXT,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'actif', -- actif, suspendu
  total_membres INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.associations TO authenticated;
GRANT SELECT ON public.associations TO anon;
GRANT ALL ON public.associations TO service_role;

ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gèrent les associations" ON public.associations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Association lit son propre dossier" ON public.associations
  FOR SELECT TO authenticated
  USING (admin_user_id = auth.uid());

CREATE POLICY "Lecture publique" ON public.associations
  FOR SELECT TO anon USING (true);

CREATE TRIGGER trg_associations_updated_at
BEFORE UPDATE ON public.associations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 3. Lien membres ↔ associations + nouveaux champs membres

```sql
ALTER TABLE public.membres
  ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.associations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delegue_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sexe TEXT,
  ADD COLUMN IF NOT EXISTS date_naissance DATE,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS cni TEXT,
  ADD COLUMN IF NOT EXISTS adresse_complete TEXT;

CREATE INDEX IF NOT EXISTS idx_membres_association ON public.membres(association_id);
CREATE INDEX IF NOT EXISTS idx_membres_delegue ON public.membres(delegue_id);
```

---

## 4. Ayants droit (conjoints, enfants, parents)

```sql
CREATE TABLE IF NOT EXISTS public.ayants_droit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id UUID NOT NULL REFERENCES public.membres(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  lien TEXT NOT NULL, -- conjoint, enfant, parent, frere_soeur
  date_naissance DATE,
  telephone TEXT,
  niveau TEXT NOT NULL DEFAULT 'secondaire', -- principal, secondaire
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ayants_droit TO authenticated;
GRANT ALL ON public.ayants_droit TO service_role;

ALTER TABLE public.ayants_droit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membre gère ses ayants droit" ON public.ayants_droit
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.membres m WHERE m.id = membre_id AND m.user_id = auth.uid())
         OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.membres m WHERE m.id = membre_id AND m.user_id = auth.uid())
         OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_ayants_droit_updated_at
BEFORE UPDATE ON public.ayants_droit
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 5. Bénéficiaires (réception du capital)

```sql
CREATE TABLE IF NOT EXISTS public.beneficiaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id UUID NOT NULL REFERENCES public.membres(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  lien TEXT NOT NULL,
  telephone TEXT NOT NULL,
  compte_mobile_money TEXT,
  quote_part INT NOT NULL DEFAULT 100, -- pourcentage
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beneficiaires TO authenticated;
GRANT ALL ON public.beneficiaires TO service_role;

ALTER TABLE public.beneficiaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Membre gère ses bénéficiaires" ON public.beneficiaires
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.membres m WHERE m.id = membre_id AND m.user_id = auth.uid())
         OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.membres m WHERE m.id = membre_id AND m.user_id = auth.uid())
         OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_beneficiaires_updated_at
BEFORE UPDATE ON public.beneficiaires
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 6. Notifications

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, alerte, rappel, dossier, paiement, nsia
  lien TEXT,
  lu BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User voit ses notifs" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "User marque ses notifs" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin crée des notifs" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'delegue')
    OR user_id = auth.uid()
  );

CREATE INDEX IF NOT EXISTS idx_notifs_user ON public.notifications(user_id, lu, created_at DESC);
```

---

## 7. Journal d'audit (traçabilité immuable)

```sql
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_label TEXT,
  action TEXT NOT NULL,        -- create_membre, update_dossier, mark_payee, valider_dossier, etc.
  entite TEXT NOT NULL,        -- membre, dossier, cotisation, association, nsia
  entite_id TEXT,
  details JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture audit admins" ON public.audit_log
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')
  );
CREATE POLICY "Insertion audit auth" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entite ON public.audit_log(entite, entite_id);
```

---

## 8. Synchronisation NSIA

```sql
CREATE TABLE IF NOT EXISTS public.nsia_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- dossier_transmis, dossier_valide, dossier_rejete, dossier_verse, prime_reversee
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE SET NULL,
  membre_id UUID REFERENCES public.membres(id) ON DELETE SET NULL,
  payload JSONB,
  response JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.nsia_sync TO authenticated;
GRANT ALL ON public.nsia_sync TO service_role;

ALTER TABLE public.nsia_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NSIA et admins lisent sync" ON public.nsia_sync
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'nsia')
  );
CREATE POLICY "NSIA et admins écrivent sync" ON public.nsia_sync
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'nsia')
  );
CREATE POLICY "NSIA met à jour" ON public.nsia_sync
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'nsia')
  );

CREATE INDEX IF NOT EXISTS idx_nsia_sync_dossier ON public.nsia_sync(dossier_id);
CREATE INDEX IF NOT EXISTS idx_nsia_sync_created ON public.nsia_sync(created_at DESC);
```

---

## 9. Paiements d'assistance (versements NSIA et reversements asso → famille)

```sql
CREATE TABLE IF NOT EXISTS public.paiements_assistance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- nsia_vers_munaf, nsia_vers_membre, nsia_vers_association, association_vers_famille
  montant BIGINT NOT NULL,
  beneficiaire_nom TEXT,
  compte_destination TEXT,
  reference TEXT,
  date_paiement TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.paiements_assistance TO authenticated;
GRANT ALL ON public.paiements_assistance TO service_role;

ALTER TABLE public.paiements_assistance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gèrent paiements" ON public.paiements_assistance
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'nsia')
  );

CREATE POLICY "Membre/association voit ses paiements" ON public.paiements_assistance
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.dossiers d
      JOIN public.membres m ON m.id = d.membre_id
      WHERE d.id = dossier_id
        AND (m.user_id = auth.uid()
             OR EXISTS (SELECT 1 FROM public.associations a WHERE a.id = m.association_id AND a.admin_user_id = auth.uid()))
    )
  );
```

---

## 10. Paramètres système (super-admin)

```sql
CREATE TABLE IF NOT EXISTS public.parametres (
  cle TEXT PRIMARY KEY,
  valeur JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE ON public.parametres TO authenticated;
GRANT SELECT ON public.parametres TO anon;
GRANT ALL ON public.parametres TO service_role;

ALTER TABLE public.parametres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique paramètres" ON public.parametres
  FOR SELECT USING (true);
CREATE POLICY "Super admin modifie" ON public.parametres
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

INSERT INTO public.parametres (cle, valeur, description) VALUES
  ('frais_adhesion', '2000'::jsonb, 'Frais d''adhésion (FCFA)'),
  ('marge_munaf', '30'::jsonb, 'Marge MuNAF (%)'),
  ('part_association', '10'::jsonb, 'Part association sur assistance (%)'),
  ('duree_carence_mois', '3'::jsonb, 'Durée de carence (mois)'),
  ('nsia_api_url', '"https://api.nsia-ci.example"'::jsonb, 'URL API NSIA'),
  ('nsia_environnement', '"test"'::jsonb, 'Environnement NSIA (test|production)')
ON CONFLICT (cle) DO NOTHING;
```

---

## 11. RPC stats étendues (admin + nsia + super)

```sql
CREATE OR REPLACE FUNCTION public.stats_admin()
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'membres_total', (SELECT count(*) FROM public.membres),
    'membres_actifs', (SELECT count(*) FROM public.membres WHERE status='actif'),
    'membres_carence', (SELECT count(*) FROM public.membres WHERE status='carence'),
    'membres_suspendu', (SELECT count(*) FROM public.membres WHERE status='suspendu'),
    'membres_decede', (SELECT count(*) FROM public.membres WHERE status='decede'),
    'associations', (SELECT count(*) FROM public.associations),
    'dossiers_total', (SELECT count(*) FROM public.dossiers),
    'dossiers_en_cours', (SELECT count(*) FROM public.dossiers WHERE status IN ('declare','verification','valide','transmis')),
    'dossiers_verses', (SELECT count(*) FROM public.dossiers WHERE status IN ('assistance_versee','cloture')),
    'cotisations_payees', COALESCE((SELECT sum(montant)::bigint FROM public.cotisations WHERE status='payee'),0),
    'cotisations_en_attente', COALESCE((SELECT sum(montant)::bigint FROM public.cotisations WHERE status<>'payee'),0),
    'assistance_versee', COALESCE((SELECT sum(montant_assistance)::bigint FROM public.dossiers WHERE status IN ('assistance_versee','cloture')),0)
  );
$$;

GRANT EXECUTE ON FUNCTION public.stats_admin() TO authenticated;
```

---

## 12. Création des comptes de démo

```sql
-- À exécuter UNE seule fois après création initiale via l'interface Supabase Auth.
-- Crée les rôles : super_admin, association, delegue, nsia, equipe
-- (les comptes utilisateurs eux-mêmes se créent via Auth > Add user)

-- Exemple : promouvoir l'utilisateur "munaf" en super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE email = 'munaf@munaf.local'
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 13. Vérification finale

```sql
-- Liste des tables publiques + RLS activé
SELECT tablename,
       (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename=t.tablename) AS policies
FROM pg_tables t WHERE schemaname='public' ORDER BY tablename;
```

---

## 14. Intégration NSIA — Clés API, Webhooks & Alertes (nouveau)

```sql
-- 14.1 Clés API NSIA (générées et révoquées par le super-admin)
CREATE TABLE IF NOT EXISTS public.nsia_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  key_prefix TEXT NOT NULL,          -- 8 premiers caractères visibles
  key_hash TEXT NOT NULL,            -- SHA-256 hex
  scopes TEXT[] NOT NULL DEFAULT ARRAY['dossiers:read','dossiers:write','webhook:receive'],
  environment TEXT NOT NULL DEFAULT 'production', -- production | sandbox
  active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nsia_api_keys TO authenticated;
GRANT ALL ON public.nsia_api_keys TO service_role;
ALTER TABLE public.nsia_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage keys" ON public.nsia_api_keys FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- 14.2 Webhooks sortants MuNAF → NSIA (souscriptions gérées par le super-admin)
CREATE TABLE IF NOT EXISTS public.nsia_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,              -- signature HMAC SHA-256
  events TEXT[] NOT NULL DEFAULT ARRAY['dossier.transmis','dossier.updated'],
  active BOOLEAN NOT NULL DEFAULT true,
  last_delivery_at TIMESTAMPTZ,
  last_status INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nsia_webhooks TO authenticated;
GRANT ALL ON public.nsia_webhooks TO service_role;
ALTER TABLE public.nsia_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage webhooks" ON public.nsia_webhooks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- 14.3 Alertes système (écarts NSIA, anomalies…)
CREATE TABLE IF NOT EXISTS public.alertes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,                -- drift_no_response | status_mismatch | api_failure | webhook_failure
  severity TEXT NOT NULL DEFAULT 'warning', -- info | warning | critical
  titre TEXT NOT NULL,
  message TEXT,
  dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
  payload JSONB,
  resolue BOOLEAN NOT NULL DEFAULT false,
  resolue_at TIMESTAMPTZ,
  resolue_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS alertes_resolue_idx ON public.alertes(resolue, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertes TO authenticated;
GRANT ALL ON public.alertes TO service_role;
ALTER TABLE public.alertes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read alertes" ON public.alertes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'equipe'));
CREATE POLICY "admin update alertes" ON public.alertes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admin insert alertes" ON public.alertes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
```

## 15. Job cron de réconciliation NSIA (à exécuter via SQL Editor)

```sql
-- Prérequis : extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Toutes les heures, appelle le hook de réconciliation
SELECT cron.schedule(
  'nsia-reconcile-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://project--5181194d-1285-432c-bbf7-5551442e2b31.lovable.app/api/public/hooks/nsia-reconcile',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

-- Pour annuler : SELECT cron.unschedule('nsia-reconcile-hourly');
```

