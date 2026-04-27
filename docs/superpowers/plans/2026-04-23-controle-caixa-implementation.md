# Controle de Caixa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o Controle de Caixa com template mensal automatico, protecao de campos padrao/customizaveis, dashboard profissional e moeda BRL consistente entre Controle e Fluxo.

**Architecture:** Backend passa a gerar e persistir template mensal padrao com metadados por bloco/linha. Frontend usa esses metadados para protecao de exclusao, decisao de customizacao e indicadores de saude. A navegacao mensal usa historico amplo e persistencia local.

**Tech Stack:** Node.js + Express + Zod + Supabase no backend; React + TypeScript + React Query + Tailwind no frontend.

---

### Task 1: Template mensal e metadados no backend

**Files:**
- Create: `backend/src/domain/controleCaixa/template.ts`
- Modify: `backend/src/routes/controleCaixa.ts`
- Modify: `scripts/supabase-schema-controle-caixa.sql`

- [ ] Implementar constante de template padrao (blocos e linhas) com `templateKey`, `isDefault`, `isCustom`, `lockedLevel`.
- [ ] Ajustar GET para auto-criar/persistir mes inexistente usando template.
- [ ] Ajustar PUT para persistir metadados por bloco/linha.
- [ ] Atualizar script SQL com colunas de metadados e defaults retrocompativeis.
- [ ] Validar tipos/compilacao backend.

### Task 2: Contratos frontend e persistencia mensal

**Files:**
- Modify: `frontend/src/services/backendApi.ts`
- Modify: `frontend/src/context/MonthYearContext.tsx`
- Modify: `frontend/src/components/ui/MonthYearPicker.tsx`

- [ ] Atualizar interfaces de `ControleCaixa` para novos metadados e `updatedAt`.
- [ ] Garantir seletor mensal com historico amplo e navegacao rapida.
- [ ] Preservar competencia selecionada em `localStorage`.

### Task 3: UX profissional + governanca no Controle de Caixa

**Files:**
- Modify: `frontend/src/pages/ControleCaixaPage.tsx`
- Reuse: `frontend/src/components/ui/ConfirmDialog.tsx`

- [ ] Adicionar cards de KPI e saude da estrutura (default/custom).
- [ ] Implementar badges visuais de padrao/customizado.
- [ ] Implementar confirmacao forte para exclusao de itens padrao.
- [ ] Implementar modal de decisao ao editar item padrao (manter padrao vs customizar).
- [ ] Adicionar CTA para restaurar template padrao do mes.

### Task 4: Moeda BRL no Controle e Fluxo

**Files:**
- Modify: `frontend/src/pages/ControleCaixaPage.tsx`
- Modify: `frontend/src/pages/FluxoCaixaOperacionalPage.tsx`

- [ ] Garantir formatacao `R$` para todos os campos de dinheiro.
- [ ] Garantir parse robusto para entradas com `R$`, ponto e virgula.
- [ ] Garantir placeholders e `inputMode` apropriados.

### Task 5: Verificacao final

**Files:**
- Modify: `docs/superpowers/specs/2026-04-23-controle-caixa-design.md` (se necessario para observacoes finais)

- [ ] Rodar build frontend e checks de lint.
- [ ] Rodar build/typecheck backend.
- [ ] Revisar diff final e confirmar que cobre os requisitos aprovados.
