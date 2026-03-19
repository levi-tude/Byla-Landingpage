# Correção do Workflow - Duplicatas e Novas Transações

## Problemas Identificados

### Problema 1: Não estava pegando novas transações
- **Sintoma:** Workflow rodava mas só trazia 3 transações, sendo a última de 13/02, mesmo tendo mais transações depois.
- **Causa:** O cálculo de `fromDate` estava sempre usando "dia seguinte à última transação", mas se a última transação era de hoje, ele não buscava todas as transações do dia atual.

### Problema 2: Estava vindo transações duplicadas
- **Sintoma:** Transações que já estavam na tabela apareciam de novo, causando erro de duplicate key no `id_unico`.
- **Causa:** 
  - O node **Code in JavaScript1** não estava passando `ultimoIdUnico` e `ultimaData` para o filtro.
  - O filtro no **Code in JavaScript** estava muito restritivo (`date <= ultimaData`) e não verificava todos os `id_unicos` existentes na tabela.

---

## Correções Aplicadas

### 1. Node "Code in JavaScript1" (antes do Buscar Extrato)

**O que foi adicionado:**
- Agora pega e passa `ultimoIdUnico` e `ultimaData` do Merge (que vem do node "Pegar última data").
- Esses valores são incluídos no `return` para que o filtro possa usá-los.

**Código alterado:**
```js
// ANTES: só passava fromDate e toDate
return {
  json: {
    apiKey: cleanApiKey,
    itemId: itemId,
    accountId: accountId,
    fromDate: fromDate,
    toDate: toDate
  }
};

// DEPOIS: também passa ultimoIdUnico e ultimaData
return {
  json: {
    apiKey: cleanApiKey,
    itemId: itemId,
    accountId: accountId,
    fromDate: fromDate,
    toDate: toDate,
    ultimoIdUnico: ultimoIdUnico,  // ← NOVO
    ultimaData: ultimaData          // ← NOVO
  }
};
```

---

### 2. Node "Pegar última data"

**O que foi melhorado:**
- **Cálculo de `fromDate` mais inteligente:**
  - Se a última transação é de **hoje**: busca desde **hoje** (para pegar todas as transações do dia atual).
  - Se a última transação é de **outro dia**: busca do **dia seguinte** (para não repetir).
- **Ordenação melhorada:** Ordena por data e depois por `id_unico` para garantir que pega a transação mais recente mesmo se houver várias no mesmo dia.
- **Retorna `ultimoIdUnico` e `ultimaData`:** Esses valores são passados para o Merge e depois para o Code in JavaScript1.

**Código alterado:**
```js
// ANTES: sempre usava "dia seguinte"
lastDate.setDate(lastDate.getDate() + 1);
const fromDate = lastDate.toISOString().split('T')[0];

// DEPOIS: se última transação é de hoje, busca desde hoje
if (ultimaDataStr === hojeStr) {
  fromDate = hojeStr;  // Busca desde hoje
} else {
  lastDate.setDate(lastDate.getDate() + 1);
  fromDate = lastDate.toISOString().split('T')[0];  // Busca do dia seguinte
}
```

---

### 3. Node "Code in JavaScript" (depois do Buscar Extrato)

**O que foi melhorado:**
- **Busca TODOS os `id_unicos` existentes na tabela** usando `$('Get many rows').all()` e cria um `Set` para verificação rápida.
- **Filtro mais preciso:**
  - Exclui transações cujo `id_unico` já existe na tabela (verificação completa).
  - Exclui apenas se a data for **anterior** à última (`date < ultimaData`), não igual (para pegar transações do mesmo dia).
  - Mantém verificação de backup pelo `ultimoIdUnico`.

**Código alterado:**
```js
// ANTES: só verificava ultimoIdUnico e ultimaData (que vinham null)
let ultimoIdUnico = null;
let ultimaData = null;
// ... filtro simples

// DEPOIS: busca TODOS os id_unicos da tabela
let idUnicosExistentes = new Set();
try {
  const todasTransacoes = $('Get many rows').all();
  todasTransacoes.forEach(item => {
    if (item.json.id_unico) {
      idUnicosExistentes.add(item.json.id_unico);
    }
  });
} catch (e) {
  if (ultimoIdUnico) {
    idUnicosExistentes.add(ultimoIdUnico);
  }
}

// Filtro melhorado: verifica Set completo + data < ultimaData (não <=)
const resultsFiltrados = results.filter(r => {
  // ... calcula id_unico ...
  if (idUnicosExistentes.has(id_unico)) return false;  // ← NOVO: verifica Set completo
  if (ultimoIdUnico && id_unico === ultimoIdUnico) return false;
  if (ultimaData && date < ultimaData) return false;  // ← CORRIGIDO: < em vez de <=
  return true;
});
```

---

### 4. Node "Receber Variáveis" e Merge

**O que foi feito:**
- **Receber Variáveis** foi **desativado** (`disabled: true`) porque estava dando erro de plano Pluggy.
- **Merge** foi ajustado para **2 entradas** em vez de 3 (sem o Receber Variáveis).
- **Conexões ajustadas:** Edit Fields1 → Merge (input 0), Pegar última data → Merge (input 1).

---

## Como Funciona Agora

1. **Get many rows** busca todas as transações da tabela.
2. **Pegar última data** calcula:
   - `fromDate`: hoje (se última é de hoje) ou dia seguinte (se última é de outro dia).
   - `toDate`: hoje.
   - `ultimaData` e `ultimoIdUnico`: da transação mais recente.
3. **Code in JavaScript1** passa esses valores para o Buscar Extrato.
4. **Buscar Extrato** busca transações do Pluggy no intervalo `fromDate` até `toDate`.
5. **Code in JavaScript** filtra:
   - Busca todos os `id_unicos` existentes na tabela.
   - Exclui qualquer transação cujo `id_unico` já existe.
   - Exclui transações com data anterior à última.
6. **Create a row** insere apenas transações novas (sem duplicatas).

---

## Resultado Esperado

✅ **Pega todas as novas transações:** Se a última transação é de hoje, busca desde hoje. Se é de outro dia, busca do dia seguinte.

✅ **Não insere duplicatas:** Verifica todos os `id_unicos` existentes antes de inserir, garantindo que nenhuma transação já existente seja inserida novamente.

✅ **Workflow roda sem erro:** Receber Variáveis desativado, Merge com 2 entradas funcionando corretamente.

---

## Como Testar

1. Importe o workflow corrigido no n8n.
2. Execute manualmente uma vez.
3. Verifique:
   - Se trouxe todas as transações novas (não só 3).
   - Se não tentou inserir duplicatas (sem erro de duplicate key).
   - Se a última transação na tabela é realmente a mais recente do Pluggy.
