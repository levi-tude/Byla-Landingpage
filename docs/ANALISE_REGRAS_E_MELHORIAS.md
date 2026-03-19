# Análise completa: regras de negócio e melhorias (Byla)

Com base em `REGRAS_FONTES_SUPABASE_PLANILHAS.md`, `PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md` e no estado atual do painel.

---

## 1. Regras de negócio (resumo)

| Domínio | Fonte principal | Uso das planilhas |
|--------|------------------|-------------------|
| **Extrato, saldo, entradas/saídas, totais por período** | Supabase | Não usadas. Verdade financeira oficial = Supabase (n8n/Pluggy). |
| **Alunos, matrículas, modalidades** | Planilhas (complemento) | FLUXO DE CAIXA BYLA (aba ATENDIMENTOS e abas por modalidade): priorizar ou enriquecer; Supabase como fallback. |
| **Pendências de pagamento** | Planilhas (complemento) | Informações mais verificadas na planilha; cruzar com Supabase quando útil. |
| **Totais mensais “secretária”** | Planilha CONTROLE DE CAIXA | Abas por mês (MARÇO 26, JANEIRO 26, etc.): Entrada Total, Saída Total, LUCRO TOTAL; usado para comparação/complemento à visão Supabase. |

**Duas planilhas:**

1. **FLUXO DE CAIXA BYLA** (ID 1sAgj...) – Abas: ATENDIMENTOS, BYLA DANÇA, PILATES MARINA, TEATRO, YOGA, G.R., etc.  
   Uso: alunos, matrículas, modalidades (fonte principal quando disponível).

2. **CONTROLE DE CAIXA** (ID 11q_K4...) – Abas por mês: JULHO 25, AGOSTO 25, … MARÇO 26.  
   Uso: totais do mês (Entrada Total, Saída Total, LUCRO TOTAL, entradas parceiros, gastos fixos, etc.).

---

## 2. Melhorias implementadas (ou planejadas)

### 2.1 Seleção de mês/ano em todo o painel

- **Visão Geral:** seletor de mês/ano; KPIs e gráficos passam a refletir o mês escolhido; variação vs mês anterior.
- **Entradas, Conciliação, Atividades, Despesas, Alunos:** filtro de mês/ano onde fizer sentido (Supabase por período; planilha CONTROLE por aba do mês).
- **Fonte de verdade:** Supabase já possui `v_resumo_mensal_oficial` com histórico; frontend filtra por (mes, ano) selecionado. Planilha CONTROLE DE CAIXA: backend lê a aba do mês correspondente (ex.: MARÇO 26).

### 2.2 Aproveitar as duas planilhas ao máximo

- **Backend**
  - `GET /api/fluxo-completo?mes=3&ano=2026`: ler aba do mês na planilha CONTROLE DE CAIXA (ex.: MARÇO 26).
  - Mapeamento mes/ano → nome da aba: 1→JANEIRO, 2→FEVEREIRO, … 12→DEZEMBRO; ano 2026→26.
  - Parser robusto para localizar Entrada Total, Saída Total e LUCRO TOTAL em qualquer coluna da aba.
- **Frontend**
  - Visão Geral: além do resumo Supabase, exibir bloco “Totais da planilha (CONTROLE DE CAIXA)” para o mês selecionado quando o backend estiver configurado.
  - Alunos: manter dados da planilha FLUXO DE CAIXA BYLA (ATENDIMENTOS) e totais da CONTROLE DE CAIXA com seletor de mês.
  - Conciliação/Atividades: quando houver dados por mês, usar o mesmo seletor global de mês/ano.

### 2.3 Consistência e UX

- Contexto global de mês/ano (ex.: `MonthYearContext`) para que todas as telas possam usar o mesmo mês selecionado.
- Atalhos “Mês atual” e “Mês anterior” na tela de Entradas (além dos campos de data).
- Indicar claramente a origem dos dados: “Supabase”, “Planilha (ATENDIMENTOS)” ou “Planilha (CONTROLE – mês X)”.

---

## 3. Referências

- `docs/REGRAS_FONTES_SUPABASE_PLANILHAS.md`
- `docs/PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md`
- `docs/DUAS_PLANILHAS_CONFIG.md` (IDs e abas)
