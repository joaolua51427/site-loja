-- A função rls_auto_enable() vem pronta no projeto Supabase: um gatilho que liga a RLS
-- sozinho em toda tabela nova do esquema public. O gatilho continua funcionando;
-- só tiramos a possibilidade de visitantes e usuários chamarem a função pela API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
