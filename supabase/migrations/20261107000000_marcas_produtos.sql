-- Marcas, produtos e perfis (papel cliente/admin), com RLS em todas as tabelas.
-- Rodar primeiro no projeto de TESTE do Supabase, nunca direto em produção.

-- ---------------------------------------------------------------------------
-- Perfis: um por usuário do Supabase Auth. O papel (role) só muda pelo banco.
-- ---------------------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text check (char_length(nome) <= 80),
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Cria o perfil automaticamente no cadastro, sempre como 'cliente'.
create function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id) values (new.id);
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- Diz se quem está logado é admin. "security definer" permite ler perfis
-- sem depender das políticas de perfis (evita recursão).
create function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create policy "perfis: usuário vê o próprio"
  on public.perfis for select
  to authenticated
  using (id = (select auth.uid()));

create policy "perfis: usuário edita o próprio"
  on public.perfis for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- O usuário só pode alterar a coluna "nome". "role" fica fora do alcance dele.
revoke update on public.perfis from anon, authenticated;
grant update (nome) on public.perfis to authenticated;

-- ---------------------------------------------------------------------------
-- Marcas
-- ---------------------------------------------------------------------------
create table public.marcas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  descricao text check (char_length(descricao) <= 200),
  logo text, -- caminho no storage; só arquivos próprios e autorizados
  estilo text not null default 'serifa' check (estilo in ('serifa', 'caixa-alta', 'italico')),
  criado_em timestamptz not null default now()
);

alter table public.marcas enable row level security;

create policy "marcas: qualquer pessoa lê"
  on public.marcas for select
  to anon, authenticated
  using (true);

create policy "marcas: só admin cria"
  on public.marcas for insert
  to authenticated
  with check ((select public.eh_admin()));

create policy "marcas: só admin altera"
  on public.marcas for update
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "marcas: só admin apaga"
  on public.marcas for delete
  to authenticated
  using ((select public.eh_admin()));

-- ---------------------------------------------------------------------------
-- Produtos (ligados à marca por marca_id). Preço em centavos.
-- ---------------------------------------------------------------------------
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  marca_id uuid not null references public.marcas (id) on delete restrict,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null check (char_length(nome) between 1 and 80),
  categoria text not null check (categoria in ('roupa', 'calcado')),
  tipo text not null,
  preco_centavos integer not null check (preco_centavos > 0),
  tamanhos text[] not null check (cardinality(tamanhos) > 0),
  cores jsonb not null,
  descricao text check (char_length(descricao) <= 240),
  detalhes text[] not null default '{}',
  imagem_frente text not null,
  imagem_costas text,
  imagem_lado text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (marca_id, slug)
);

create index produtos_marca_id_idx on public.produtos (marca_id);

alter table public.produtos enable row level security;

create policy "produtos: qualquer pessoa lê os ativos"
  on public.produtos for select
  to anon, authenticated
  using (ativo or (select public.eh_admin()));

create policy "produtos: só admin cria"
  on public.produtos for insert
  to authenticated
  with check ((select public.eh_admin()));

create policy "produtos: só admin altera"
  on public.produtos for update
  to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "produtos: só admin apaga"
  on public.produtos for delete
  to authenticated
  using ((select public.eh_admin()));
