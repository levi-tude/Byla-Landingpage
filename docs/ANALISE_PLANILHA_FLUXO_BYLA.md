# Análise detalhada: planilha FLUXO DE CAIXA BYLA

Documento de referência para integração com a planilha **FLUXO DE CAIXA BYLA**: estrutura, abas, regras de negócio e protocolo de leitura.

---

## 1. Contexto da empresa Byla

- **Espaço Byla**: atividades (dança, pilates, etc.) com alunos matriculados por modalidade.
- **Financeiro**: entradas (mensalidades, outros), saídas, fechamento de caixa por mês.
- **Secretária/operação**: controle de alunos atuais/antigos, ativos/inativos, quem paga ou não, por modalidade.

A planilha FLUXO DE CAIXA BYLA é usada pela secretária e pelo financeiro e contém **várias abas**, cada uma podendo representar:
- Uma visão geral (ex.: ATENDIMENTOS).
- Uma **modalidade/categoria** (ex.: BYLA DANÇA, PILATES MARINA) com a lista de alunos daquela modalidade.

---

## 2. Regra do fechamento de caixa (CONTROLE DE CAIXA)

Na planilha **CONTROLE DE CAIXA** (outra planilha):

- **A aba do mês M contém os dados do mês M-1.**  
  Ex.: aba "MARÇO 26" = fechamento do caixa de **fevereiro/26**.
- O sistema deve mapear: “período desejado (mes, ano)” → “aba a ler = mês seguinte”.  
  Ex.: usuário escolhe Fev/26 → leitura da aba "MARÇO 26".

Implementado em `backend/src/domain/MesAno.ts` (`mesAnoParaAbaControleDeCaixa`).

---

## 3. Estrutura esperada da planilha FLUXO DE CAIXA BYLA

### 3.1 Abas

- **ATENDIMENTOS**: possivelmente lista geral ou consolidada de atendimentos.
- **Por modalidade**: uma ou mais abas por atividade (ex.: BYLA DANÇA, PILATES MARINA, etc.).
- Outras abas podem existir (resumos, outras planilhas internas). O protocolo deve permitir **listar todas as abas** e decidir quais ler (todas ou por configuração).

### 3.2 Colunas comuns (a normalizar)

Em cada aba, a primeira linha costuma ser cabeçalho. Nomes podem variar entre abas. Mapeamento sugerido:

| Conceito        | Possíveis nomes na planilha     | Campo normalizado |
|----------------|----------------------------------|-------------------|
| Nome do aluno  | CLIENTE, Cliente, nome, Nome, Aluno | `nome` |
| Modalidade     | MODALIDADE, Modalidade, MODALIDADE , Atividade | `modalidade` |
| Plano/valor    | PLANO, Plano, VALOR, Valor       | `plano` / `valor` |
| Data venc.     | DATA \\VEN, DATA VEN, Data Venc. | `data_vencimento` |
| Status pagamento | Status, Pago, Situação        | `status_pagamento` |
| Observações    | OBSERVAÇÕES, Obs, Observações   | `observacoes` |
| Parceiro       | PARCEIRO, Parceiro              | `parceiro` |

Cada linha lida deve receber também:
- **`_aba`**: nome da aba de origem (ex.: "ATENDIMENTOS", "BYLA DANÇA").
- **`_modalidade_aba`**: quando a própria aba é a modalidade, pode ser igual a `_aba`.

### 3.3 Alunos: atuais, antigos, ativos, inativos, pagam/não pagam

- **Atuais vs antigos**: pode vir de coluna explícita ou de convenção (ex.: abas diferentes, ou coluna "Situação").
- **Ativos vs inativos**: idem (coluna "Status", "Ativo", "Inativo", ou inferido por presença em lista).
- **Pagam / não pagam**: coluna de status de pagamento ou observações.

O backend deve:
- Ler todas as abas configuradas (ou todas exceto blacklist).
- Manter **origem (aba)** em cada registro.
- Não descartar linhas por não terem todas as colunas; preencher com vazio quando faltar.
- Expor filtros/agrupamentos (por modalidade, por aba) no frontend ou em endpoints específicos.

---

## 4. Protocolo de análise e leitura

### Fase 1 – Descoberta

1. Chamar **Google Sheets API** `spreadsheets.get` (ou `listSheetNames`) para a planilha FLUXO BYLA.
2. Listar todos os nomes de abas.
3. (Opcional) Permitir configurar abas a **excluir** (ex.: "Resumo", "Instruções") ou **incluir** (lista fixa).

### Fase 2 – Leitura por aba

1. Para cada aba a considerar:
   - Ler range `{NomeDaAba}!A:Z` (ou range configurável).
   - Primeira linha = cabeçalho; normalizar nomes (trim, maiúsculas/minúsculas conforme convenção).
   - A partir da segunda linha, montar objetos com chaves normalizadas + `_aba`.
2. Concatenar todas as linhas de todas as abas em uma única lista (ou manter separado por aba para o frontend agrupar).

### Fase 3 – Normalização

1. Para cada linha, garantir pelo menos: `nome` (ou equivalente), `modalidade` (ou `_aba`), `_aba`.
2. Deduplicação: **não** remover duplicatas automaticamente (o mesmo aluno pode aparecer em mais de uma aba/modalidade). O frontend ou relatório pode agrupar por nome depois.
3. Campos de status (ativo/inativo, paga/não paga) preservados como vierem, para exibição e filtros.

### Fase 4 – Uso no sistema

- **Alunos (tela/API)**: passar a consumir essa lista consolidada (todas as abas) em vez de só ATENDIMENTOS.
- **Modalidades**: lista de modalidades = conjunto de `modalidade` + conjunto de `_aba` (abas que são modalidades).
- **Totais / Lucro**: continuam no CONTROLE DE CAIXA (com regra aba M = mês M-1) e no Supabase.

---

## 5. Configuração (backend)

- **GOOGLE_SHEETS_SPREADSHEET_ID**: ID da planilha FLUXO DE CAIXA BYLA.
- **GOOGLE_SHEETS_ALUNOS_RANGE**: range padrão para “uma aba só” (ex.: `ATENDIMENTOS!A:Z`) – usado como fallback.
- (Futuro) **GOOGLE_SHEETS_ABAS_ALUNOS**: lista de abas a ler (ex.: `ATENDIMENTOS,BYLA DANÇA,PILATES MARINA`). Se vazio, ler **todas** as abas (exceto blacklist opcional).

---

## 6. Implementação no backend

- **Listagem de abas:** `GET /api/planilha-fluxo-byla/abas` retorna os nomes de todas as abas (para conferência).
- **Alunos de todas as abas:** Com `GOOGLE_SHEETS_ALUNOS_TODAS_ABAS=true` (padrão), `GET /api/alunos-completo` lê cada aba da planilha FLUXO BYLA, adiciona `_aba` e `_modalidade_aba` em cada linha e retorna a lista consolidada. Abas com nome em RESUMO, INSTRUÇÕES, etc. são ignoradas.
- **Normalização:** Cada linha ganha `nome` a partir de CLIENTE/Cliente/nome/ALUNO quando existir.
- **Resposta:** Inclui `abas_lidas` com os nomes das abas de onde vieram dados.

---

## 7. Resumo

| Tema                    | Regra / decisão |
|-------------------------|------------------|
| CONTROLE DE CAIXA      | Aba M = dados do mês M-1. Lucro incluído nos totais. |
| FLUXO BYLA – abas      | Múltiplas abas (ATENDIMENTOS + uma por modalidade). Ler todas (ou lista configurável). |
| FLUXO BYLA – colunas   | Normalizar cabeçalhos; manter `_aba` e `_modalidade_aba`. |
| Alunos atuais/antigos  | Preservar colunas de status; não deduplicar por nome. |
| Fonte oficial financeira | Supabase + totais da planilha CONTROLE DE CAIXA (lucro incluso). |

Este documento deve ser seguido na implementação e mantido atualizado quando a estrutura da planilha ou as regras de negócio mudarem.
