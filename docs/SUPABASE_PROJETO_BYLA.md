# Projeto Supabase – Byla (visão geral)

Documento que descreve **o que foi feito e está documentado** no repositório sobre o uso do Supabase no controle financeiro e cadastros do Espaço Byla.

---

## Projeto e URL

- **URL do projeto:** `https://flbimmwxxsvixhghmmfu.supabase.co`
- **Uso:** Banco Postgres para transações (Pluggy), cadastros de atividades, planos, alunos e vínculos.

---

## 1. Tabela `transacoes` (documentada no repo)

Usada pelo workflow **Pluggy → n8n → Supabase**: o n8n grava aqui as transações bancárias (entrada/saída) vindas da Pluggy, com deduplicação por `id_unico`.

### Schema (conforme `n8n-workflows/SUPABASE_TABELA_TRANSACOES.md`)

```sql
create table public.transacoes (
  id uuid not null default gen_random_uuid(),
  data date not null,
  pessoa text not null,
  valor numeric(12, 2) not null,
  descricao text null,
  tipo text not null,
  created_at timestamp without time zone null default now(),
  id_unico text null,
  mes text null,
  ano integer null,
  constraint transacoes_pkey primary key (id),
  constraint transacoes_id_unico_key unique (id_unico),
  constraint transacoes_tipo_check check (tipo in ('entrada', 'saida'))
);
```

### Colunas preenchidas pelo n8n (Create a row)

| Coluna na tabela | Valor no n8n | Observação |
|------------------|--------------|------------|
| `data` | `{{ $json.data }}` | YYYY-MM-DD |
| `pessoa` | `{{ $json.pessoa ?? '' }}` | Nome (ex.: da descrição Pluggy) |
| `valor` | `{{ $json.valor }}` | Valor absoluto |
| `descricao` | `{{ $json.descricao }}` | Método de pagamento (ex.: PIX) |
| `tipo` | `{{ $json.tipo ?? 'saida' }}` | `entrada` ou `saida` |
| `id_unico` | `{{ $json.id_unico }}` | UNIQUE – evita duplicatas |

`id` e `created_at` vêm do default; `mes` e `ano` ficam null (podem ser preenchidos depois por trigger ou outro processo).

### Uso no n8n

- **Get many rows** (Supabase): tabela `transacoes`, operação “get all” – para pegar última data e lista de `id_unico` (deduplicação).
- **Create a row** (Supabase): tabela `transacoes` – insere só transações novas após o Code (filtrar duplicatas).

### Uso na planilha

- **Apps Script** (`docs/planilha-byla-apps-script.js`): lê `transacoes` via REST (`/rest/v1/transacoes?order=data.desc`) e preenche a primeira aba da planilha.
- **SUPABASE_URL** no script: `https://flbimmwxxsvixhghmmfu.supabase.co`.

---

## 2. Tabelas de cadastro (atividades, planos, alunos, aluno_planos)

No planejamento (**BYLA_ANALISE_E_PLANO.md** e **proximos-passos-planejamento.md**), a Fase 1 prevê:

- **atividades** – ex.: Pilates, Dança, etc.
- **planos** – nome do plano, valor, atividade
- **alunos** – nome, contato, etc.
- **aluno_planos** – vínculo aluno–plano–atividade (quem faz o quê, forma de pagamento)

Foi feita a parte de **Pilates** (dados iniciais nessas tabelas). O repositório **não contém** o DDL (CREATE TABLE) nem os INSERTs dessas tabelas; só a tabela `transacoes` está com schema completo documentado.

### Scripts no repositório (schema + seed)

- **`scripts/supabase-schema-cadastros.sql`** – Cria as tabelas `atividades`, `planos`, `alunos`, `aluno_planos` (e índices) se ainda não existirem.
- **`scripts/seed-modalidades-alunos-byla.sql`** – Seed fev/2025: 8 modalidades, plano “Mensalidade” por atividade, 22 alunos e vínculos (schema com `data`, `nome_pagador`).
- **`scripts/seed-modalidades-alunos-byla-2026.sql`** – Seed fev/2026 alinhado ao DB atual: mesmas modalidades e alunos, colunas `valor`, `data_referencia`, `nome_pagador_pix` em `aluno_planos`; pode ser reexecutado sem duplicar.
- **`scripts/README-SUPABASE-SEED.md`** – Ordem de execução e o que fazer se as tabelas já existirem com outra estrutura.

---

## 3. Resumo do que “é” o projeto Supabase no repo

| Item | Status no repo |
|------|-----------------|
| URL do projeto | Documentada (`flbimmwxxsvixhghmmfu.supabase.co`) |
| Tabela `transacoes` | Schema + mapeamento n8n + uso na planilha documentados |
| Tabelas atividades, planos, alunos, aluno_planos | Citadas no planejamento; Pilates feito no Supabase; **sem DDL/INSERT no repo** |
| Credencial n8n | Nome “Supabase account” usado no workflow (ID não versionado) |
| Planilha | Lê apenas `transacoes` |

---

## 4. Onde está cada coisa no repositório

| Arquivo | Conteúdo |
|---------|----------|
| `n8n-workflows/SUPABASE_TABELA_TRANSACOES.md` | Schema e mapeamento da tabela `transacoes` |
| `n8n-workflows/workflow-pluggy-supabase-corrigido.json` | Workflow que usa Get many rows + Create a row em `transacoes` |
| `docs/planilha-byla-apps-script.js` | Script que lê `transacoes` do Supabase |
| `docs/PLANILHA_GOOGLE_APPS_SCRIPT_PASSO_A_PASSO.md` | Passo a passo da planilha + Supabase |
| `CONTROLE_FINANCEIRO_PLUGGY.md` | Visão geral do fluxo Pluggy → Supabase |
| `BYLA_ANALISE_E_PLANO.md` | Plano de evolução e uso das tabelas de atividade/aluno/plano |
| `scripts/supabase-schema-cadastros.sql` | DDL das tabelas atividades, planos, alunos, aluno_planos |
| `scripts/seed-modalidades-alunos-byla.sql` | INSERTs das modalidades e alunos (fev/2025) |
| `scripts/README-SUPABASE-SEED.md` | Como executar os scripts no Supabase |

---

*Documento gerado a partir do estado atual do repositório. Para atualizar: edite este arquivo e/ou os arquivos referenciados acima.*
