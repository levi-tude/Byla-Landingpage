# 🚀 Guia Rápido: Implementar Update Pluggy no n8n

## ⚡ Implementação Passo a Passo

### Passo 1: Adicionar Node de Update do Pluggy

**Localização:** Entre o node de autenticação e o node de buscar extrato

**Configuração:**
- **Tipo:** HTTP Request
- **Método:** POST
- **URL:** `https://api.pluggy.ai/items/{{ $env.PLUGGY_ITEM_ID }}/update`
- **Headers:**
  ```
  X-API-KEY: {{ $env.PLUGGY_API_KEY }}
  Content-Type: application/json
  ```
- **Body:** `{}` (JSON vazio)

**Nome do Node:** `Update Pluggy Item`

---

### Passo 2: Adicionar Node de Validação do Update

**Localização:** Logo após o node de Update

**Configuração:**
- **Tipo:** Code (JavaScript)
- **Código:** Copiar do arquivo `n8n-code-snippets.js` → Seção 1

**Nome do Node:** `Validar Update Iniciado`

---

### Passo 3: Adicionar Node de Espera

**Localização:** Após validação

**Configuração:**
- **Tipo:** Wait
- **Wait For:** Amount of Time
- **Amount:** `3`
- **Unit:** Minutes

**Nome do Node:** `Aguardar Processamento`

**Nota:** Você pode ajustar para 2-5 minutos conforme necessário.

---

### Passo 4: Adicionar Node de Verificação de Status

**Localização:** Após o Wait

**Configuração:**
- **Tipo:** HTTP Request
- **Método:** GET
- **URL:** `https://api.pluggy.ai/items/{{ $env.PLUGGY_ITEM_ID }}`
- **Headers:**
  ```
  X-API-KEY: {{ $env.PLUGGY_API_KEY }}
  ```

**Nome do Node:** `Verificar Status do Item`

---

### Passo 5: Adicionar Node IF para Verificar se Está Atualizado

**Localização:** Após verificação de status

**Configuração:**
- **Tipo:** IF
- **Condição:** 
  ```
  {{ $json.status }} === "UPDATED"
  ```

**Nome do Node:** `Item Atualizado?**

**Caminho SIM:** Continua para buscar extrato  
**Caminho NÃO:** Pode aguardar mais ou retornar erro

---

### Passo 6: (Opcional) Adicionar Retry se Ainda Estiver UPDATING

**Localização:** No caminho NÃO do IF

**Configuração:**
- **Tipo:** Wait (mais 2 minutos)
- **Tipo:** HTTP Request (verificar status novamente)
- **Tipo:** IF (verificar novamente)

**Nome do Node:** `Retry Update`

**Limite:** Máximo 2-3 tentativas

---

### Passo 7: Modificar Node de Buscar Extrato

**Localização:** Após confirmação de atualização

**Garantir que está usando:**
- URL correta: `https://api.pluggy.ai/transactions`
- Parâmetros: `itemId`, `from`, `to`, `page`, `pageSize`
- Headers com `X-API-KEY`

**Nome do Node:** `Buscar Extrato Atualizado`

---

## 🔄 Fluxo Completo Atualizado

```
Schedule Trigger
    ↓
HTTP Request - Autenticação Pluggy
    ↓
HTTP Request - POST /items/{itemId}/update  ← NOVO
    ↓
Code - Validar Update Iniciado              ← NOVO
    ↓
Wait - Aguardar 3 minutos                   ← NOVO
    ↓
HTTP Request - GET /items/{itemId}          ← NOVO
    ↓
IF - Status === "UPDATED"?                 ← NOVO
    ↓ SIM
HTTP Request - Buscar Extrato
    ↓
Code - Normalizar dados
    ↓
Aggregate
    ↓
Split Out
    ↓
Edit Fields
    ↓
Supabase - Create Row
```

---

## ⚙️ Variáveis de Ambiente Necessárias

No n8n, configure estas variáveis:

```bash
PLUGGY_API_KEY=sua_chave_aqui
PLUGGY_ITEM_ID=id_do_item_aqui
```

**Como configurar no n8n:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione as variáveis acima
3. Use `{{ $env.PLUGGY_API_KEY }}` nos nodes

---

## 🧪 Testando a Implementação

### Teste 1: Verificar se Update é Iniciado

1. Execute o fluxo manualmente
2. Verifique o output do node "Validar Update Iniciado"
3. Deve retornar `success: true` e `status: "UPDATING"`

### Teste 2: Verificar se Aguarda Corretamente

1. Execute o fluxo
2. Observe o tempo de espera (deve aguardar 3 minutos)
3. Verifique logs se houver

### Teste 3: Verificar Status Após Espera

1. Execute o fluxo completo
2. Verifique o output do node "Verificar Status do Item"
3. Status deve ser `"UPDATED"` após a espera

### Teste 4: Verificar Se Novas Transações São Capturadas

1. Execute o fluxo completo
2. Verifique no Supabase se transações de fevereiro aparecem
3. Compare com o banco real

---

## 🐛 Troubleshooting

### Problema: Status sempre retorna "UPDATING"

**Solução:**
- Aumentar tempo de espera para 5 minutos
- Verificar se a conta Pluggy está ativa
- Verificar logs da API Pluggy

### Problema: Status retorna "LOGIN_ERROR"

**Solução:**
- Verificar credenciais no Pluggy
- Pode ser necessário reautenticar a conta
- Verificar se a conta bancária ainda está conectada

### Problema: Ainda não retorna transações novas

**Solução:**
- Verificar se o `from` e `to` estão corretos na busca
- Verificar se o itemId está correto
- Verificar logs da API Pluggy
- Tentar fazer update manual via API primeiro

### Problema: Erro 429 (Rate Limit)

**Solução:**
- Adicionar delay entre requisições
- Reduzir frequência do Schedule Trigger
- Implementar retry com backoff exponencial

---

## 📊 Monitoramento Recomendado

Adicione nodes de log para monitorar:

```javascript
// Code node para log
console.log('📅 Update iniciado:', new Date().toISOString());
console.log('📊 Status:', $input.item.json.status);
console.log('🆔 Item ID:', $input.item.json.itemId);
```

---

## ✅ Checklist de Implementação

- [ ] Node de Update adicionado
- [ ] Node de Validação adicionado
- [ ] Node de Wait configurado (3 minutos)
- [ ] Node de Verificação de Status adicionado
- [ ] Node IF configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Fluxo testado manualmente
- [ ] Novas transações sendo capturadas
- [ ] Logs funcionando

---

## 🎯 Próximos Passos Após Implementação

1. ✅ Validar que novas transações estão sendo capturadas
2. ⏳ Ajustar frequência do Schedule Trigger (diário? semanal?)
3. ⏳ Implementar relatórios mensais
4. ⏳ Implementar relatórios por pessoa
5. ⏳ Adicionar IA para categorização
6. ⏳ Implementar envio por WhatsApp

---

## 📚 Arquivos de Referência

- `n8n-code-snippets.js` - Códigos JavaScript prontos
- `n8n-pluggy-update-implementation.md` - Detalhes técnicos
- `validacao-deduplicacao.md` - Validação da estratégia
- `proximos-passos-planejamento.md` - Roadmap completo
