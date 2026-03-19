# Verificação da aba PILATES MARINA

Garantir que **100% dos dados** da aba Pilates da planilha FLUXO DE CAIXA BYLA estejam no sistema.

## O que foi implementado

### 1. Leitura completa de colunas (A:Z)
- Abas em blocos (incluindo **PILATES MARINA**) passaram a ser lidas com range **A:Z** em vez de A:J.
- Todas as colunas da planilha são trazidas para o sistema (ALUNO, WPP, RESPONSÁVEIS, PLANO, MATRICULA, VENC, VALOR, etc. e qualquer outra coluna presente).

### 2. Parser mais robusto
- **Cabeçalho:** reconhecimento de ALUNO, **CLIENTE**, NOME e WPP/TELEFONE/WHATSAPP nas primeiras 12 colunas (não só nas 5 primeiras).
- **Nome do aluno:** preenchimento de `nome` a partir de ALUNO, CLIENTE ou NOME.
- **Colunas normalizadas:** CLIENTE/NOME viram ALUNO para consistência; RESPONSAVEIS → RESPONSÁVEIS; OBS. → OBSERVAÇÕES.
- **Linhas ignoradas:** além de “Sub total”, também “Subtotal” e “TOTAL” para não contar como aluno.

### 3. Regra ativos/inativos
- **PILATES MARINA:** linha limite de ativos = **32** (até a linha 32 = ativos; após = inativos), conforme regra de negócio.

### 4. Endpoint de verificação
- **GET** `/api/planilha-fluxo-byla/verificar-aba?aba=PILATES%20MARINA`
- Resposta: `rowCount`, `ativos`, `inativos`, `linhaLimiteAtivos`, `colunas`, `amostra` (10 primeiras linhas).
- Use para conferir se a leitura da aba está correta e se os totais batem com a planilha.

### 5. Fallbacks de leitura
- Se o range com nome da aba (ex.: `'PILATES MARINA'!A:Z`) falhar com “Unable to parse range”, o backend tenta:
  - `batchGet` com o mesmo range;
  - range limitado `'PILATES MARINA'!A1:Z1000`.

## Como conferir na planilha

1. Abra a planilha **FLUXO DE CAIXA BYLA** no Google Sheets.
2. Vá na aba **PILATES MARINA** (nome exato, com espaço).
3. Confira:
   - Quantas linhas de dados (alunos) existem (ativos até a linha 32, depois inativos).
   - Quais colunas existem (A até Z ou além).
4. Chame o endpoint de verificação (com o backend rodando):
   ```bash
   curl "http://localhost:3001/api/planilha-fluxo-byla/verificar-aba?aba=PILATES%20MARINA"
   ```
5. Compare:
   - `rowCount` = total de linhas de alunos no sistema.
   - `ativos` = quantidade até a linha 32.
   - `inativos` = quantidade após a linha 32.
   - `colunas` = lista de colunas lidas (deve refletir as colunas da planilha).
   - `amostra` = primeiras 10 linhas para validar conteúdo.

## Se ainda der erro “Unable to parse range”

- O nome da aba no Google Sheets pode ter diferença (espaço, acento, caractere invisível).
- Confira o nome exato: **Configurações do projeto** → **API** → **GET /api/planilha-fluxo-byla/abas** e veja como “PILATES MARINA” aparece na lista.
- Se o nome for outro (ex.: “Pilates Marina” ou “Pilates”), podemos adicionar alias ou ajuste por nome no backend.

## Resumo

- **Dados da planilha:** leitura em **A:Z**, parser com CLIENTE/NOME e normalização, limite de ativos na linha 32.
- **Conferência:** uso do endpoint **verificar-aba** para validar contagem, colunas e amostra e garantir que os dados da aba Pilates estejam 100% no sistema.
