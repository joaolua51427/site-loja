-- Etapa 2 (base): frete. Peso e medidas dos produtos, configurações da loja e tabela de frete por UF (plano B).

-- ---------------------------------------------------------------------------
-- Peso e medidas da embalagem de cada produto (para cotar o frete).
-- ---------------------------------------------------------------------------
alter table public.produtos
  add column peso_gramas integer not null default 800 check (peso_gramas between 1 and 30000),
  add column altura_cm integer not null default 10 check (altura_cm between 1 and 100),
  add column largura_cm integer not null default 25 check (largura_cm between 1 and 100),
  add column comprimento_cm integer not null default 32 check (comprimento_cm between 1 and 100);

-- ---------------------------------------------------------------------------
-- Configurações da loja: uma única linha, editável só por admin.
-- ---------------------------------------------------------------------------
create table public.configuracoes (
  id boolean primary key default true check (id), -- garante uma linha só
  frete_gratis_acima_centavos integer check (frete_gratis_acima_centavos is null or frete_gratis_acima_centavos > 0),
  retirada_loja_ativa boolean not null default false,
  retirada_loja_endereco text check (char_length(retirada_loja_endereco) <= 200),
  cep_origem text not null check (cep_origem ~ '^[0-9]{8}$'),
  prazo_reserva_minutos integer not null default 30 check (prazo_reserva_minutos between 5 and 180),
  parcelas_max integer not null default 6 check (parcelas_max between 1 and 12),
  parcelas_sem_juros integer not null default 3 check (parcelas_sem_juros between 1 and 12),
  desconto_pix_percent integer not null default 0 check (desconto_pix_percent between 0 and 30),
  atualizado_em timestamptz not null default now(),
  check (parcelas_sem_juros <= parcelas_max)
);

alter table public.configuracoes enable row level security;

-- Nada aqui é segredo: a vitrine precisa ler (frete grátis, Pix, parcelas).
create policy "configuracoes: qualquer pessoa lê"
  on public.configuracoes for select to anon, authenticated using (true);

create policy "configuracoes: só admin altera"
  on public.configuracoes for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

revoke insert, delete on public.configuracoes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tabela de frete fixo por UF: usada quando a API de frete falha ou não está configurada.
-- ---------------------------------------------------------------------------
create table public.frete_tabela (
  uf char(2) primary key check (uf ~ '^[A-Z]{2}$'),
  valor_centavos integer not null check (valor_centavos >= 0),
  prazo_min_dias integer not null check (prazo_min_dias between 1 and 60),
  prazo_max_dias integer not null check (prazo_max_dias between 1 and 60),
  check (prazo_min_dias <= prazo_max_dias)
);

alter table public.frete_tabela enable row level security;

create policy "frete_tabela: qualquer pessoa lê"
  on public.frete_tabela for select to anon, authenticated using (true);

create policy "frete_tabela: só admin altera"
  on public.frete_tabela for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

revoke insert, delete on public.frete_tabela from anon, authenticated;
