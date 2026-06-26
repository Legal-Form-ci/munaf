
-- member-photos: public read, auth upload/update/delete
CREATE POLICY "member photos public read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'member-photos');
CREATE POLICY "member photos auth write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-photos');
CREATE POLICY "member photos auth update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'member-photos');
CREATE POLICY "member photos auth delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'member-photos' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue')));

-- dossier-documents: admins + delegues only
CREATE POLICY "dossier docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'dossier-documents' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue')));
CREATE POLICY "dossier docs write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dossier-documents' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue')));
CREATE POLICY "dossier docs update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'dossier-documents' AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delegue')));
CREATE POLICY "dossier docs delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'dossier-documents' AND public.has_role(auth.uid(),'admin'));
