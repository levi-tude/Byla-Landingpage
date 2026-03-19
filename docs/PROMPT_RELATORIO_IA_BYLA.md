# Design do prompt – Relatório mensal com IA (Byla)

Este documento descreve o **design do prompt** usado no workflow **BYLA - Relatório mensal com IA**, alinhado ao guia de engenharia de prompt do projeto (`ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`).

---

## Objetivo

Gerar um **resumo executivo em português** do mês de referência (mês anterior à data de execução), com:
- Totais oficiais (entradas, saídas, saldo)
- Comparação com o mês anterior
- Lista de inadimplentes (mensalidades não confirmadas no banco)
- Recomendações objetivas

---

## Técnicas aplicadas (referência: PDF + guia do projeto)

| Técnica | Aplicação no relatório |
|--------|--------------------------|
| **Role Prompting** | System prompt define o papel: *"Você é um analista financeiro do Espaço Byla, um espaço cultural."* |
| **Contextual Embedding** | Os dados reais (resumo mensal, mês anterior, lista de pendentes) são injetados no user prompt em bloco `[DADOS] ... [FIM DADOS]`. |
| **Instruction Tuning** | Instrução clara: *"Analise passo a passo ... produza o resumo executivo ... Passos: 1) ... 2) ... 3) ..."* |
| **Output Constraining** | System prompt exige formato: *"use exatamente as seções ## Resumo, ## Números do mês, ## Inadimplência, ## Recomendações"* e *"Máximo 500 palavras"*. |
| **Chain-of-Thought (CoT)** | User prompt pede análise passo a passo antes de gerar o texto e enumera os passos (totais/tendência → inadimplência → recomendações). |

---

## Estrutura do prompt

### System message (role + output constraint)

```
Você é um analista financeiro do Espaço Byla, um espaço cultural. Sua tarefa é gerar resumos executivos objetivos a partir dos dados fornecidos. Responda sempre em português brasileiro. Formato de saída obrigatório: use exatamente as seções ## Resumo, ## Números do mês, ## Inadimplência, ## Recomendações. Seja conciso. Máximo 500 palavras.
```

### User message (instruction + context + CoT)

1. **Instrução inicial:** *"Analise passo a passo os dados abaixo e produza o resumo executivo do mês."*
2. **Contexto:** Bloco `[DADOS]` com:
   - Mês de referência
   - Resumo do mês (total entradas, total saídas, saldo, quantidades)
   - Resumo do mês anterior (para tendência)
   - Lista de mensalidades não confirmadas no banco (até 30 itens; aluno, atividade, valor, data)
3. **CoT:** *"Passos: 1) Resuma os totais e a tendência vs mês anterior; 2) Comente a situação de inadimplência se houver; 3) Dê 1 a 3 recomendações práticas. Gere o texto nas seções solicitadas."*

---

## Fonte dos dados (contexto)

- **Resumo do mês / mês anterior:** view `v_resumo_mensal_oficial` (Supabase), limit 3 linhas (últimos meses).
- **Pendentes:** view `v_reconciliacao_mensalidades` (Supabase), filtradas por `confirmado_banco = false` e `data_pagamento` no mês de referência.

O nó **Montar prompt e contexto** no n8n monta o texto do bloco `[DADOS]` a partir dessas fontes. Nenhum número é inventado pela IA; tudo vem do banco (single source of truth).

---

## Parâmetros do modelo

- **Modelo:** `gpt-4o-mini` (custo baixo, adequado para resumo).
- **Temperature:** 0,3 (mais determinístico, menos criativo).
- **Max tokens:** 800 (respeita o limite de ~500 palavras e evita respostas longas demais).

---

## Manutenção

- Alterar **texto do system/user** no nó **Montar prompt e contexto** do workflow `workflow-relatorio-mensal-ia.json`.
- Ao mudar seções ou formato, atualizar também o **Output Constraining** no system prompt e, se necessário, este documento.

Referências: `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`, [Chain-of-Thought](https://www.promptingguide.ai/techniques/cot), [Spring AI patterns](https://docs.spring.io/spring-ai/reference/api/chat/prompt-engineering-patterns.html).
