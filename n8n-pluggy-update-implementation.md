# Implementação: Update Pluggy no n8n

## 🔧 Solução para o Problema de Atualização

### Fluxo Corrigido

```
Schedule Trigger
    ↓
HTTP Request - Autenticação Pluggy
    ↓
HTTP Request - POST /items/{itemId}/update
    ↓
Code - Verificar status do update
    ↓
Wait Node - Aguardar processamento (2-5 minutos)
    ↓
HTTP Request - Verificar status do item
    ↓
IF Node - Status = UPDATED?
    ↓ SIM
HTTP Request - Buscar Extrato
    ↓
Code - Normalizar dados
    ↓
... (resto do fluxo atual)
```

## 📝 Detalhes de Implementação

### 1. Node: Update Item Pluggy

**Tipo:** HTTP Request  
**Método:** POST  
**URL:** `https://api.pluggy.ai/items/{itemId}/update`

**Headers:**
```
X-API-KEY: {{ $env.PLUGGY_API_KEY }}
```

**Body:** (vazio ou JSON vazio `{}`)

**Response esperado:**
```json
{
  "id": "item-uuid",
  "status": "UPDATING",
  "connector": {...}
}
```

### 2. Node: Verificar Status (Code)

**Tipo:** Code (JavaScript)

```javascript
// Verifica se o update foi iniciado com sucesso
const updateResponse = $input.item.json;

if (updateResponse.status === 'UPDATING' || updateResponse.status === 'UPDATED') {
  return {
    json: {
      success: true,
      itemId: updateResponse.id,
      status: updateResponse.status,
      message: 'Update iniciado com sucesso'
    }
  };
} else {
  throw new Error(`Falha ao iniciar update. Status: ${updateResponse.status}`);
}
```

### 3. Node: Wait

**Tipo:** Wait  
**Duração:** 3-5 minutos (180-300 segundos)

**Nota:** O Pluggy precisa de tempo para processar. Recomendado: 3 minutos mínimo.

### 4. Node: Verificar Status do Item

**Tipo:** HTTP Request  
**Método:** GET  
**URL:** `https://api.pluggy.ai/items/{itemId}`

**Headers:**
```
X-API-KEY: {{ $env.PLUGGY_API_KEY }}
```

**Response esperado:**
```json
{
  "id": "item-uuid",
  "status": "UPDATED", // ou "UPDATING", "LOGIN_ERROR", etc.
  ...
}
```

### 5. Node: IF - Verificar se está atualizado

**Tipo:** IF

**Condição:**
```
{{ $json.status }} === "UPDATED"
```

**Se verdadeiro:** Continua para buscar extrato  
**Se falso:** Pode aguardar mais ou retornar erro

### 6. Node: Buscar Extrato (atualizado)

**Tipo:** HTTP Request  
**Método:** GET  
**URL:** `https://api.pluggy.ai/transactions?itemId={itemId}&from={fromDate}&to={toDate}`

**Parâmetros:**
- `from`: Data inicial (ex: 30 dias atrás)
- `to`: Data atual
- `page`: 1
- `pageSize`: 500

## 🔄 Estratégia de Retry

Se o status ainda estiver `UPDATING` após a espera:

1. Aguardar mais 2 minutos
2. Verificar novamente
3. Máximo 3 tentativas
4. Se falhar, registrar erro e continuar com dados antigos

## ⚙️ Variáveis de Ambiente Necessárias

No n8n, configure:
- `PLUGGY_API_KEY`: Sua chave da API Pluggy
- `PLUGGY_ITEM_ID`: ID do item/conta bancária

## 📊 Monitoramento

Adicione logging para:
- Status do update
- Tempo de espera
- Quantidade de transações encontradas
- Erros durante o processo
