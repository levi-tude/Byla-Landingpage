# Status de verificacao — n8n export Supabase → Google Sheets

Ultima atualizacao: **2026-03-27** (assistencia no repositorio).

## Verificado remotamente (Supabase MCP / SQL)

| Item | Status | Detalhe |
|------|--------|---------|
| View `public.v_transacoes_export` | OK | Existe e e consultavel |
| Tabela `public.transacoes` | OK | **282** linhas (referencia) |
| Tabela `public.mapeamento_pessoa_categoria` | OK | **4** linhas seed/regras |

## Verificado no repositorio (JSON / scripts)

| Item | Status |
|------|--------|
| `workflow-supabase-webhook-google-sheets-export.json` | OK — node **Supabase** (`get` na view), Append com 14 colunas — **sem** `$vars` |
| `workflow-supabase-bulk-export-google-sheets-once.json` | OK — node **Supabase** (`getAll` na view) — **sem** `$vars` |
| `backend/scripts/verifyN8nExportPrereqs.ts` | Novo — rode `npm run verify:export-prereqs` no backend |
| `backend/scripts/n8nListWorkflowsApi.ts` | Opcional — `npm run n8n:list-workflows` com `N8N_BASE_URL` + `N8N_API_KEY` |

## MCP n8n (Cursor) — verificacao tecnica

Chamadas ao servidor **user-n8n-espacobyla** (ferramentas `search_workflows`, `get_workflow_details`):

| Resultado | Significado |
|-----------|-------------|
| `search_workflows` (sem filtro) retornou **0** workflows | O MCP nao listou nada nesta sessao: pode ser escopo do token MCP, filtro de projeto no n8n 2.x, ou workflows em outro contexto. |
| `get_workflow_details` com ID de export antigo do arquivo JSON | **Workflow not found** — IDs no servidor sao **outros** que os do JSON exportado localmente. |

**Limitacao do MCP:** so existem ferramentas **search**, **get_workflow_details** e **execute_workflow**. **Nao ha** tool para **criar/atualizar** workflow pelo MCP. Ajustes de nos continuam por **import do JSON** no n8n ou pela **Public API** (PUT `/api/v1/workflows/:id`), com a nota de que a API pode ter limitacoes em nos **Code** em algumas versoes.

**Alteracoes necessarias (fonte de verdade = repo):** reimportar os dois arquivos em `n8n-workflows/` ou alinhar manualmente na UI. Nao foi possivel aplicar patch remoto apenas pelo MCP.

## Nao verificavel daqui (sua instancia n8n + Google)

Confirme na UI / credenciais:

| Item | O que conferir |
|------|----------------|
| Credencial **Supabase** (`supabaseApi`) | Mesma dos fluxos Planilha/PagBank — host + **service_role** (nao precisa de Variables) |
| Workflows importados | Mesmos nomes/conteudo do repo; n8n **2.4.8** |
| Webhook ativo | Workflow export oficial **Active** |
| URL webhook no Supabase | Database → Webhooks → `transacoes` → INSERT → POST para URL do n8n |
| Google Sheets | Credencial OAuth no n8n; planilha com aba **Movimentações** |
| Carga inicial | Se a planilha ja tem ~282 linhas de dados, **nao** rode de novo o workflow de lote |

## Credencial Supabase (sem Variables)

Nos JSON atuais, **ID da planilha Google** esta **fixo** no node Append. O GET na view usa o node **Supabase** com credencial **`supabaseApi`** (igual a `workflow-planilha-para-supabase.json`). **Nao** e necessario **Variables** (`$vars`) nem licenca para esse recurso.

Se o GET falhar com 401, confira se a credencial Supabase tem o **service_role** correto (Project Settings → API).

## Erro: `URL parameter must be a string, got undefined`

**Causa:** expressao da URL usava `$vars.SUPABASE_URL` e essa variavel **nao existia** no n8n.

**Correcao:** reimporte o JSON **atual** do repo e associe a credencial **Supabase** no node (host + service role).

## Erro: `access to env vars denied` (`$env`)

**Causa:** `N8N_BLOCK_ENV_ACCESS_IN_NODE` ativo bloqueia **`$env`**.

**Correcao:** nao use `$env` nos nos; use o JSON do repo com credencial **Supabase** nos nodes ou defina `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` no servidor.

## Proximo passo

1. Na pasta `backend`: `npm run verify:export-prereqs` (valida `.env` local + REST + opcional Google).
2. No n8n: checklist da secao acima.
3. Teste: um INSERT em `transacoes` e ver execucao + linha na planilha.
