-- Etapa 1: variações (tamanho/cor) com estoque, carrinhos e itens do carrinho.
-- Regras: o carrinho guarda só a variação e a quantidade (nunca o preço);
-- estoque só o servidor altera; cada cliente vê e mexe só no próprio carrinho.

-- ---------------------------------------------------------------------------
-- Variações de produto: cada combinação de tamanho e cor tem o seu estoque.
-- ---------------------------------------------------------------------------
create table public.variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id) on delete cascade,
  tamanho text not null check (char_length(tamanho) between 1 and 8),
  cor text not null check (char_length(cor) between 1 and 40),
  sku text unique check (char_length(sku) <= 60),
  estoque integer not null default 0 check (estoque >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (produto_id, tamanho, cor)
);

create index variacoes_produto_id_idx on public.variacoes (produto_id);

alter table public.variacoes enable row level security;

-- Leitura pública só de variações ativas de produtos ativos.
create policy "variacoes: qualquer pessoa lê as ativas"
  on public.variacoes for select
  to anon, authenticated
  using (
    ativo and exists (select 1 from public.produtos p where p.id = produto_id and p.ativo)
  );

-- Sem políticas de insert/update/delete: só o servidor (service role) altera estoque.
revoke insert, update, delete on public.variacoes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Carrinho: um por usuário logado (visitantes usam o navegador).
-- ---------------------------------------------------------------------------
create table public.carrinhos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users (id) on delete cascade,
  atualizado_em timestamptz not null default now()
);

alter table public.carrinhos enable row level security;

create policy "carrinhos: dono lê"
  on public.carrinhos for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "carrinhos: dono cria o próprio"
  on public.carrinhos for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "carrinhos: dono atualiza"
  on public.carrinhos for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

create policy "carrinhos: dono apaga"
  on public.carrinhos for delete to authenticated
  using (usuario_id = (select auth.uid()));

revoke all on public.carrinhos from anon;

-- ---------------------------------------------------------------------------
-- Itens do carrinho: só variação e quantidade. Preço NUNCA fica aqui.
-- ---------------------------------------------------------------------------
create table public.itens_carrinho (
  id uuid primary key default gen_random_uuid(),
  carrinho_id uuid not null references public.carrinhos (id) on delete cascade,
  variacao_id uuid not null references public.variacoes (id) on delete cascade,
  quantidade integer not null check (quantidade between 1 and 10),
  criado_em timestamptz not null default now(),
  unique (carrinho_id, variacao_id)
);

create index itens_carrinho_carrinho_id_idx on public.itens_carrinho (carrinho_id);
create index itens_carrinho_variacao_id_idx on public.itens_carrinho (variacao_id);

alter table public.itens_carrinho enable row level security;

create policy "itens_carrinho: dono lê"
  on public.itens_carrinho for select to authenticated
  using (exists (select 1 from public.carrinhos c where c.id = carrinho_id and c.usuario_id = (select auth.uid())));

create policy "itens_carrinho: dono adiciona no próprio carrinho"
  on public.itens_carrinho for insert to authenticated
  with check (exists (select 1 from public.carrinhos c where c.id = carrinho_id and c.usuario_id = (select auth.uid())));

create policy "itens_carrinho: dono altera"
  on public.itens_carrinho for update to authenticated
  using (exists (select 1 from public.carrinhos c where c.id = carrinho_id and c.usuario_id = (select auth.uid())))
  with check (exists (select 1 from public.carrinhos c where c.id = carrinho_id and c.usuario_id = (select auth.uid())));

create policy "itens_carrinho: dono remove"
  on public.itens_carrinho for delete to authenticated
  using (exists (select 1 from public.carrinhos c where c.id = carrinho_id and c.usuario_id = (select auth.uid())));

revoke all on public.itens_carrinho from anon;

-- ---------------------------------------------------------------------------
-- Função atômica para pôr/alterar um item, limitando pela quantidade em estoque.
-- SECURITY INVOKER: roda com as permissões de quem chama, então a RLS vale.
-- somar = true soma à quantidade atual (usado no "adicionar" e ao mesclar no login);
-- somar = false define a quantidade exata (usado no +/- do carrinho). 0 remove.
-- Retorna a quantidade que ficou no carrinho.
-- ---------------------------------------------------------------------------
create function public.definir_item_carrinho(p_variacao_id uuid, p_quantidade integer, p_somar boolean default false)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_carrinho uuid;
  v_estoque integer;
  v_atual integer;
  v_maximo integer;
  v_nova integer;
begin
  if v_uid is null then
    raise exception 'nao_autenticado' using errcode = '42501';
  end if;
  if p_quantidade is null or p_quantidade < 0 or p_quantidade > 10 then
    raise exception 'quantidade_invalida' using errcode = '22023';
  end if;

  insert into public.carrinhos (usuario_id) values (v_uid)
    on conflict (usuario_id) do update set atualizado_em = now()
    returning id into v_carrinho;

  -- A política de leitura de variações já esconde as inativas e as de produto inativo.
  select v.estoque into v_estoque from public.variacoes v where v.id = p_variacao_id;
  if not found then
    raise exception 'variacao_invalida' using errcode = '22023';
  end if;

  v_maximo := least(10, v_estoque);
  select quantidade into v_atual from public.itens_carrinho
    where carrinho_id = v_carrinho and variacao_id = p_variacao_id
    for update;

  v_nova := least(v_maximo, case when p_somar then coalesce(v_atual, 0) + p_quantidade else p_quantidade end);

  if v_nova <= 0 then
    delete from public.itens_carrinho where carrinho_id = v_carrinho and variacao_id = p_variacao_id;
    return 0;
  end if;

  insert into public.itens_carrinho (carrinho_id, variacao_id, quantidade)
    values (v_carrinho, p_variacao_id, v_nova)
    on conflict (carrinho_id, variacao_id) do update set quantidade = excluded.quantidade;
  return v_nova;
end;
$$;

revoke execute on function public.definir_item_carrinho(uuid, integer, boolean) from public, anon;
grant execute on function public.definir_item_carrinho(uuid, integer, boolean) to authenticated;
