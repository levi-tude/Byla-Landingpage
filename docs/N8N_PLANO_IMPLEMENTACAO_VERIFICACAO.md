# Plano de implementacao e verificacao — Export Supabase → Google Sheets (n8n)

Este documento consolida **o que foi pedido**, **o que o repositorio ja fornece**, e um **roteiro de garantia** (implementacao + testes) para a instancia `n8n.espacobyla.online` e o projeto Supabase Byla.

**Escopo acordado**

1. **Fluxo continuo:** cada **INSERT** em `public.transacoes` dispara o n8n e grava **uma linha** na aba **`Movimentações`**, com dados enriquecidos pela view **`v_transacoes_export`**.
2. **Carga inicial (uma vez):** trazer **todo o historico** existente em `v_transacoes_export` para a mesma aba (sem depender de INSERT antigo).
3. **Planilha:** cabecalhos corretos, ID da planilha dedicada, permissao da conta Google usada pelo n8n; opcional layout/listas (scripts no backend).
4. **Variaveis:** workflows usam **`$vars`** (Settings → Variables no n8n), nao `$env`, quando `N8N_BLOCK_ENV_ACCESS_IN_NODE` bloqueia expressoes com variaveis de ambiente.

**Arquivos de referencia no repo**

| Artefato | Caminho |
|----------|---------|
| Webhook INSERT → Sheets | `n8n-workflows/workflow-supabase-webhook-google-sheets-export.json` |
| Carga inicial (manual, uma vez) | `n8n-workflows/workflow-supabase-bulk-export-google-sheets-once.json` |
| SQL view + mapeamento | `scripts/supabase-mapeamento-categoria-e-view-export.sql` |
| Guia original export | `docs/N8N_WEBHOOK_EXPORT_PLANILHA.md` |
| Cabecalhos + layout planilha (API) | `backend/scripts/setupMovimentacoesHeader.ts`, `backend/scripts/setupMovimentacoesProfissional.ts` |
| Status verificado + checklist vivo | `docs/N8N_STATUS_VERIFICACAO.md` |
| Verificacao local (REST + opcional Google) | `npm run verify:export-prereqs` em `backend/` |

---

## Fase A — Supabase (fonte de dados)

| # | Acao | Verificacao (como garantir) |
|---|------|-----------------------------|
| A1 | View `v_transacoes_export` e tabela `mapeamento_pessoa_categoria` aplicadas | SQL: `select * from public.v_transacoes_export limit 1;` sem erro |
| A2 | Tabela `transacoes` recebe INSERTs pelo app/importacao | Inserir teste de desenvolvimento ou usar linha existente |

---

## Fase B — n8n — Variaveis da instancia (`$vars`)

No n8n: **Settings → Variables**. Nomes **exatos** (os workflows usam estes identificadores):

| Variavel | Conteudo |
|----------|----------|
| `SUPABASE_URL` | URL do projeto, **sem** barra no final (ex.: `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave **service_role** (painel Supabase → API), **nao** a anon |
| `GOOGLE_SHEETS_ENTRADA_SAIDA_ID` | ID da planilha (trecho da URL entre `/d/` e `/edit`) |

**Verificacao:** abrir qualquer workflow que use expressao `={{ $vars.SUPABASE_URL }}` e executar **Test step** no node HTTP (ou executar workflow de teste) sem erro "access to env vars denied" nem "undefined".

---

## Fase C — n8n — Workflows importados e nos

| # | Acao | Verificacao |
|---|------|-------------|
| C1 | Importar `workflow-supabase-webhook-google-sheets-export.json` | Dois workflows distintos na lista; nome contem "Supabase INSERT" / "export oficial" |
| C2 | Importar `workflow-supabase-bulk-export-google-sheets-once.json` | Workflow com nome "Carga inicial" / "uma vez" |
| C3 | Credencial **Google Sheets** associada ao nó **Append** em ambos | Sem erro de credencial ao abrir o nó |
| C4 | Nó **Append Movimentações**: modo **Map** = **definir abaixo** / **defineBelow** com 14 colunas mapeadas para `={{ $json.... }}` | JSON do workflow no repo ja traz o mapeamento; se o UI mostrar vazio, reimportar o arquivo do repo |
| C5 | Nó **GET v_transacoes_export** (webhook): metodo **GET** e URL com `v_transacoes_export` | Conferir no painel do nó |
| C6 | Webhook **path** `byla-transacao-export`, workflow **ativo** (somente o de export continuo) | Copiar URL de producao POST para a Fase D |

---

## Fase D — Supabase — Database Webhook

| # | Acao | Verificacao |
|---|------|-------------|
| D1 | **Database → Webhooks** → tabela `transacoes`, evento **INSERT** | So INSERT |
| D2 | URL = URL do webhook do n8n (producao), metodo **POST** | Mesma URL do nó Webhook com workflow ativo |
| D3 | Teste: inserir uma linha nova em `transacoes` | Supabase entrega 2xx; n8n **Executions** mostra run; planilha ganha linha |

---

## Fase E — Google Sheets

| # | Acao | Verificacao |
|---|------|-------------|
| E1 | Aba **`Movimentações`**, linha 1 = cabecalhos do doc (14 colunas) | Comparar com `docs/N8N_WEBHOOK_EXPORT_PLANILHA.md` |
| E2 | Conta/credencial do n8n com permissao de **editor** na planilha | Service account ou OAuth conforme configurado |
| E3 | (Opcional) Script `npm run sheets:movimentacoes-header` / `sheets:movimentacoes-pro` no `backend` | So se quiser recriar cabecalho/layout via API |

---

## Fase F — Ordem de execucao recomendada

1. Concluir **A** e **B**.
2. Importar workflows (**C**) e associar Google Sheets.
3. Rodar **uma vez** o workflow **Carga inicial** (manual trigger) — **apenas uma vez** para nao duplicar linhas.
4. Configurar **D** e ativar o workflow **webhook**.
5. Fazer **teste D3** (INSERT).

---

## Fase G — Verificacao final (checklist curto)

- [ ] `v_transacoes_export` consultavel no Supabase.
- [ ] Tres variaveis `$vars` preenchidas no n8n.
- [ ] Workflow carga inicial executou sem erro e linhas apareceram na planilha (quantidade coerente com `select count(*) from transacoes` ou politica de duplicados aceita).
- [ ] Workflow webhook **ativo**; URL do webhook no Database Webhook do Supabase.
- [ ] INSERT de teste gera **nova** linha e execucao no n8n **verde**.
- [ ] Colunas na planilha batem com o append (14 campos); `sincronizado_em` preenchido pelo n8n.

---

## Problemas conhecidos

| Sintoma | Causa provavel |
|---------|----------------|
| `access to env vars denied` | Uso de `$env` com `N8N_BLOCK_ENV_ACCESS_IN_NODE`; usar **`$vars`** ou desativar o bloqueio (somente se politica de seguranca permitir). |
| HTTP 401/403 no GET Supabase | `SUPABASE_SERVICE_ROLE_KEY` errada ou anon no lugar. |
| Planilha vazia / append falha | Credencial Google; ID planilha; aba `Movimentações` com nome correto; mapeamento vazio no nó Append (reimportar JSON do repo). |
| Linhas duplicadas na carga | Workflow de carga inicial executado mais de uma vez. |

---

## MCP n8n (opcional)

Com o MCP do n8n conectado no Cursor, pode-se **inspecionar** workflows e execucoes sem usar so a UI. O plano acima continua valido: o MCP ajuda a **verificar** itens C/D, nao substitui a configuracao do Supabase nem das variaveis.

---

## Historico deste documento

- Criado para alinhar implementacao e testes do export oficial Supabase → Sheets apos ajustes de `$vars` e workflows no repositorio.
