# Export oficial: Supabase → Google Sheets (webhook n8n)

Fluxo: **INSERT em `public.transacoes`** → **Database Webhook (Supabase)** → **n8n** → **linha na aba `Movimentações`**.

A categoria exibida vem da view **`v_transacoes_export`** (mapeamento manual + regras + cadastro de mensalidades).

---

## 1. Banco de dados (Supabase)

1. Abra **SQL Editor** no projeto Supabase.
2. Execute o arquivo:

   `scripts/supabase-mapeamento-categoria-e-view-export.sql`

3. Confirme que existem:
   - tabela `public.mapeamento_pessoa_categoria`
   - view `public.v_transacoes_export`

4. Ajuste ou inclua linhas em `mapeamento_pessoa_categoria` (coluna `pessoa_normalizada` deve ser o resultado de “nome minúsculo, trim, espaços únicos” — igual ao que a função `byla_norm_pessoa` faz no banco). Ex.: se no extrato aparece “ORVILLE NETO”, use `orville neto`.

---

## 2. Planilha Google

1. Crie uma planilha (ex.: **“BYLA – Entradas e saídas OFICIAL”**).
2. Aba **`Movimentações`** — na **linha 1**, cole estes cabeçalhos (ordem exata; nomes devem bater com o workflow):

   `id` | `data` | `tipo` | `valor` | `pessoa` | `descricao` | `categoria_sugerida` | `subcategoria_sugerida` | `modalidade` | `nome_aluno` | `plano_produto` | `origem_categoria` | `id_unico` | `sincronizado_em`

   - **modalidade** / **nome_aluno** / **plano_produto**: preenchidos quando a entrada for **mensalidade** com match no cadastro (`aluno_planos` + atividades/alunos). Caso contrário ficam vazios.

3. (Opcional) Aba **`Listas`** — para validação de dados (dropdown) nas colunas de categoria manual futura. Listas sugeridas:

   **Entradas:** Mensalidade; Matrícula / taxa; Aluguel / Locação (externo); Coworking; Repasse / recebimento diverso; Outros; A classificar.

   **Saídas:** Pagamentos (fornecedores); Folha / pessoal; Impostos / taxas bancárias; Repasse / compensação; Pagamentos gerais; Outros; A classificar.

4. Copie o **ID da planilha** da URL (`/d/ESTE_ID/edit`) e substitua no node **Append Movimentações** do workflow n8n.

5. Conecte a credencial **Google Sheets OAuth2** no n8n e garanta que a conta tem permissão de edição na planilha.

---

## 3. Autenticação Supabase no n8n (sem “Variables” paga)

Os workflows **`workflow-supabase-webhook-google-sheets-export.json`** e **`workflow-supabase-bulk-export-google-sheets-once.json`** usam o node **Supabase** (operações **Get** / **Get many**) na view `v_transacoes_export`, com a mesma credencial **`supabaseApi`** dos outros fluxos (ex.: planilha → Supabase). **Não** é necessário usar **Variables** (`$vars`) nem colocar a `service_role` em expressões HTTP.

1. n8n → **Credentials** → **Supabase** (ou reutilize **Supabase account** já usada em outro workflow BYLA).
2. **Host:** URL do projeto (`https://xxxx.supabase.co`).
3. **Service role:** chave **service_role** (Supabase → Project Settings → API). **Não** use a chave `anon` aqui se precisar do mesmo acesso que o backend.

**Não** commite a service role no repositório.

### Variáveis de ambiente no host do n8n (export → backend)

O node **HTTP POST montar-linhas** envia o header **`X-Byla-Sync-Secret`** a partir de **`$env.BYLA_SYNC_SECRET`**. Essa variável **tem** que existir no processo do n8n (Docker Compose, n8n Cloud, systemd), com o **mesmo** valor de `BYLA_SYNC_SECRET` no Render / `backend/.env`.

A **URL** do backend nos JSON do repositório já usa por padrão **`https://byla-backend.onrender.com`** se `BYLA_BACKEND_URL` não estiver definida. Para outro host, defina `BYLA_BACKEND_URL` no servidor n8n (sem `/` no fim).

Roteiro detalhado: `n8n-workflows/HOST_ENV_BYLA.md`. Teste local do endpoint: `npm run n8n:verify-montar-linhas` (pasta `backend`).

### Variáveis de ambiente no host (opcional)

Se você ainda usa outros fluxos ou scripts que leem env no servidor n8n, pode manter no Docker / `.env` do host:

| Variável | Uso |
|----------|-----|
| `SUPABASE_URL` | Referência / outros processos |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas se algum fluxo **não** use credencial e leia env (os JSON atuais do export **não** exigem isso para o GET na view). |

O **ID da planilha** no JSON do export está **fixo** no node Append; altere na UI se usar outra planilha.

---

## 4. Importar o workflow

1. n8n → **Import from File**.
2. Arquivo: `n8n-workflows/workflow-supabase-webhook-google-sheets-export.json`.
3. Confira o **Document ID** no node **Append Movimentações** (ID fixo no JSON; ajuste se for outra planilha). Se o ID for o mesmo de outra planilha (ex. Controle de Caixa), crie só a aba **`Movimentações`** nesse arquivo para não misturar com outras abas.
4. Associe as credenciais **Supabase** e **Google Sheets** aos nodes indicados.
5. Ative o workflow (**Active**).

6. Copie a **URL do Webhook** (POST) do node **Webhook Supabase** — algo como:

   `https://SEU-N8N/webhook/byla-transacao-export`

---

## 5. Database Webhook no Supabase

1. Supabase → **Database** → **Webhooks** → **Create a new hook**.
2. **Table:** `transacoes`
3. **Events:** INSERT (apenas).
4. **Type of webhook:** Supabase Edge Function **ou** **HTTP Request** (conforme disponível na sua versão).

   - Se for **HTTP Request** para URL externa: cole a URL do n8n acima.
   - Método: **POST**.
   - Headers: se o n8n exigir, adicione um segredo (ex.: `X-N8N-SECRET`) e valide depois com um node IF no n8n (opcional).

5. Payload padrão costuma incluir `type`, `table`, `record`, `schema`. O workflow valida `type === 'INSERT'` e `table === 'transacoes'`.

Documentação Supabase: [Database Webhooks](https://supabase.com/docs/guides/database/webhooks).

---

## 6. Teste manual

1. Insira uma linha de teste em `transacoes` (SQL ou painel).
2. Verifique a execução no n8n (sucesso / erro).
3. Confira se a linha apareceu na aba **Movimentações**.

Se o webhook não for INSERT de `transacoes`, o n8n responde `200` com `{ ok: true, skipped: true }` para evitar retries desnecessários (ajuste se quiser outro comportamento).

---

## 7. Duplicatas

Se o mesmo INSERT disparar duas vezes (rede, retry), pode haver linha duplicada na planilha. Mitigações futuras:

- Coluna `id` na planilha e rotina de “só append se id não existir” (lookup no Google Sheets ou tabela auxiliar).
- Ou usar **Google Sheets → Update** com chave `id` (mais lento).

Versão atual: **append simples**; tratar deduplicação quando necessário.

---

## 8. Regras de categoria (resumo)

| Origem | Significado |
|--------|-------------|
| `mapeamento_manual` | Tabela `mapeamento_pessoa_categoria` |
| `regra_aluguel_externo` | Nome/descrição EA / BLEAD (alinhado às regras do backend) |
| `regra_repasse_samuel` | Saída com pessoa começando com `samuel` |
| `cadastro_mensalidade` | Match com `aluno_planos` + valor/data/pagador |
| `fallback` | Cai em **A classificar** |

---

## 9. Dependências no Postgres

A view usa `aluno_planos`, `planos`, `atividades`, `alunos`. Se o seu projeto ainda não tiver essas tabelas, o `CREATE VIEW` falha — execute antes o schema de cadastros em `scripts/supabase-schema-cadastros.sql` (ou equivalente no seu ambiente).
