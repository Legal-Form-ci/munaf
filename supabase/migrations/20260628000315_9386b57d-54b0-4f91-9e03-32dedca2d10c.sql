CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL CHECK (char_length(nom) BETWEEN 2 AND 120),
  telephone TEXT NOT NULL CHECK (char_length(telephone) BETWEEN 6 AND 30),
  email TEXT CHECK (email IS NULL OR char_length(email) <= 200),
  sujet TEXT NOT NULL CHECK (char_length(sujet) BETWEEN 2 AND 80),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 5 AND 2000),
  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau','en_cours','traite','archive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_can_submit" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin_can_view" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_can_update" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_can_delete" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX contact_messages_created_idx ON public.contact_messages (created_at DESC);