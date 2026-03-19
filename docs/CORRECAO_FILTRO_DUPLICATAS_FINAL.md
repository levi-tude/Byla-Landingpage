# Correção Final: Filtro de Duplicatas no Workflow n8n

## Problema Identificado

O workflow estava tentando inserir transações que já existiam na tabela `transacoes`, causando o erro:
```
duplicate key value violates unique constraint "transacoes_id_unico_key"
```

## Causa Raiz

O filtro de duplicatas não estava funcionando porque:
1. **Não estava coletando todos os `id_unicos` existentes** - tentava acessar dados de outro node de forma incorreta
2. **Formato inconsistente do `id_unico`** - poderia gerar formato diferente do que está na tabela

## Correções Implementadas

### 1. Coleta de `id_unicos` Existentes

**Node "Pegar última data":**
- Agora coleta **TODOS** os `id_unicos` da tabela `transacoes` (vindos do "Get many rows")
- Passa essa lista pelo fluxo através do campo `idUnicosExistentes`

**Node "Code in JavaScript1":**
- Recebe `idUnicosExistentes` do "Pegar última data"
- Repassa para o próximo node

**Node "Code in JavaScript" (após Buscar Extrato):**
- Recebe `idUnicosExistentes` do fluxo
- Converte para `Set` para busca rápida
- **Fallback:** Se não conseguir pegar do fluxo, tenta buscar diretamente do "Get many rows"
- **Fallback 2:** Se ainda não conseguir, usa pelo menos o `ultimoIdUnico`

### 2. Filtro Robusto de Duplicatas

O filtro agora verifica duplicatas de **3 formas diferentes**:

1. **Verificação principal:** `Set.has(id_unico)` - busca rápida
2. **Verificação manual:** Loop através de todos os `id_unicos` existentes comparando strings normalizadas
3. **Verificação de backup:** Compara com `ultimoIdUnico` diretamente

### 3. Normalização de Strings

- Todos os `id_unicos` são normalizados com `.trim()` antes da comparação
- Garante que espaços em branco não causem falsos negativos

### 4. Formato Consistente do `id_unico`

A função `gerarIdUnico()` agora:
- Usa o `rawDate` completo (com timestamp) quando disponível
- Mantém o mesmo formato que está na tabela: `"2026-02-12T02:55:28.000Z-PESSOA-VALOR"`

## Como Testar

1. **Importe o workflow atualizado** no n8n:
   - Arquivo: `c:\Users\55719\Downloads\My workflow (Feb 14 at 09_39_43).json`

2. **Execute o workflow manualmente** uma vez

3. **Verifique:**
   - ✅ Não deve aparecer erro de "duplicate key"
   - ✅ Apenas transações **novas** devem ser inseridas
   - ✅ Transações que já existem na tabela devem ser **ignoradas**

4. **Se ainda houver problemas:**
   - Verifique se o "Get many rows" está retornando dados corretamente
   - Verifique se o formato do `id_unico` gerado bate com o formato na tabela
   - Execute o workflow novamente e observe os logs

## Estrutura do Fluxo

```
1. Get many rows (busca todas transações)
   ↓
2. Pegar última data (coleta id_unicos + calcula datas)
   ↓
3. Code in JavaScript1 (repassa id_unicos + datas)
   ↓
4. Merge (combina com Edit Fields1)
   ↓
5. Buscar Extrato (Pluggy API)
   ↓
6. Code in JavaScript (FILTRA duplicatas usando id_unicos)
   ↓
7. Create a row (insere apenas transações novas)
```

## Próximos Passos

Se o problema persistir:
1. Verifique se há transações na tabela com `id_unico` em formato diferente
2. Adicione logs no Code node para debugar quais `id_unicos` estão sendo comparados
3. Verifique se o "Get many rows" está limitado (pode ter limite de registros)
