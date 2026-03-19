# Workflow PagBank EDI: 15 dias e revisão

## Alterações feitas

### 1. Período: 7 → 15 dias
- O nó **"Últimos 7 dias"** foi renomeado para **"Últimos 15 dias"**.
- O loop passou a gerar **15 datas** (últimos 15 dias).
- As conexões e a referência no nó **"Mapear para transacoes"** foram atualizadas para **"Últimos 15 dias"**.

### 2. Id_unicos no Supabase: limite 5000 → 10000
- Com 15 dias, o volume de transações pode ser maior.
- O nó **"Id_unicos no Supabase"** (getAll na tabela **transacoes**) passou a usar **limit 10000** para reduzir o risco de não enxergar todas as transações já salvas e, com isso, tentar inserir duplicatas.

### 3. id_unico mais único no "Mapear para transacoes"
- Antes: `id_unico = data + '-' + pessoa + '-' + valor`. Duas transações no mesmo dia, mesmo valor e mesma pessoa (ex.: mesmo nome de comprador) geravam o mesmo `id_unico` e podiam causar erro de duplicate key ou perda de uma delas.
- Agora: `id_unico = data + '-' + (d.codigo_transacao || d.codigo_venda || pessoa) + '-' + valor`. Quando a API EDI envia **codigo_transacao** ou **codigo_venda**, eles entram no `id_unico`, deixando cada transação com identificador único.

## Fluxo conferido

1. **Agendar** dispara **Últimos 15 dias** e **Id_unicos no Supabase** em paralelo.
2. **Últimos 15 dias** gera 15 itens (15 datas) → **PagBank EDI** é chamado 15 vezes (uma por data).
3. **PagBank EDI** → **Mapear para transacoes** (cada resposta vira N linhas; campos EDI mapeados; id_unico com codigo_transacao/codigo_venda quando existir).
4. **Mapear** → **Só novos** (filtra pelo Set de id_unico já existentes no Supabase).
5. **Só novos** → **Inserir Supabase** (só transações novas; onError continueRegularOutput para não parar em um eventual erro).

## Arquivos atualizados

- **n8n-workflows/workflow-pagbank-edi-para-supabase.json** (projeto).
- **Downloads/BYLA - PagBank EDI para Supabase.json** (cópia para importar no n8n).
- **docs/PAGBANK_EDI_SUPABASE.md** (texto ajustado para “últimos 15 dias”).
- **docs/CORRECAO_MAPEAR_EDI_PAGBANK.md** (nota sobre id_unico e Últimos 15 dias).

Reimporte o workflow no n8n (a partir do JSON do projeto ou do Downloads) e reassocie as credenciais se necessário.
