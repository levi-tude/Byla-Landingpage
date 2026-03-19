# Bounded contexts – Byla

Separação de responsabilidades no sistema, alinhada a `REGRAS_FONTES_SUPABASE_PLANILHAS.md` e ao plano de melhorias.

---

## 1. Contexto “Financeiro oficial”

**Responsabilidade:** Extrato, saldo, entradas/saídas, totais por período. Fonte: **apenas Supabase** (transações e views oficiais).

**No código:**
- Backend: não usa planilhas para essas rotas; frontend pode chamar Supabase direto (visão geral, entradas, conciliação) ou o backend não expõe “extrato” com planilha.
- Views: `v_resumo_mensal_oficial`, `v_entradas_oficial`, `v_reconciliacao_mensalidades`, etc.
- Regra: verdade do que entrou/saiu do caixa = Supabase.

**Evitar:** Misturar dados das planilhas como “fonte oficial” de transações ou saldo.

---

## 2. Contexto “Cadastro e operação”

**Responsabilidade:** Alunos, matrículas, modalidades, pendências de pagamento. Fontes: **planilhas complementam ou prevalecem**; Supabase como fallback ou cruzamento.

**No código:**
- Backend: rotas `/api/alunos-completo`, `/api/modalidades-completo`, `/api/pendencias-completo`; casos de uso e adapters (Supabase + planilhas); regra de merge (planilha prevalece).
- Planilhas: FLUXO DE CAIXA BYLA (aba ATENDIMENTOS), CONTROLE DE CAIXA (abas por mês para totais operacionais).
- Regra: informações “mais verificadas” ou “a mais” vêm das planilhas; backend aplica a regra e expõe um único payload.

**Evitar:** Usar apenas Supabase para lista de alunos/modalidades como fonte principal quando as planilhas estiverem configuradas.

---

## 3. Contexto “Totais da planilha (secretária)”

**Responsabilidade:** Totais do mês da planilha CONTROLE DE CAIXA (Entrada total, Saída total, LUCRO total) para comparação e acompanhamento operacional. **Não** substitui o resumo financeiro oficial do Supabase.

**No código:**
- Backend: rota `/api/fluxo-completo`, caso de uso `GetFluxoCompletoUseCase`, adapter `PlanilhaFluxoAdapter` (+ cache).
- Frontend: bloco “Totais da planilha CONTROLE DE CAIXA” na Visão Geral e em Alunos; sempre identificado como “planilha”, não como “saldo oficial”.

**Evitar:** Tratar esses totais como substitutos do saldo ou do resumo mensal do Supabase.

---

## 4. Mapa de dependências (resumo)

| Contexto              | Fonte principal | Backend (rotas/use cases)     | Frontend (telas)                    |
|-----------------------|-----------------|--------------------------------|-------------------------------------|
| Financeiro oficial    | Supabase        | (front chama Supabase direto)  | Visão Geral, Entradas, Conciliação  |
| Cadastro e operação   | Planilhas + SB  | alunos-completo, modalidades, pendencias | Alunos, (Atividades com dados SB)   |
| Totais planilha       | Planilha        | fluxo-completo                 | Visão Geral, Alunos (bloco fluxo)  |

Ao adicionar novas funcionalidades, classificar em um desses contextos e manter a mesma regra de fonte e responsabilidade.
