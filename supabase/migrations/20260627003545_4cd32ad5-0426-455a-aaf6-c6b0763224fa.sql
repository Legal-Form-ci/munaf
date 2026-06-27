CREATE OR REPLACE FUNCTION public.stats_publiques()
RETURNS TABLE(total_membres BIGINT, total_dossiers BIGINT, assistance_versee BIGINT, cotisations_collectees BIGINT, quartiers BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT count(*) FROM public.membres),
    (SELECT count(*) FROM public.dossiers),
    COALESCE((SELECT sum(montant_assistance)::bigint FROM public.dossiers WHERE status IN ('assistance_versee','cloture')),0),
    COALESCE((SELECT sum(montant)::bigint FROM public.cotisations WHERE status='payee'),0),
    (SELECT count(DISTINCT quartier) FROM public.membres);
$$;
GRANT EXECUTE ON FUNCTION public.stats_publiques() TO anon, authenticated;