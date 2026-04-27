# Status do projeto (simples)

Checklist visual para acompanhar o avanço sem termos técnicos complexos.

## Segurança e acesso

- [x] Login com perfis `admin` e `secretaria`.
- [x] Backend protegendo rotas por perfil.
- [x] Perfis salvos em `public.profiles` no Supabase.
- [x] RLS aplicado em tabelas sensíveis (financeiro e cadastro).
- [x] Frontend enviando token para backend nas chamadas protegidas.
- [x] Endpoints de debug restritos para admin.
- [x] Hardening de views (sem `anon`, com `security_invoker` no script de segurança).

## Migração da operação para o sistema

- [x] Cadastro (alunos/modalidades/pendências) com Supabase como fonte principal (fallback planilha).
- [x] Fluxo/CONTROLE com adaptador Supabase-primeiro (fallback planilha).
- [~] Popular a nova estrutura `controle_caixa_*` com dados reais (mês 03/2026 já migrado e validado).
- [x] Criado schema operacional da planilha FLUXO (`fluxo_alunos_operacionais` + `fluxo_pagamentos_operacionais`).
- [x] Criado script de migração automática da planilha FLUXO por ano.
- [x] Criado script de validação planilha x banco para auditoria da migração.
- [x] FLUXO 2026 migrado com paridade validada (`606` alunos e `236` pagamentos, `delta = 0`).
- [x] Alias legado aplicado: `PILATES MARINA` é tratado como `PILATES` na migração/validação.
- [~] Fluxo da secretária no app: CRUD inicial de alunos/modalidades e pagamentos em `/fluxo-caixa` (baseado em `fluxo_alunos_operacionais` e `fluxo_pagamentos_operacionais`).
- [x] Travas de segurança no `/fluxo-caixa`: exclusão de aluno com bloqueio quando há pagamentos vinculados (e opção de exclusão forçada com confirmação).
- [x] Histórico de alterações do fluxo operacional (alunos/pagamentos) salvo em `fluxo_operacional_auditoria` e exibido na tela.
- [~] Criar telas de edição do CONTROLE direto no sistema (função do perfil administrativo; primeira versão CRUD já disponível em `/controle-caixa`).
- [ ] Tirar dependência da planilha no dia a dia da secretária.

## Operação e corte final

- [ ] Definir “dia da virada” (planilha congelada para operação).
- [ ] Rodar validação final admin vs secretária em produção.
- [ ] Documentar rotina de novos usuários e papéis.

## Próximo foco recomendado

1. Definir e executar o “dia da virada” para congelar planilha e operar no sistema.
2. Rodar validação final em produção para os dois perfis (admin/secretária).
3. Documentar rotina de criação de usuário e definição de papel.
4. Continuar evolução do `/controle-caixa` (UX e regras operacionais do administrativo).
