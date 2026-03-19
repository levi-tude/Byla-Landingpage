# Workflow: BYLA - Relatório mensal com IA

Gera um **resumo executivo financeiro** do mês anterior usando dados do Supabase e a API da OpenAI, com prompt estruturado (role, contexto, instrução, formato de saída).

---

## O que o workflow faz

1. **Disparo:** Manual (testar) ou agendado (1º dia de cada mês às 8h).
2. **Dados:** Busca em Supabase a view `v_resumo_mensal_oficial` (últimos 3 meses) e `v_reconciliacao_mensalidades` (até 500 linhas).
3. **Contexto:** O nó **Montar prompt e contexto** calcula o mês de referência (mês anterior), filtra resumo e inadimplentes e monta o texto que será enviado à IA.
4. **Prompt:** System message = papel (analista Byla) + formato de saída (seções ## Resumo, ## Números do mês, ## Inadimplência, ## Recomendações, máx. 500 palavras). User message = instrução + dados reais + pedido de análise passo a passo.
5. **IA:** POST para `https://api.openai.com/v1/chat/completions` (modelo `gpt-4o-mini`, temperature 0,3, max_tokens 800).
6. **Saída:** O nó **Extrair relatório** pega `choices[0].message.content` e devolve em `report` para uso em e-mail, WhatsApp ou apenas visualização.

---

## Configuração necessária

### 1. Credencial OpenAI no n8n

- **Settings → Credentials → Add credential → Header Auth**
- **Name:** ex. `OpenAI API Key`
- **Header Name:** `Authorization`
- **Header Value:** `Bearer sk-...` (sua chave em [platform.openai.com](https://platform.openai.com))

No nó **OpenAI Chat**, selecione essa credencial.

### 2. Supabase

O workflow usa a credencial **Supabase account** já usada em outros fluxos (planilha → Supabase, EDI → Supabase). Verifique se o projeto tem as views `v_resumo_mensal_oficial` e `v_reconciliacao_mensalidades` (script `scripts/views-transacoes-oficial-e-reconciliacao.sql`).

### 3. Testar

- Execute pelo nó **Manual (testar agora)**.
- Confira a saída do nó **Extrair relatório**: campo `report` com o texto em markdown.

---

## Próximos passos opcionais

- **Enviar por e-mail:** Adicionar nó **Email (SMTP)** após **Extrair relatório**, usando `{{ $json.report }}` no corpo.
- **Enviar por WhatsApp:** Integrar com Evolution API ou Twilio e enviar `$json.report` (ou uma versão resumida).

---

## Design do prompt

O desenho do prompt (role, contexto, instrução, restrição de saída, CoT) está documentado em **`docs/PROMPT_RELATORIO_IA_BYLA.md`** e segue o guia **`docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`**.
