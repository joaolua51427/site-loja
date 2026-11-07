-- Dados de exemplo (gerado a partir de data/*.json). Só para o ambiente de TESTE.
-- Preços de exemplo: substituir pelos reais.
begin;
delete from public.produtos;
delete from public.marcas;
insert into public.marcas (id, nome, slug, descricao, logo, estilo) values
  ('4fea5915-d0ea-4c3b-9802-5d5c3c0a8bb8', 'Birkenstock', 'birkenstock', 'Sandálias com palmilha anatômica de cortiça e couro.', null, 'caixa-alta'),
  ('eb230eaa-6174-4cf8-a8bf-1a53d015a44c', 'Hermès', 'hermes', 'Sandálias de couro com a tira em H e acabamento artesanal.', null, 'caixa-alta'),
  ('63d563dd-675a-43e3-8e45-90668400cb5b', 'Ralph Lauren', 'ralph-lauren', 'Polos e tricôs clássicos do guarda-roupa masculino.', null, 'serifa'),
  ('2ff978d3-5c7e-424d-9a1f-880de1cb2803', 'Gucci', 'gucci', 'Tênis de couro e básicos com assinatura italiana.', null, 'serifa'),
  ('91b498d4-62dd-457f-9e8f-939cd2bb1b18', 'Moncler', 'moncler', 'Jaquetas acolchoadas e peças para o frio.', null, 'caixa-alta'),
  ('ddf75b5b-8bfe-429c-b0ab-820348a84c29', 'Saint Laurent', 'saint-laurent', 'Tênis de couro branco com a assinatura bordada.', null, 'caixa-alta'),
  ('d39bfdb9-dcee-4261-80a6-99149b10ea4a', 'Zegna', 'zegna', 'Tênis Triple Stitch em camurça e couro.', null, 'caixa-alta');
insert into public.produtos (id, marca_id, slug, nome, categoria, tipo, preco_centavos, tamanhos, cores, descricao, detalhes, imagem_frente, imagem_costas, imagem_lado) values
  ('270c0198-c3f4-40df-a237-5cd36fe95b10', '4fea5915-d0ea-4c3b-9802-5d5c3c0a8bb8', 'arizona-couro-preto', 'Sandália Arizona', 'calcado', 'sandalia', 89990, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Preto", "hex": "#1F1F1F"}]'::jsonb, 'Duas tiras de couro com fivelas ajustáveis e palmilha de cortiça.', array['Couro','Palmilha de cortiça','Fivelas ajustáveis']::text[], '/produtos/arizona-couro-preto-frente.png', '/produtos/arizona-couro-preto-costas.png', null),
  ('d02690fe-bc64-4bb4-ab19-22387776e0a3', '4fea5915-d0ea-4c3b-9802-5d5c3c0a8bb8', 'arizona-camurca-taupe', 'Sandália Arizona camurça', 'calcado', 'sandalia', 94990, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Taupe", "hex": "#8C7B6A"}]'::jsonb, 'Camurça macia em tom taupe, a mesma forma clássica de duas tiras.', array['Camurça','Palmilha de cortiça','Solado de EVA']::text[], '/produtos/arizona-camurca-taupe-frente.png', '/produtos/arizona-camurca-taupe-costas.png', null),
  ('32a3896b-12d7-43e2-8d87-7a1668509c48', 'eb230eaa-6174-4cf8-a8bf-1a53d015a44c', 'sandalia-izmir', 'Sandália Izmir', 'calcado', 'sandalia', 699000, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Preto", "hex": "#1E1E1E"}, {"nome": "Etoupe", "hex": "#8A7F72"}]'::jsonb, 'Sandália de couro com a tira recortada em H.', array['Couro de bezerro','Palmilha de couro','Solado de borracha']::text[], '/produtos/sandalia-izmir-frente.png', '/produtos/sandalia-izmir-costas.png', null),
  ('4c7e3792-7b9f-4893-a0c8-6127fe553eed', 'eb230eaa-6174-4cf8-a8bf-1a53d015a44c', 'sandalia-chypre', 'Sandália Chypre', 'calcado', 'sandalia', 849000, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Azul-marinho", "hex": "#22324F"}]'::jsonb, 'Tiras com velcro e solado anatômico de borracha.', array['Couro de bezerro','Fecho em velcro','Solado anatômico']::text[], '/produtos/sandalia-chypre-frente.png', '/produtos/sandalia-chypre-costas.png', null),
  ('c141aa2c-d495-412f-8b4d-a9568dbaea8c', '63d563dd-675a-43e3-8e45-90668400cb5b', 'polo-pique-marinho', 'Camisa polo piquê', 'roupa', 'camiseta', 79990, array['P','M','G','GG']::text[], '[{"nome": "Marinho", "hex": "#1F2A44"}, {"nome": "Branco", "hex": "#F4F4F2"}]'::jsonb, 'Polo de algodão piquê com corte clássico.', array['Algodão piquê','Corte clássico','Dois botões']::text[], '/produtos/polo-pique-marinho-frente.png', '/produtos/polo-pique-marinho-costas.png', null),
  ('e7aaabb0-7bd2-4061-998f-e9fd0d6950cd', '63d563dd-675a-43e3-8e45-90668400cb5b', 'trico-cabos-creme', 'Suéter de tricô com tranças', 'roupa', 'malha', 149990, array['P','M','G','GG']::text[], '[{"nome": "Creme", "hex": "#E8E0CF"}]'::jsonb, 'Tricô de algodão com tranças e punhos canelados.', array['Algodão','Tranças','Gola careca']::text[], '/produtos/trico-cabos-creme-frente.png', '/produtos/trico-cabos-creme-costas.png', null),
  ('0aca81ca-e45d-47a3-93c5-581511fb2118', '2ff978d3-5c7e-424d-9a1f-880de1cb2803', 'tenis-ace-branco', 'Tênis Ace', 'calcado', 'tenis', 599000, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Branco", "hex": "#F3F2EE"}]'::jsonb, 'Tênis de couro branco com detalhe listrado na lateral.', array['Couro','Sola de borracha','Detalhe listrado']::text[], '/produtos/tenis-ace-branco-frente.png', '/produtos/tenis-ace-branco-costas.png', null),
  ('75c3a800-2af5-451b-828e-194fc86a6d48', '2ff978d3-5c7e-424d-9a1f-880de1cb2803', 'camiseta-algodao-preta', 'Camiseta de algodão', 'roupa', 'camiseta', 329000, array['P','M','G','GG']::text[], '[{"nome": "Preto", "hex": "#161616"}]'::jsonb, 'Camiseta de malha de algodão com caimento solto.', array['Algodão','Caimento solto','Gola careca']::text[], '/produtos/camiseta-algodao-preta-frente.png', '/produtos/camiseta-algodao-preta-costas.png', null),
  ('5b347236-7490-458d-94ee-4e8578fe675d', '91b498d4-62dd-457f-9e8f-939cd2bb1b18', 'jaqueta-acolchoada-preta', 'Jaqueta acolchoada', 'roupa', 'jaqueta', 999000, array['P','M','G','GG']::text[], '[{"nome": "Preto", "hex": "#141414"}, {"nome": "Azul-marinho", "hex": "#1E2A44"}]'::jsonb, 'Jaqueta com enchimento de pluma e capuz removível.', array['Enchimento de pluma','Capuz removível','Repele água']::text[], '/produtos/jaqueta-acolchoada-preta-frente.png', '/produtos/jaqueta-acolchoada-preta-costas.png', null),
  ('6ffa9a32-cb19-4ef9-861c-f38a0df9b77c', '91b498d4-62dd-457f-9e8f-939cd2bb1b18', 'moletom-capuz-cinza', 'Moletom com capuz', 'roupa', 'moletom', 429000, array['P','M','G','GG']::text[], '[{"nome": "Cinza", "hex": "#9EA2A8"}]'::jsonb, 'Moletom de algodão felpado com capuz e bolso canguru.', array['Algodão felpado','Bolso canguru','Punhos canelados']::text[], '/produtos/moletom-capuz-cinza-frente.png', '/produtos/moletom-capuz-cinza-costas.png', null),
  ('78536c43-a2ce-4fcd-8b9f-9423268b9b61', 'ddf75b5b-8bfe-429c-b0ab-820348a84c29', 'tenis-court-classic', 'Tênis Court Classic', 'calcado', 'tenis', 459000, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Branco", "hex": "#F2F1EC"}]'::jsonb, 'Couro branco com a assinatura bordada na lateral.', array['Couro','Assinatura bordada','Sola de borracha']::text[], '/produtos/tenis-court-classic-frente.png', '/produtos/tenis-court-classic-costas.png', null),
  ('c5e98106-1dc2-4087-a5b3-927808d93e08', 'd39bfdb9-dcee-4261-80a6-99149b10ea4a', 'triple-stitch-camurca-marinho', 'Tênis Triple Stitch camurça', 'calcado', 'tenis', 549000, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Azul-marinho", "hex": "#253250"}]'::jsonb, 'Camurça azul-marinho com elásticos cruzados, sem cadarço.', array['Camurça','Elásticos cruzados','Calçar fácil']::text[], '/produtos/triple-stitch-camurca-marinho-frente.png', '/produtos/triple-stitch-camurca-marinho-costas.png', null),
  ('db219f43-47c1-4d4c-bde6-c84ce23aef28', 'd39bfdb9-dcee-4261-80a6-99149b10ea4a', 'triple-stitch-couro-branco', 'Tênis Triple Stitch couro', 'calcado', 'tenis', 549000, array['38','39','40','41','42','43','44']::text[], '[{"nome": "Off-white", "hex": "#EEEAE0"}]'::jsonb, 'Couro off-white com elásticos cruzados e sola de borracha.', array['Couro','Elásticos cruzados','Sola de borracha']::text[], '/produtos/triple-stitch-couro-branco-frente.png', '/produtos/triple-stitch-couro-branco-costas.png', null);
commit;

-- Variações (tamanho × cor) com estoque de teste. Uma variação com 1 unidade para o teste de compra concorrente.
insert into public.variacoes (produto_id, tamanho, cor, sku, estoque)
select p.id, t.tamanho, c.cor->>'nome',
       upper(left(p.slug, 24)) || '-' || t.tamanho || '-' || upper(left(regexp_replace(c.cor->>'nome', '[^A-Za-z]', '', 'g'), 6)),
       (abs(hashtext(p.slug || t.tamanho || (c.cor->>'nome'))) % 6)
from public.produtos p
cross join lateral unnest(p.tamanhos) as t(tamanho)
cross join lateral jsonb_array_elements(p.cores) as c(cor)
on conflict (produto_id, tamanho, cor) do nothing;
update public.variacoes v set estoque = 1 from public.produtos p
where v.produto_id = p.id and p.slug = 'triple-stitch-camurca-marinho' and v.tamanho = '42';

-- Configurações e frete (ambiente de TESTE). CEP de origem provisório: trocar pelo da loja.
insert into public.configuracoes (frete_gratis_acima_centavos, retirada_loja_ativa, retirada_loja_endereco, cep_origem, prazo_reserva_minutos, parcelas_max, parcelas_sem_juros, desconto_pix_percent)
values (29900, false, null, '01310100', 30, 6, 3, 5) on conflict (id) do nothing;
insert into public.frete_tabela (uf, valor_centavos, prazo_min_dias, prazo_max_dias) values
  ('SP',1990,2,4),('RJ',2490,3,5),('MG',2490,3,6),('ES',2790,4,7),('PR',2690,3,6),('SC',2790,4,7),('RS',2990,4,8),
  ('DF',3290,4,8),('GO',3290,4,8),('MT',3690,5,10),('MS',3490,5,9),('BA',3490,5,10),('PE',3690,6,11),('CE',3790,6,12),
  ('RN',3790,6,12),('PB',3790,6,12),('AL',3690,6,11),('SE',3690,6,11),('MA',3990,7,13),('PI',3990,7,13),('PA',4290,7,14),
  ('AM',4790,8,16),('AP',4790,8,16),('RR',4790,8,16),('AC',4790,8,16),('RO',4490,7,14),('TO',3990,6,12)
on conflict (uf) do nothing;
update public.produtos set
  peso_gramas = case tipo when 'tenis' then 1200 when 'bota' then 1600 when 'sandalia' then 900 when 'camiseta' then 300 when 'malha' then 550 when 'moletom' then 850 when 'jaqueta' then 1100 when 'casaco' then 1600 else 800 end,
  altura_cm = case when categoria = 'calcado' then 13 else 6 end,
  largura_cm = case when categoria = 'calcado' then 21 else 26 end,
  comprimento_cm = case when categoria = 'calcado' then 33 else 32 end;
