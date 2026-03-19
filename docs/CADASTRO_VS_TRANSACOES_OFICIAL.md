# Cadastro vs transações (banco) – o que é oficial

No sistema Byla há **duas fontes** de informação sobre pagamentos:

| Fonte | Tabela | Significado |
|-------|--------|-------------|
| **Cadastro** | `aluno_planos` | O que foi **lançado manualmente**: aluno X pagou mensalidade da atividade Y, valor Z, data, forma de pagamento, nome do pagador. Serve para saber “quem deveria pagar”, “qual valor da mensalidade” e para **conferir** com o banco. |
| **Oficial (banco)** | `transacoes` | O que **realmente entrou (ou saiu)** na conta do Espaço Byla, vindo do extrato bancário via Pluggy/n8n. É a **fonte da verdade** para “quanto entrou no mês” e “quem pagou” do ponto de vista financeiro. |

---

## Regra de uso

- **Valores e “quem pagou” oficiais** → sempre conferir e basear em **`transacoes`** (dados do banco).
- **Quantidade de alunos, preço da mensalidade por atividade, lista de alunos por modalidade** → vêm do **cadastro** (`aluno_planos` + atividades + planos + alunos).
- **Conciliação:** comparar o cadastro com as transações (mesmo valor, mesma data, nome do pagador ≈ pessoa no extrato) para marcar “confirmado no banco” ou “pendente conferência”.

As views abaixo deixam isso explícito e permitem usar os dois lados e conciliar.

---

## Views que usam o cadastro (aluno_planos)

- **v_mensalidades_por_atividade** – lista de pagamentos lançados no cadastro, por atividade (aluno, valor, data, nome do pagador).
- **v_resumo_atividade** – totais **por atividade** a partir do cadastro (quantos alunos, quantas mensalidades, soma dos valores).  
→ Use para “quantos alunos por modalidade” e “quanto esperamos por atividade”. **Não é o valor oficial que entrou no banco.**

---

## Views OFICIAIS (tabela transacoes = banco)

- **v_entradas_oficial** – todas as **entradas** do extrato bancário (data, pessoa, valor, forma de pagamento). **Fonte da verdade** para “quanto entrou” e “quem pagou” do ponto de vista do banco.
- **v_resumo_mensal_oficial** – totais **por mês** de entradas e saídas a partir de **transacoes**. Use para relatório gerencial: “quanto entrou no mês”, “quanto saiu”, “saldo do mês”. **Estes são os números oficiais.**

---

## Conciliação (cadastro vs banco)

- **v_reconciliacao_mensalidades** – cada pagamento do **cadastro** (aluno_planos) com indicação se existe uma **transação no banco** que bate (mesmo valor, mesma data, nome do pagador compatível).  
  - **confirmado_banco = true** → esse pagamento foi encontrado no extrato.  
  - **confirmado_banco = false** → só está no cadastro; falta conferir no banco ou o nome/valor/data não bateu.
- **v_comparativo_cadastro_vs_oficial** – por mês: total do cadastro vs total de entradas oficiais (transacoes) e a **diferença**. Serve para ver se o que foi lançado no cadastro está batendo com o que de fato entrou.

---

## Resumo

| Pergunta | Onde ver (oficial) | Onde ver (cadastro) |
|----------|--------------------|----------------------|
| Quanto entrou no mês? | **v_resumo_mensal_oficial** ou **v_entradas_oficial** (transacoes) | v_resumo_atividade (soma por atividade) |
| Quem pagou? (banco) | **v_entradas_oficial** (pessoa, valor, data) | v_mensalidades_por_atividade (aluno, nome_pagador) |
| Esse pagamento entrou no banco? | **v_reconciliacao_mensalidades** (confirmado_banco) | — |
| Cadastro bate com o banco? | **v_comparativo_cadastro_vs_oficial** (diferenca por mês) | — |

Script das views oficiais e conciliação: **`scripts/views-transacoes-oficial-e-reconciliacao.sql`**.

Para **problemas comuns** (valor NULL em mensalidades, confusão entre aluno e pagador) e como resolver: **`docs/PROBLEMAS_E_SOLUCOES_SUPABASE.md`**.
