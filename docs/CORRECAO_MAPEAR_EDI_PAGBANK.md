# Correção do nó "Mapear para transacoes" (PagBank EDI)

## Problema

O nó **Mapear para transacoes** não retornava nada ("No output data returned") porque o código usava nomes de campos pensados para a **Pluggy** (ex.: `data`, `dataLancamento`, `valor`, `descricao`, `payerName`). A API **PagBank EDI** devolve outros nomes no array `detalhes`.

## Estrutura da resposta EDI (transactional)

- A resposta tem um array **`detalhes`** com um objeto por transação.
- Cada objeto usa, entre outros, campos como:
  - **Data:** `data_inicial_transacao`, `data_venda_ajuste`, `data_movimentacao`
  - **Valor:** `valor_total_transacao`, `valor_parcela`
  - **Identificação:** `codigo_venda`, `codigo_transacao`, e às vezes `descricao`, `nome_comprador`, etc.

## O que foi alterado

No nó **Mapear para transacoes** (Code), o mapeamento foi ajustado para usar **primeiro** os campos da EDI e depois os antigos (Pluggy/compatibilidade):

| Campo na tabela | Ordem dos campos usados na resposta |
|-----------------|-------------------------------------|
| **data** | `data_inicial_transacao`, `data_venda_ajuste`, `data_movimentacao`, depois `data`, `dataLancamento`, `date`, e por fim a data da consulta |
| **valor** | `valor_total_transacao`, `valor_parcela`, depois `valor`, `amount`, `value` |
| **pessoa** | `descricao`, `nome_comprador`, `nome`, `payerName`, `pessoa`, ou "Transação " + `codigo_venda`/`codigo_transacao` |
| **descricao** | `tipoMovimento`, `metodo`, `paymentMethod`, `tipo_transacao`, ou "PIX" |

- Foi adicionada proteção ao acessar `$('Últimos 15 dias').item.json.data` (verificação antes de usar).
- **id_unico** passou a usar `codigo_transacao` ou `codigo_venda` quando existir (mais único; evita duplicata quando duas transações têm mesma data, pessoa e valor).
- Data é normalizada com `String(...).split('T')[0].trim()` para aceitar formato com hora.

## Como usar a correção

1. **Reimportar o workflow** no n8n usando um dos arquivos:
   - **`n8n-workflows/workflow-pagbank-edi-para-supabase.json`** (pasta do projeto), ou  
   - **`Downloads/BYLA - PagBank EDI para Supabase.json`** (já atualizado).
2. Reassociar as credenciais (PagBank EDI e Supabase) nos nós, se o n8n pedir.
3. Rodar **Execute Workflow** e conferir a saída do nó **Mapear para transacoes** e a tabela **transacoes** no Supabase.

Se a API EDI tiver campos com outros nomes no seu ambiente, edite o código do nó **Mapear para transacoes** e inclua esses nomes na mesma ordem de prioridade (EDI primeiro, depois fallbacks).
