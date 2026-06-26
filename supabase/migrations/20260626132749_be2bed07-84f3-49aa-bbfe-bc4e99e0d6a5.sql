
-- ============ EXTENSIONS ============
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'delegue', 'membre');
CREATE TYPE public.member_status AS ENUM ('actif','carence','suspendu','expire','resilie','decede');
CREATE TYPE public.dossier_status AS ENUM ('declare','verification','valide','transmis','assistance_versee','cloture','rejete');
CREATE TYPE public.cotisation_status AS ENUM ('payee','en_attente','en_retard');
CREATE TYPE public.formule AS ENUM ('F100','F200','F300','F500','F1000');

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role);
$$;

CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ MEMBRES ============
CREATE TABLE public.membres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  sexe CHAR(1) NOT NULL CHECK (sexe IN ('M','F')),
  date_naissance DATE,
  telephone TEXT NOT NULL,
  email TEXT,
  quartier TEXT NOT NULL,
  ville TEXT NOT NULL DEFAULT 'Daloa',
  region TEXT NOT NULL DEFAULT 'Haut-Sassandra',
  profession TEXT,
  association TEXT,
  formule formule NOT NULL DEFAULT 'F200',
  status member_status NOT NULL DEFAULT 'carence',
  date_adhesion DATE NOT NULL DEFAULT CURRENT_DATE,
  fin_carence DATE,
  date_deces DATE,
  photo_url TEXT,
  delegue_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_membres_quartier ON public.membres(quartier);
CREATE INDEX idx_membres_status ON public.membres(status);
CREATE INDEX idx_membres_telephone ON public.membres(telephone);
CREATE INDEX idx_membres_matricule ON public.membres(matricule);
CREATE INDEX idx_membres_user_id ON public.membres(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.membres TO authenticated;
GRANT ALL ON public.membres TO service_role;
ALTER TABLE public.membres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membre voit son profil" ON public.membres FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'));
CREATE POLICY "admin gere membres" ON public.membres FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "delegue modifie son quartier" ON public.membres FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'delegue') AND delegue_id = auth.uid());

CREATE TRIGGER trg_membres_updated BEFORE UPDATE ON public.membres FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public verification function (anon-callable, limited fields)
CREATE OR REPLACE FUNCTION public.verifier_membre(_query TEXT)
RETURNS TABLE(matricule TEXT, nom TEXT, prenom TEXT, quartier TEXT, ville TEXT,
              formule formule, status member_status, date_adhesion DATE, photo_url TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.matricule, m.nom, m.prenom, m.quartier, m.ville,
         m.formule, m.status, m.date_adhesion, m.photo_url
  FROM public.membres m
  WHERE m.matricule ILIKE _query
     OR m.telephone = _query
     OR m.telephone = regexp_replace(_query,'\s','','g')
  LIMIT 5;
$$;
GRANT EXECUTE ON FUNCTION public.verifier_membre(TEXT) TO anon, authenticated;

-- ============ COTISATIONS ============
CREATE TABLE public.cotisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membre_id UUID NOT NULL REFERENCES public.membres(id) ON DELETE CASCADE,
  mois DATE NOT NULL,
  montant INTEGER NOT NULL,
  status cotisation_status NOT NULL DEFAULT 'en_attente',
  date_paiement TIMESTAMPTZ,
  moyen TEXT,
  reference TEXT,
  enregistre_par UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(membre_id, mois)
);
CREATE INDEX idx_cotisations_membre ON public.cotisations(membre_id);
CREATE INDEX idx_cotisations_status ON public.cotisations(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cotisations TO authenticated;
GRANT ALL ON public.cotisations TO service_role;
ALTER TABLE public.cotisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cot membre lecture" ON public.cotisations FOR SELECT TO authenticated
  USING (EXISTS(SELECT 1 FROM public.membres m WHERE m.id=membre_id AND (m.user_id=auth.uid() OR m.delegue_id=auth.uid()))
         OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'));
CREATE POLICY "cot admin all" ON public.cotisations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'));
CREATE TRIGGER trg_cot_updated BEFORE UPDATE ON public.cotisations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DOSSIERS DECES ============
CREATE TABLE public.dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  membre_id UUID NOT NULL REFERENCES public.membres(id) ON DELETE CASCADE,
  declarant_nom TEXT NOT NULL,
  declarant_lien TEXT,
  declarant_telephone TEXT NOT NULL,
  date_deces DATE NOT NULL,
  lieu_deces TEXT,
  cause TEXT,
  status dossier_status NOT NULL DEFAULT 'declare',
  montant_assistance INTEGER,
  date_versement DATE,
  reference_versement TEXT,
  notes TEXT,
  delegue_id UUID REFERENCES auth.users(id),
  traite_par UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dossiers_status ON public.dossiers(status);
CREATE INDEX idx_dossiers_membre ON public.dossiers(membre_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dossiers TO authenticated;
GRANT ALL ON public.dossiers TO service_role;
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dossiers lecture" ON public.dossiers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue')
         OR EXISTS(SELECT 1 FROM public.membres m WHERE m.id=membre_id AND m.user_id=auth.uid()));
CREATE POLICY "dossiers admin all" ON public.dossiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'));
CREATE TRIGGER trg_dossiers_updated BEFORE UPDATE ON public.dossiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DOSSIER DOCUMENTS ============
CREATE TABLE public.dossier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dossier_documents TO authenticated;
GRANT ALL ON public.dossier_documents TO service_role;
ALTER TABLE public.dossier_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs lecture" ON public.dossier_documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'));
CREATE POLICY "docs admin all" ON public.dossier_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue'));

-- ============ AUTO PROFILE on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, username, full_name)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)),
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED SUPER ADMIN ============
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'munaf@munaf.local') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'munaf@munaf.local', crypt('@Munaf2026', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"munaf","full_name":"Super Admin MuNAF"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_id,
            jsonb_build_object('sub', admin_id::text, 'email', 'munaf@munaf.local'),
            'email', admin_id::text, now(), now(), now());
    INSERT INTO public.user_roles(user_id, role) VALUES (admin_id, 'admin');
  END IF;
END $$;

-- ============ SEED 1000 MEMBRES DEMO ============
DO $$
DECLARE
  quartiers TEXT[] := ARRAY['Tazibouo','Lobia','Garage','Abattoir','Soleil','Orly','Kennedy','Marais','Commerce','Piscine','Tagbasso','Dioulabougou','Huberson','Évêché','Belleville','Gbeuli','Baoulé','Gboguhé','Zaïbo','Gonaté','Bédiala','Gadouan'];
  prenoms_m TEXT[] := ARRAY['Konan','Koffi','Yao','Kouassi','Kouadio','Kouamé','N''Guessan','Aboubacar','Ibrahim','Moussa','Mamadou','Souleymane','Adama','Sékou','Drissa','Issa','Bakary','Sylvain','Hervé','Patrice'];
  prenoms_f TEXT[] := ARRAY['Akissi','Affoué','Adjoua','Amenan','Aya','Mariam','Aminata','Fatoumata','Awa','Salimata','Hawa','Djénéba','Bintou','Adèle','Clarisse','Estelle','Sylvie','Pélagie','Solange','Yolande'];
  noms TEXT[] := ARRAY['Bamba','Coulibaly','Touré','Ouattara','Bakayoko','Doumbia','Diaby','Konaté','Traoré','Kéita','Diomandé','Soro','Cissé','Diakité','Fofana','Sanogo','Camara','Diallo','Konan','Koffi','Yao','Kouassi','N''Guessan','Goué','Tapé','Zadi','Bohoussou','Djédjé'];
  professions TEXT[] := ARRAY['Cultivateur de cacao','Commerçant','Couturière','Mécanicien','Chauffeur de taxi','Maraîcher','Vendeuse marché','Coiffeuse','Menuisier','Maçon','Tailleur','Enseignant','Infirmier','Pisteur cacao','Éleveur','Boutiquier','Restauratrice','Boulanger','Fonctionnaire'];
  formules formule[] := ARRAY['F100','F200','F300','F500','F1000']::formule[];
  i INT;
  s INT;
  is_male BOOLEAN;
  v_sexe CHAR(1);
  v_prenom TEXT;
  v_nom TEXT;
  v_quartier TEXT;
  v_formule formule;
  v_status member_status;
  v_adhesion DATE;
  v_carence DATE;
  v_deces DATE;
  v_photo TEXT;
BEGIN
  IF (SELECT COUNT(*) FROM public.membres) > 100 THEN RETURN; END IF;
  FOR i IN 1..1000 LOOP
    is_male := (i % 2 = 0);
    v_sexe := CASE WHEN is_male THEN 'M' ELSE 'F' END;
    v_prenom := CASE WHEN is_male THEN prenoms_m[1 + (i * 7 % array_length(prenoms_m,1))]
                                    ELSE prenoms_f[1 + (i * 11 % array_length(prenoms_f,1))] END;
    v_nom := noms[1 + (i * 13 % array_length(noms,1))];
    v_quartier := quartiers[1 + (i * 17 % array_length(quartiers,1))];
    v_formule := formules[1 + (i % 5)];
    s := i % 100;
    v_status := CASE
      WHEN s < 62 THEN 'actif'::member_status
      WHEN s < 78 THEN 'carence'::member_status
      WHEN s < 86 THEN 'suspendu'::member_status
      WHEN s < 92 THEN 'expire'::member_status
      WHEN s < 96 THEN 'decede'::member_status
      ELSE 'resilie'::member_status END;
    v_adhesion := CURRENT_DATE - ((i * 3) % 900);
    v_carence := v_adhesion + 90;
    v_deces := CASE WHEN v_status = 'decede' THEN CURRENT_DATE - (i % 120) ELSE NULL END;
    v_photo := 'https://i.pravatar.cc/200?img=' || (1 + (i % 70));

    INSERT INTO public.membres(matricule, nom, prenom, sexe, date_naissance, telephone, quartier,
                               profession, formule, status, date_adhesion, fin_carence, date_deces, photo_url)
    VALUES (
      'MNF-' || lpad(i::text, 5, '0'),
      v_nom, v_prenom, v_sexe,
      CURRENT_DATE - INTERVAL '1 year' * (20 + (i % 50)),
      '+22507' || lpad(((i * 31 + 1000000) % 100000000)::text, 8, '0'),
      v_quartier,
      professions[1 + (i % array_length(professions,1))],
      v_formule, v_status, v_adhesion, v_carence, v_deces, v_photo
    );
  END LOOP;

  -- Seed cotisations for actifs (last 6 months)
  INSERT INTO public.cotisations(membre_id, mois, montant, status, date_paiement)
  SELECT m.id, (date_trunc('month', CURRENT_DATE) - (n || ' months')::interval)::date,
         CASE m.formule WHEN 'F100' THEN 500 WHEN 'F200' THEN 1000 WHEN 'F300' THEN 1500
                        WHEN 'F500' THEN 2500 WHEN 'F1000' THEN 5000 END,
         CASE WHEN n = 0 AND random() < 0.3 THEN 'en_attente'::cotisation_status
              WHEN random() < 0.05 THEN 'en_retard'::cotisation_status
              ELSE 'payee'::cotisation_status END,
         CASE WHEN random() < 0.85 THEN now() - (n || ' months')::interval ELSE NULL END
  FROM public.membres m, generate_series(0,5) n
  WHERE m.status IN ('actif','suspendu');

  -- Seed dossiers for decedes
  INSERT INTO public.dossiers(numero, membre_id, declarant_nom, declarant_lien, declarant_telephone,
                              date_deces, lieu_deces, status, montant_assistance, date_versement)
  SELECT 'DOS-' || lpad((row_number() OVER ())::text, 5, '0'),
         m.id, 'Famille ' || m.nom, 'Conjoint', m.telephone,
         m.date_deces, 'Daloa, ' || m.quartier,
         (ARRAY['declare','verification','valide','transmis','assistance_versee','cloture'])[1 + (extract(day from m.date_deces)::int % 6)]::dossier_status,
         CASE m.formule WHEN 'F100' THEN 100000 WHEN 'F200' THEN 200000 WHEN 'F300' THEN 300000
                        WHEN 'F500' THEN 500000 WHEN 'F1000' THEN 1000000 END,
         CASE WHEN extract(day from m.date_deces)::int % 6 >= 4 THEN m.date_deces + 14 ELSE NULL END
  FROM public.membres m
  WHERE m.status = 'decede';
END $$;
