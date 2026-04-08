# Workflows n8n – BYLA (transações para Supabase)

Esta pasta guarda os JSON dos workflows do n8n. **Sistema novo (sem Pluggy):** use os workflows abaixo e o guia **docs/IMPLEMENTAR_NOVO_SISTEMA.md**.

## Workflows do sistema novo (recomendado)

| Arquivo | Uso |
|---------|-----|
| **workflow-planilha-para-supabase.json** | Planilha Google (aba **Importar**) → Supabase. Qualquer banco. |
| **workflow-pagbank-edi-para-supabase.json** | API PagBank EDI → Supabase. Só conta PagBank Empresas; precisa de token. |
| **workflow-supabase-webhook-google-sheets-export.json** | **INSERT** em `transacoes` → backend `montar-linhas` → Sheets **Movimentações**. Credencial n8n **Header Auth** (`X-Byla-Sync-Secret`). [HOST_ENV_BYLA.md](./HOST_ENV_BYLA.md). SQL: `scripts/supabase-mapeamento-categoria-e-view-export.sql`. [docs/N8N_WEBHOOK_EXPORT_PLANILHA.md](../docs/N8N_WEBHOOK_EXPORT_PLANILHA.md). |
| **workflow-supabase-bulk-export-google-sheets-once.json** | Carga única: mesma credencial HTTP + Sheets. |

**Implementação passo a passo:** [docs/IMPLEMENTAR_NOVO_SISTEMA.md](../docs/IMPLEMENTAR_NOVO_SISTEMA.md)

---

## Workflows antigos (Pluggy – plano encerrado)

Abaixo: referência do fluxo que usava a **API Pluggy**. O plano Pluggy acabou; a origem das transações passou a ser **planilha** ou **PagBank EDI** (ver acima).

## Fluxo atual (resumo)

1. **Schedule Trigger** (1x por dia, a cada 24h) → **Get many rows** (Supabase – busca todas as transações)
2. **If** (tem linhas na tabela?)  
   - SIM → **Pegar última data** (calcula “dia seguinte à última transação” até “hoje” → só novas)
   - NÃO → **Code in JavaScript2** (últimos 30 dias, para a primeira execução ou tabela vazia)
3. **Code in JavaScript2** ou **Pegar última data** → **Preparar Variáveis** (POST auth Pluggy)
4. **Preparar Variáveis** → **Edit Fields1** (define itemId e apiKey)
5. **Edit Fields1** → **Receber Variáveis** (PATCH item Pluggy) e → **Merge** (entrada 1)
6. **Receber Variáveis** → **Merge** (entrada 0)
7. **Merge** (3 entradas: Receber Variáveis, Edit Fields1, Pegar última data) → **Code in JavaScript1**
8. **Code in JavaScript1** → **Buscar Extrato** (GET transações Pluggy)
9. **Buscar Extrato** → **Code in JavaScript** (normaliza) → **Aggregate** → **Split Out** → **Edit Fields** (id_unico) → **Loop Over Items** → **Create a row** (Supabase)

## Correção aplicada (Code in JavaScript1)

Foi adicionado um **fallback** depois do try/catch: se `fromDate` ou `toDate` ainda estiverem vazios, o código preenche com “hoje” e “30 dias atrás”. Assim o **Buscar Extrato** sempre recebe datas válidas e o erro *"from must be a valid ISO 8601 date string"* deixa de ocorrer.

## Correção aplicada (Code in JavaScript – após Buscar Extrato)

- O node **Code in JavaScript** (logo após Buscar Extrato) envia para o Supabase: **data**, **pessoa**, **descricao** (incluindo tipo de pagamento), **valor**, **tipo** (entrada/saida), **id_unico**, **categoria** (tipo de pagamento, ex.: PIX).
- **id_unico** é calculado de forma estável para evitar duplicatas; **pessoa** é extraída da descrição (José, Maria, etc.).

Para não dar erro *"Could not find the 'categoria' column"*, a tabela **transacoes** no Supabase **precisa** ter a coluna **categoria**. Veja **SUPABASE_TABELA_TRANSACOES.md** para o SQL exato (criar tabela e `ALTER TABLE ... ADD COLUMN categoria`).

## Como usar

- **Importar no n8n:** no n8n, Import from File e escolha o JSON do workflow (ex.: `workflow-pluggy-supabase-corrigido.json` ou o que estiver na pasta Downloads).
- **Agendamento para pegar transações novas (sem Update API):** como o plano não permite Update em produção, a Pluggy atualiza o item por **sync automático** (a cada 24h, 12h ou 8h). Configure o **Schedule Trigger** do workflow principal para rodar **a cada 12 horas** (ou 8h) para aumentar a chance de pegar dados já sincronizados. No n8n: abra o node "Schedule Trigger" → defina "Every 12 hours" (ou "Every 8 hours") → salve.
- **Atualização manual (quando precisar de dados na hora):** use o workflow **Gerar token update Pluggy** (`workflow-gerar-token-update-pluggy.json`) e a página **docs/pluggy-connect-update.html**. Detalhes em **docs/ATUALIZAR_TRANSACOES_PLUGGY_SEM_UPDATE_API.md**.
- **Atualizar o projeto:** quando mudar o workflow no n8n, exporte de novo e substitua o JSON aqui.

## Como testar o fluxo

1. Confirme que a tabela `transacoes` no Supabase tem as colunas: **id**, **data**, **pessoa**, **descricao**, **valor**, **tipo**, **id_unico** (e **sem** coluna `categoria`, ou então o workflow não envia esse campo). Veja `SUPABASE_TABELA_TRANSACOES.md` e o SQL sugerido.
2. No n8n, importe o `My-workflow.json` (ou use o que já está corrigido) e execute o workflow (Execute Workflow).
3. Verifique: **Buscar Extrato** deve retornar transações; **Code in JavaScript** deve sair com data, descricao, valor, tipo, pessoa, id_unico; **Create a row** não deve dar erro de coluna.
4. No Supabase, confira a tabela `transacoes`: devem aparecer novas linhas para transações ainda não existentes. Transações que já existem (mesmo `id_unico`) devem ser ignoradas (erro de duplicate key é tratado com "continue on fail").
