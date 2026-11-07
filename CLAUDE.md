# CLAUDE.md — Regras de segurança do projeto (loja de roupas e calçados)

Estas regras valem para TODO código gerado neste projeto. Se um pedido meu entrar em conflito com elas, avise antes de fazer e explique o risco em linguagem simples.

@AGENTS.md

## 1. Segredos e variáveis de ambiente

- NUNCA colocar chaves secretas, senhas, tokens ou URLs privadas no código nem no frontend.
- Chaves secretas (gateway de pagamento, service role do banco, webhook secret) ficam SÓ no servidor, em variáveis de ambiente.
- Só chaves públicas (anon/publishable) podem ir para o frontend.
- Manter `.env` e `.env.local` no `.gitignore` desde o primeiro commit. Criar um `.env.example` com nomes de variáveis, sem valores.
- Se algum segredo aparecer em código ou histórico do git, avisar na hora e orientar a gerar uma nova chave.

## 2. Banco de dados

- Ativar RLS (Row Level Security) ou regras equivalentes em TODAS as tabelas. Nenhuma tabela pode ficar aberta.
- Regras mínimas:
  - `produtos`: qualquer pessoa lê; só admin cria, altera e apaga.
  - `pedidos`, `itens_pedido`, `enderecos`: cada cliente lê e altera só os seus.
  - `estoque`: só o servidor altera.
  - `usuarios`/`perfis`: o usuário vê e edita só o próprio perfil; campo de papel (role) NUNCA editável pelo usuário.
- Usar consultas parametrizadas ou ORM. Proibido montar SQL concatenando texto do usuário.
- Backups automáticos ativados. Ambiente de teste separado do de produção.
- Sempre que criar ou alterar tabela, mostrar as políticas de acesso e explicar linha por linha.

## 3. Autenticação e permissões

- Usar serviço de autenticação pronto (Supabase Auth, Clerk, Firebase Auth ou similar). NÃO criar login, hash de senha ou sessão do zero.
- Toda rota e ação de API deve verificar, NO SERVIDOR: (a) se há usuário logado e (b) se ele tem permissão para aquele recurso.
- Esconder botão na tela NÃO é proteção. Painel admin exige checagem de papel no servidor em cada ação.
- Impedir acesso a dados de outro usuário trocando ID na URL ou no corpo da requisição (IDOR). Sempre filtrar pelo usuário autenticado.
- Papéis: `cliente` e `admin`. Papel é definido apenas no servidor/banco, nunca vindo do cliente.

## 4. Pagamentos

- Usar checkout hospedado do gateway (Mercado Pago, Stripe, Pagar.me ou Asaas). NUNCA receber, trafegar ou guardar número de cartão, CVV ou validade.
- O frontend envia apenas IDs de produto, variação (tamanho/cor) e quantidade. O SERVIDOR busca o preço no banco e calcula total, frete e desconto. Nunca confiar em preço, total ou desconto vindos do navegador.
- Marcar pedido como pago SOMENTE após webhook do gateway, validando a assinatura. A página de "obrigado" não confirma pagamento.
- Webhooks devem ser idempotentes (processar o mesmo evento duas vezes não pode duplicar pedido ou baixa de estoque).
- Guardar no banco apenas: ID da transação, status, valor e método. Nunca dados sensíveis de cartão.

## 5. Específico de loja

- Estoque: descontar de forma atômica no servidor (transação ou função no banco) para evitar vender o mesmo item duas vezes. Controlar estoque por variação (tamanho/cor).
- Cupons: validar no servidor, com limite de uso, validade e valor mínimo. Nunca no frontend.
- Frete: calcular no servidor.
- Upload de imagens: só admin; permitir apenas jpg, png e webp; limitar tamanho; gerar nome de arquivo aleatório; usar storage dedicado (nunca salvar no servidor da aplicação).
- Rate limiting em: login, cadastro, recuperação de senha, checkout e aplicação de cupom.
- Evitar enumeração de usuários: mensagens de erro de login e recuperação de senha devem ser genéricas.

## 6. Proteção contra ataques web

- HTTPS obrigatório em produção.
- XSS: nunca inserir texto de usuário como HTML cru. Evitar `dangerouslySetInnerHTML`/`innerHTML`; se for inevitável, sanitizar.
- Validar TODA entrada no servidor (tipo, tamanho, formato), usando biblioteca de schema (ex.: Zod). Validação só no formulário não conta.
- CSRF: usar cookies `HttpOnly`, `Secure` e `SameSite`, ou token anti-CSRF nas ações que alteram dados.
- Configurar cabeçalhos de segurança (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- CORS restrito ao domínio da loja. Proibido `*` em rotas com dados de usuário.
- Erros para o cliente devem ser genéricos. Detalhes técnicos e stack trace ficam só nos logs do servidor.
- Nunca logar senhas, tokens, CPF completo ou dados de pagamento.

## 7. Dependências e manutenção

- Rodar `npm audit` antes de cada deploy e informar vulnerabilidades encontradas.
- Antes de adicionar um pacote novo, verificar se é popular, mantido e realmente necessário. Preferir menos dependências.
- Manter lockfile versionado.
- 2FA ativado em GitHub, hospedagem, banco e gateway de pagamento.

## 8. LGPD (dados pessoais)

- Coletar só o necessário. CPF apenas se o gateway ou a nota fiscal exigir.
- Incluir: política de privacidade, termos de uso e consentimento claro no cadastro.
- Implementar forma de o cliente exportar e pedir exclusão dos próprios dados.
- Dados pessoais (CPF, endereço, telefone) nunca aparecem em URLs, logs ou mensagens de erro.
- Definir prazo de retenção de dados de pedidos conforme obrigação fiscal.

## 9. Como trabalhar comigo

- Antes de implementar qualquer coisa que envolva login, pagamento, banco ou upload, explique em 3 a 5 linhas simples o que vai fazer e quais riscos existem.
- Ao terminar cada funcionalidade, liste: quais rotas exigem login, qual papel é necessário e quais políticas de banco se aplicam.
- Não pular etapas de segurança para "fazer funcionar mais rápido". Se algo estiver temporariamente inseguro, marque com `// TODO-SEGURANÇA:` e me avise.
- Quando eu pedir, rodar uma auditoria completa: chaves expostas, preços vindos do cliente, rotas sem verificação de permissão, tabelas sem RLS, uploads sem validação, falta de rate limit.
- Escrever testes que tentam quebrar as regras: ler pedido de outro usuário, alterar preço, criar produto sem ser admin, reutilizar cupom além do limite, repetir webhook.

## 10. Checklist antes de publicar

- [ ] Nenhum segredo no código ou no histórico do git
- [ ] RLS ativo em todas as tabelas, testado com usuário comum
- [ ] Preço e total calculados só no servidor
- [ ] Pedido pago apenas via webhook verificado
- [ ] Rotas admin protegidas no servidor
- [ ] Rate limit em login e checkout
- [ ] Upload validado
- [ ] HTTPS, cabeçalhos de segurança e CORS configurados
- [ ] `npm audit` sem vulnerabilidades críticas
- [ ] 2FA em todas as contas importantes
- [ ] Política de privacidade e termos publicados
- [ ] Backup do banco testado (restaurar de verdade)
