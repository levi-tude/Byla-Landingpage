# Validação da Estratégia de Deduplicação

## ✅ Estratégia Atual

### Geração do `id_unico`

```
id_unico = data + descricao + valor
```

**Exemplo:**
```
2026-01-30T10:44:04.000Z-JOSE NILSON ALVES DE OLIVEIRA--133.36
```

## 🔍 Análise da Estratégia

### ✅ Pontos Positivos

1. **Simplicidade**: Fácil de implementar e entender
2. **Eficiência**: Concatenação rápida
3. **Efetividade**: Funciona para a maioria dos casos
4. **Constraint UNIQUE**: Garante integridade no banco

### ⚠️ Possíveis Problemas

#### 1. **Formato de Data Inconsistente**

**Problema:** Se a API retornar datas em formatos diferentes:
- `2026-01-30T10:44:04.000Z` (ISO)
- `2026-01-30` (apenas data)
- `30/01/2026` (formato brasileiro)

**Solução:** Normalizar sempre para ISO antes de gerar `id_unico`

```javascript
// Normalizar data para ISO
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString();
};
```

#### 2. **Descrição com Caracteres Especiais**

**Problema:** Descrições podem ter caracteres que causam problemas:
- Espaços múltiplos
- Caracteres especiais (ç, ã, etc.)
- Quebras de linha

**Solução:** Normalizar descrição

```javascript
const normalizeDescription = (desc) => {
  return desc
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços -> um espaço
    .toUpperCase() // Padronizar case
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacríticos
};
```

#### 3. **Valor com Precisão Decimal**

**Problema:** Valores podem ter diferenças de precisão:
- `133.36`
- `133.360`
- `133.3600`

**Solução:** Normalizar valor para 2 casas decimais

```javascript
const normalizeValue = (value) => {
  return parseFloat(value).toFixed(2);
};
```

#### 4. **Transações com Mesma Descrição e Valor no Mesmo Dia**

**Problema:** Se houver duas transações idênticas no mesmo dia, serão consideradas duplicatas.

**Exemplo:**
- Compra no supermercado às 10h: `133.36`
- Compra no supermercado às 15h: `133.36`

**Solução:** Incluir hora ou ID da transação original

```javascript
// Opção 1: Incluir hora
id_unico = data_completa + descricao + valor

// Opção 2: Incluir ID original do Pluggy
id_unico = data + descricao + valor + transaction_id
```

## 🎯 Estratégia Recomendada (Melhorada)

### Versão 1: Simples (Atual - OK para maioria dos casos)

```javascript
const generateIdUnico = (transaction) => {
  const date = new Date(transaction.date).toISOString();
  const desc = transaction.description.trim();
  const value = Math.abs(parseFloat(transaction.amount)).toFixed(2);
  
  return `${date}-${desc}-${value}`;
};
```

### Versão 2: Robusta (Recomendada)

```javascript
const generateIdUnico = (transaction) => {
  // Normalizar data
  const date = new Date(transaction.date).toISOString();
  
  // Normalizar descrição
  const desc = transaction.description
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Normalizar valor
  const value = Math.abs(parseFloat(transaction.amount)).toFixed(2);
  
  // Incluir ID original se disponível (para casos edge)
  const originalId = transaction.id || '';
  
  return `${date}-${desc}-${value}-${originalId}`;
};
```

### Versão 3: Com Hash (Mais Segura)

```javascript
const crypto = require('crypto');

const generateIdUnico = (transaction) => {
  const date = new Date(transaction.date).toISOString();
  const desc = transaction.description.trim();
  const value = Math.abs(parseFloat(transaction.amount)).toFixed(2);
  const originalId = transaction.id || '';
  
  // Criar hash para garantir unicidade
  const hashInput = `${date}-${desc}-${value}-${originalId}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16);
  
  return hash;
};
```

## 📊 Testes Recomendados

### Casos de Teste

1. ✅ Transação única → deve inserir
2. ✅ Transação duplicada → deve ignorar
3. ✅ Mesma descrição, valores diferentes → devem inserir ambas
4. ✅ Mesmo valor, descrições diferentes → devem inserir ambas
5. ✅ Mesma transação em horários diferentes → depende da estratégia
6. ✅ Valores com precisão diferente → devem ser normalizados

### Query SQL para Validar

```sql
-- Verificar duplicados no banco
SELECT id_unico, COUNT(*) as count
FROM transacoes
GROUP BY id_unico
HAVING COUNT(*) > 1;

-- Deve retornar 0 linhas se tudo estiver OK
```

## ✅ Conclusão

**Estratégia atual está FUNCIONAL**, mas pode ser melhorada:

1. **Mantenha a atual** se está funcionando bem
2. **Melhore a normalização** se encontrar problemas
3. **Adicione ID original** se precisar distinguir transações idênticas no mesmo dia

**Recomendação:** Implementar Versão 2 (Robusta) para maior confiabilidade.
