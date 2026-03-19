# Prompt: Corrigir workflow n8n para trazer novas transações do banco (Pluggy → Supabase)

## Objetivo

O workflow não está trazendo transações novas do banco: mesmo com movimentação recente, ao rodar o fluxo as transações continuam as mesmas. É necessário **disparar a sincronização do item na Pluggy** antes de buscar o extrato e garantir que o restante do fluxo use os dados mais recentes.

---

## Causa raiz (documentada no projeto)

- A **API Pluggy não atualiza o extrato sozinha**. Ela retorna o último snapshot que foi sincronizado.
- Para ter transações novas, é obrigatório **atualizar o Item** (trigger de sync) antes de chamar o endpoint de transações.
- Documentação: [Data sync: Update an Item](https://docs.pluggy.ai/docs/data-sync-update-an-item) e [Items Update](https://docs.pluggy.ai/reference/items-update).

---

## O que exatamente fazer

### 1. Chamar o update do Item Pluggy antes de buscar transações

- **Endpoint:** `PATCH https://api.pluggy.ai/items/{itemId}` (não é POST /update).
- **Headers:** `X-API-KEY: {{ apiKey }}` (token obtido no node “Preparar Variáveis”).
- **Body:** `{}` (vazio ou JSON vazio). Credenciais são opcionais; se não enviar, a Pluggy usa as armazenadas.
- **Quando:** Logo após ter `apiKey` e `itemId` (saída do node “Edit Fields1”), e **antes** do Merge que alimenta o “Code in JavaScript1” e o “Buscar Extrato”.
- **Fluxo:**  
  `Edit Fields1` → **Update Pluggy (PATCH)** → **Set (repassar apiKey e itemId)** → **Wait (3 min)** → **Merge (entrada 2)**.

Motivo do **Set** e do **Wait**:

- O nó de HTTP Request (PATCH) substitui o item de saída pela resposta da API (objeto Item). Assim, perdemos `apiKey` e `itemId` no fluxo.
- Após o PATCH, usar um **Set** (ou Code) para repor `apiKey` e `itemId` a partir do node “Edit Fields1” (ex.: `$('Edit Fields1').first().json`) e enviar isso para o **Wait** e depois para o **Merge**.
- A Pluggy processa o sync de forma assíncrona; é necessário **Wait de 3 a 5 minutos** antes de buscar transações, para o snapshot ser atualizado.

Opcional (recomendado para debug):

- Após o Wait, chamar `GET https://api.pluggy.ai/items/{itemId}` com o mesmo `X-API-KEY` e verificar se `status` está `UPDATED` (ou pelo menos não `UPDATING`) antes de seguir para o Merge. Se quiser, pode usar um IF e só seguir se `status === 'UPDATED'`.

### 2. Garantir que “última transação” seja realmente a mais recente (Supabase)

- O node **Get many rows** (Supabase) hoje usa `limit: 1000` e não define ordenação. O Supabase/PostgREST pode devolver linhas em ordem de inserção ou por PK, então as “últimas” transações por **data** podem não estar nesse bloco.
- **Ajuste:** Incluir um node de **ordenação** depois de “Get many rows” e antes do **If**:
  - **Opção A:** Node **Sort** (se existir no n8n): campo `data`, ordem **descending**.
  - **Opção B:** Node **Code** que recebe todos os itens, ordena por `json.data` em ordem decrescente e devolve os mesmos itens. Ex.:  
    `const items = $input.all(); items.sort((a, b) => new Date(b.json.data) - new Date(a.json.data)); return items;`
- Assim, o node **Pegar última data** passa a receber as transações já ordenadas pela data mais recente, e o cálculo de `fromDate`/`toDate` e a lista de `id_unicos` existentes refletem corretamente o estado mais recente da tabela.

### 3. Buscar mais transações por request (Pluggy)

- No node **Buscar Extrato**, a API Pluggy aceita até **500** transações por página.
- **Ajuste:** Aumentar `pageSize` de 200 para **500** na URL (ex.: `&pageSize=500`), para reduzir chance de “cortar” muitas transações novas em um único intervalo de datas.

### 4. Paginação (opcional, se houver muitos registros)

- Se no período `from`–`to` houver mais de 500 transações, a API retorna paginado. Hoje o workflow não trata `page`/`nextPage`.
- Para uma primeira correção, pode manter apenas o `pageSize=500`. Se depois ainda faltarem transações em períodos longos, adicionar um loop (por exemplo, enquanto existir `nextPage` ou `page < totalPages`) para buscar todas as páginas e depois concatenar os `results` antes do node “Code in JavaScript” que filtra duplicatas.

### 5. Manter deduplicação e filtro por `id_unico`

- Não alterar a lógica que usa `id_unico` e `idUnicosExistentes` para evitar duplicatas no Supabase.
- Manter o formato de `id_unico` (ex.: `data-pessoa-valor` com timestamp quando disponível) e a comparação com o Set de `id_unicos` existentes.

### 6. Resumo do fluxo corrigido

1. **Schedule Trigger** → **Get many rows** (Supabase, `transacoes`, limit 1000).
2. **Get many rows** → **Sort/Code (ordenar por data DESC)** → **If** (tem itens?).
3. **If (sim)** → **Pegar última data** → **Preparar Variáveis** (auth Pluggy) e → **Merge (entrada 1)**.  
   **If (não)** → **Code in JavaScript2** (30 dias) → **Preparar Variáveis**.
4. **Preparar Variáveis** → **Edit Fields1** (apiKey, itemId).
5. **Edit Fields1** → **Update Pluggy (PATCH /items/{itemId})** → **Set (repor apiKey, itemId)** → **Wait (3 min)** → **Merge (entrada 2)**.
6. **Merge** → **Code in JavaScript1** → **Buscar Extrato** (pageSize 500, from/to).
7. **Buscar Extrato** → **Code in JavaScript** (filtrar duplicatas por `id_unico`) → **Aggregate** → **Split Out** → **Edit Fields** → **Loop Over Items** → **Create a row** (Supabase).

---

## Checklist de implementação

- [ ] Inserir node **HTTP Request** “Update Pluggy”: PATCH `https://api.pluggy.ai/items/{{ $json.itemId }}`, header `X-API-KEY: {{ $json.apiKey }}`, body `{}`.
- [ ] Inserir node **Set** após “Update Pluggy”: repor `apiKey` e `itemId` a partir de `$('Edit Fields1').first().json`.
- [ ] Inserir node **Wait**: 3 minutos (ou 5 se quiser mais margem).
- [ ] Desconectar **Edit Fields1** → **Merge**; conectar **Edit Fields1** → **Update Pluggy** → **Set** → **Wait** → **Merge (entrada 2)**.
- [ ] Inserir **Sort** ou **Code** após “Get many rows” para ordenar por `data` DESC; conectar **Get many rows** → Sort/Code → **If**.
- [ ] No node **Buscar Extrato**, alterar `pageSize` para 500.
- [ ] Testar: rodar o workflow e verificar se novas transações do banco passam a aparecer no Supabase após o Wait.

---

## Referências no repositório

- `CONTROLE_FINANCEIRO_PLUGGY.md` – problema “API retorna apenas transações até janeiro” e solução “Implementar update da conta Pluggy”.
- `n8n-pluggy-update-implementation.md` – fluxo com Update, Wait e verificação de status.
- `docs/CORRECAO_FILTRO_DUPLICATAS_FINAL.md` – filtro por `id_unico` e formato.
- `docs/CORRECAO_WORKFLOW_DUPLICATAS_E_NOVAS_TRANSACOES.md` – fromDate/toDate e Pegar última data.
