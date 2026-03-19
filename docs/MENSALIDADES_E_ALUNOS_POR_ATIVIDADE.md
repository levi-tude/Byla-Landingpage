# Mensalidades e alunos por atividade

Este documento explica como ficam **organizadas** as mensalidades e os alunos por atividade (modalidade) no Supabase, para que fique claro o preço de cada produto e a divisão dos alunos por modalidade.

---

## 1. Estrutura em poucas palavras

- **Atividade** = modalidade (Pilates, Dança contemporânea infantil, Ballet, Jazz, Teatro, GR, etc.).
- **Plano** = produto vinculado à atividade (ex.: “Mensalidade” de Pilates). Cada atividade tem um plano “Mensalidade”; o **preço** pode estar no plano (`valor_mensal`) e/ou em cada pagamento (`aluno_planos.valor`).
- **Alunos** = cadastro geral em `alunos` (uma vez por pessoa). A **divisão por atividade** é feita pelo vínculo em `aluno_planos`: quem tem plano da atividade X é aluno da atividade X.
- **Mensalidade paga** = uma linha em `aluno_planos`: aluno, plano (e portanto atividade), valor, data, forma de pagamento, nome do pagador.

Assim, o **preço da mensalidade** e o **produto** (plano) ficam vinculados à **atividade**; o **aluno** fica vinculado à atividade através do plano em que está.

---

## 2. Tabelas base

| Tabela | Função |
|--------|--------|
| **atividades** | Modalidades (Pilates, Dança, Ballet, Jazz, Teatro, GR, …). |
| **planos** | Um plano “Mensalidade” por atividade; `valor_mensal` = preço de referência da mensalidade daquela atividade. |
| **alunos** | Lista geral de alunos (nome, etc.). |
| **aluno_planos** | Vínculo aluno–plano: quem pagou qual mensalidade (de qual atividade), valor, data, forma de pagamento, nome do pagador. |

---

## 3. Views para consulta (organização clara)

Depois de rodar o script **`scripts/views-mensalidades-e-alunos-por-atividade.sql`** no Supabase, use as views abaixo.

### 3.1 Preço da mensalidade por atividade

**View:** `v_precos_mensalidade_por_atividade`

Mostra, **por atividade**, o “produto” (plano) e o preço:

- `atividade_nome` – nome da modalidade  
- `plano_nome` – nome do plano (ex.: Mensalidade)  
- `valor_mensal_referencia` – preço de referência do plano  
- `valor_minimo_pago`, `valor_maximo_pago`, `valor_medio_pago` – faixa de valores realmente pagos  
- `total_pagamentos_registrados` – quantos pagamentos existem para essa atividade  

Assim fica explícito **qual preço e qual produto estão vinculados a cada atividade**.

### 3.2 Alunos divididos por atividade

**View:** `v_alunos_por_atividade`

Lista **alunos por modalidade**: uma linha por (atividade, aluno).

- `atividade_nome` – nome da atividade  
- `aluno_nome` – nome do aluno  
- `plano_nome` – plano (Mensalidade) daquela atividade  

Para “alunos de Pilates”: filtre `atividade_nome = 'Pilates'`.  
Para “alunos de Dança”: filtre pela atividade de Dança correspondente.  
O mesmo aluno pode aparecer em várias linhas (uma por atividade em que está).

### 3.3 Mensalidades detalhadas por atividade

**View:** `v_mensalidades_por_atividade`

Cada linha = um pagamento de mensalidade, com atividade, aluno e valor:

- `atividade_nome` – atividade (modalidade)  
- `aluno_nome` – aluno que pagou  
- `valor` – valor pago  
- `data_pagamento` – data de referência  
- `forma_pagamento` – pix, débito, crédito, etc.  
- `nome_pagador` – nome de quem efetuou o pagamento  

Assim cada mensalidade fica **claramente ligada à atividade** e ao aluno.

### 3.4 Resumo por atividade

**View:** `v_resumo_atividade`

Por atividade:

- `total_alunos` – quantidade de alunos (distintos) naquela atividade  
- `total_mensalidades` – quantidade de pagamentos  
- `total_valor` – soma dos valores (fonte: **cadastro**)

Útil para “quantos alunos por modalidade” e “quanto foi lançado por modalidade”.  
**Importante:** o valor **oficial** do que entrou na conta vem da tabela **transacoes** (banco). Use as views **v_entradas_oficial**, **v_resumo_mensal_oficial** e **v_reconciliacao_mensalidades** para conferir com o banco. Ver **`docs/CADASTRO_VS_TRANSACOES_OFICIAL.md`**.

---

## 4. Resumo

- **Mensalidade** = produto (plano) vinculado à **atividade**; o preço fica claro em `v_precos_mensalidade_por_atividade` e em cada linha de `v_mensalidades_por_atividade`.  
- **Alunos** = cadastro geral em `alunos`; a **divisão por atividade** fica clara em `v_alunos_por_atividade` (e no resumo em `v_resumo_atividade`).  
- Para relatórios e planilhas, use as views por atividade em vez de consultar só as tabelas base; assim o preço e o produto ficam sempre associados à modalidade correta.

---

*Script das views: `scripts/views-mensalidades-e-alunos-por-atividade.sql`. Ordem: schema → seed → views.*  

*Documentação geral do Supabase: `docs/SUPABASE_PROJETO_BYLA.md`.*
