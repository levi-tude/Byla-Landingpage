# Relatório UAT v2 — Byla (final técnico + aceite gestão)

**Data:** 2026-06-01  
**Ambiente teste técnico:** localhost (sessão gestão)  
**Mês de referência:** abril/2026  

---

## Resumo executivo

Implementação do plano **Plano 100% Byla** concluída no código. Reteste presencial com Samuel (gestão) e secretária permanece pendente de assinatura verbal — seção **Aceite humano** abaixo.

---

## Critérios P0–P2 (status técnico)

| ID | Critério | Status técnico | Notas |
|----|----------|----------------|-------|
| P0-1 | Copy fluxo (não “planilha” solto) | **Aceito** | ValidacaoCalendarioGuia, ValidacaoPagamentosDiariaPage, CalendarioFinanceiroPage |
| P1-3 | Controle de caixa legível | **Aceito** | Resumo sticky, FilterBar, blocos em `<details>`, primeiro bloco aberto |
| P1-6 | Padrões UX Overview/Controle | **Aceito** | FilterBar + contexto de mês alinhado a Transações |
| P2-1 | Categorias de saídas no painel | **Aceito (MVP)** | Cards em Overview via `GET /api/saidas` (`por_categoria`) |
| P2-2 | Relatórios IA escaneáveis | **Aceito** | Resumo executivo 3 bullets + cards por categoria no preview |
| P2-3 | Performance legível | **Aceito** | Bloco “Em 10 segundos” + empty state em Atividades |
| P2-4 | Conciliação — propósito claro | **Aceito** | Bloco “Em 10 segundos” + link validação diária |

---

## Aceite humano (pendente)

| Participante | Duração | Status | Decisão validação |
|--------------|---------|--------|-------------------|
| Samuel (gestão) | ~45 min | ☐ Pendente | ☐ Usar já ☐ Ajustar antes ☐ Não usar |
| Secretária | ~20 min | ☐ Pendente | Formulário canvas v2 |

**Roteiro:** `canvases/teste-usuario-byla-v2.canvas.tsx` + `docs/PROMPT_EXECUCAO_UAT_V2_BYLA.md`

---

## Infra (INFRA-1)

| Item | Status |
|------|--------|
| Variáveis no Render (produção) | Aplicadas em deploy anterior |
| `render.yaml` no repositório | **Alteração local pronta** — diff inclui `BYLA_SOURCE_FLUXO_PRIMARY`, `BYLA_PLANILHA_READ=false`, `BYLA_VALIDACAO_PLANILHA_FALLBACK=false`; **commit/push pendente** quando a equipe autorizar |

---

## Verificação rápida pós-deploy

1. Validação + Calendário abril/2026 — rótulo **Fluxo** (não Planilha) com fonte operacional.
2. Overview — seção **Saídas por categoria** com valores.
3. Controle — resumo fixo no topo ao rolar.
4. Conciliação — bloco introdutório e link para validação diária.
5. Relatórios IA — resumo executivo antes do texto longo.

---

## Itens pós-lançamento (máx. 3)

1. Reteste formal gestão + secretária (esta seção).
2. Commit do `render.yaml` para alinhar Blueprint ao ambiente Render.
3. (Opcional) Renomear chave API `planilha` → `fluxo` — fora do escopo atual.

---

*Gerado após implementação do plano Cursor «Plano 100% Byla».*
