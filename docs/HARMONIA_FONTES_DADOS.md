# Harmonia das fontes de dados – Byla

O sistema usa **três fontes** em conjunto. Todas devem estar configuradas e acessíveis para o uso completo; quando uma falha, o backend aplica fallbacks e o frontend exibe o status.

---

## 1. As três fontes

| Fonte | Uso no sistema | Variáveis de ambiente (backend) |
|-------|----------------|----------------------------------|
| **Supabase** | Financeiro oficial: extrato, saldo, entradas/saídas, resumo mensal, conciliação. Fallback para alunos/modalidades/pendências quando as planilhas falham. | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| **Planilha 1 – FLUXO DE CAIXA BYLA** | Alunos, matrículas, modalidades, pendências (aba ATENDIMENTOS e, se existir, Modalidades/Pendencias). Dados mais verificados pela secretária. | `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_ALUNOS_RANGE` (ex.: `ATENDIMENTOS!A:Z`). Opcional: `GOOGLE_SHEETS_MODALIDADES_RANGE`, `GOOGLE_SHEETS_PENDENCIAS_RANGE` |
| **Planilha 2 – CONTROLE DE CAIXA** | Totais do mês (Entrada total, Saída total, Lucro) por aba (ex.: MARÇO 26). Usado para comparação operacional, não substitui o saldo do Supabase. | `GOOGLE_SHEETS_FLUXO_ID`, `GOOGLE_SHEETS_FLUXO_RANGE` (ex.: `MARÇO 26!A:Z`). Aba é definida por mês/ano na API. |

---

## 2. Como a harmonia funciona

- **Visão Geral / Entradas / Conciliação:** dados financeiros vêm do **Supabase**. Totais da planilha CONTROLE DE CAIXA aparecem em bloco separado (planilha 2).
- **Alunos:** lista principal da **planilha 1** (ATENDIMENTOS). Se a planilha falhar ou estiver vazia, usa **Supabase** (tabela alunos). Totais do mês vêm da **planilha 2** (fluxo-completo).
- **Modalidades e Pendências:** mesma regra: **planilha 1** prevalece (abas Modalidades / Pendencias, se existirem); senão **Supabase** (atividades, v_reconciliacao_mensalidades).

Nada é “só Supabase” ou “só planilha”: onde a regra diz “planilha prevalece”, o backend tenta a planilha primeiro e, em caso de erro ou vazio, devolve dados do Supabase e opcionalmente `sheet_error` no JSON.

---

## 3. Verificar se as fontes estão sendo usadas

1. **Backend:** conferir `.env` com os IDs corretos das duas planilhas e do Supabase (ver `docs/DUAS_PLANILHAS_CONFIG.md` e `docs/VERIFICACAO_PLANILHAS.md`).
2. **Endpoint de status:** `GET /api/fontes` retorna:
   - `supabase.ok`: Supabase acessível
   - `planilha1.ok` / `planilha2.ok`: leitura das duas planilhas OK
   - `planilha1.erro` / `planilha2.erro`: mensagem em caso de falha (ex.: aba inexistente, arquivo não compartilhado)
3. **Frontend:** na **Visão geral**, o bloco “Status das fontes de dados” mostra Supabase, FLUXO DE CAIXA BYLA e CONTROLE DE CAIXA com ✓ ou ✗.

Se as duas planilhas e o Supabase estiverem com ✓, todas as fontes estão em harmonia e sendo usadas.

---

## 4. Resumo das rotas e fontes

| Rota (backend) | Planilha 1 | Planilha 2 | Supabase |
|----------------|------------|------------|----------|
| `/api/alunos-completo` | ✓ ATENDIMENTOS | — | fallback |
| `/api/modalidades-completo` | ✓ Modalidades (ou env) | — | fallback |
| `/api/pendencias-completo` | ✓ Pendencias (ou env) | — | fallback |
| `/api/fluxo-completo` | — | ✓ aba do mês | — |
| `/api/fontes` | ✓ teste leitura | ✓ teste leitura | ✓ teste |

Extrato, saldo, entradas e resumo oficial vêm do frontend chamando o **Supabase diretamente** (não passam por essas rotas).
