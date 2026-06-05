# Prompt: Competência, validação fluxo × extrato e totais por aba

Documento para **decisão aprovada + implantação**. Use o prompt mestre abaixo em sessões de implementação.

---

## Decisões do gestor (aprovadas)

| # | Pergunta | Decisão |
|---|----------|---------|
| 1 | Fechamento do Controle | **Os dois** — toggle **Caixa \| Competência** |
| 2 | Adiantamento | Conta **só no mês da mensalidade** (competência), **não** no mês em que caiu o PIX |
| 3 | Repasse / saída início do mês | **Sugestão** de mês anterior (ex.: pago dias 1–10) — **nunca automático**; secretária **valida** |
| 4 | Duplicata (2× mesma competência) | **Só avisar**; manualmente escolhem qual transação é de qual mês |

**Regra transversal:** competência = **sugerida + confirmada**. Nada de gravar mês anterior em saída sem clique explícito.

---

## Prompt mestre (copiar e colar)

```
Contexto: sistema financeiro Byla (escola/estúdio BYLA). Decisões do gestor já aprovadas (ver tabela acima).

### Problema A — Entradas (mensalidades / PIX)
Mesma pessoa pode pagar **2+ vezes no mesmo mês civil** (atraso ou adiantamento).
Hoje: classificamos pagador → categoria, mas **não** qual **competência** (mês da mensalidade) pertence a **cada** PIX.
Adiantamento: entra no **mês da mensalidade**, não no mês do extrato.
Duplicata: **avisar** se dois PIX apontarem a mesma competência; usuário corrige manualmente.

### Problema B — Saídas (repasses / despesas)
Pagamentos no início do mês (dias 1–10) muitas vezes referem o **mês anterior**.
Hoje: Despesas usa só a **data do extrato**.
Regra: **sugerir** competência (ex.: mês anterior se dia ≤ 10 em categorias de repasse) — **obrigatório confirmar**; nunca aplicar sozinho.

### Problema C — Fluxo de caixa × extrato (novo)
Secretária lança pagamentos no **Fluxo de caixa operacional** (`/fluxo-caixa`).
Precisamos saber, **por pagamento lançado no fluxo**, se foi **validado com o extrato** (OK com banco), como já existe parcialmente na **Validação diária** e no **Calendário**.
Deve funcionar em:
- visão **mensal** do fluxo (já tem status pago/pendente por competência, mas **sem** OK banco por célula);
- visão **multi-mês** (grade 12 meses — idem).

Além disso: **totais por mês** de quanto **deveria entrar** (soma dos lançamentos do fluxo) **por aba e por modalidade** — para dimensionar receita esperada vs extrato/Controle.

### O que o Byla já tem (reaproveitar)
- `mes_competencia`, `ano_competencia` em `fluxo_pagamentos_operacionais`.
- Validação diária: match planilha/fluxo ↔ banco + vínculos persistidos (`validacao_vinculos`).
- Calendário: `status_contagem` ok/atencao/divergente por dia.
- Conciliação vencimentos: `banco_confirmado` por aluno/competência.
- Fluxo multi-mês: `GET /fluxo-operacional/resumo-multi-mes` — status pago/pendente/parcial, **sem** flag validado extrato.
- Índice ano: `GET /fluxo-operacional/validacao-indice-ano` — datas e totais do fluxo, **sem** cruzamento banco por linha.

### Gaps
1. Competência **por transação bancária** em Entradas/Despesas + Controle com toggle caixa/competência.
2. No fluxo (mensal + multi-mês): coluna/célula **Validado extrato** (ok / pendente / divergente) **por pagamento** ou por célula mês-aluno.
3. Painel **totais fluxo por mês × aba × modalidade** (esperado no fluxo).

### Tarefas de implementação
1. MVP competência Entradas + Despesas (E2 + S2) conforme decisões.
2. Integrar status validação extrato no fluxo mensal e multi-mês (reusar regra/vínculos da validação).
3. API + UI totais por aba/modalidade/mês (competência do fluxo).
4. Controle: toggle caixa | competência; sync repasses usa competência efetiva.
5. UAT: 1 mês com atraso, adiantamento, repasse dia 5, fluxo lançado vs extrato.

Restrições:
- Extrato = fonte oficial de **caixa** (data real).
- Competência = sugestão + confirmação humana (entradas e saídas).
- UX secretária: poucos cliques; badges claros quando data ≠ competência.
```

---

## Análise rápida

### Em uma frase

Três camadas: **(1)** quando caiu no banco, **(2)** de qual mês é a mensalidade/repasse, **(3)** o que a secretária lançou no fluxo **bate** com o extrato.

### A — Entradas

| Situação | Data no banco | Competência (mensalidade) |
|----------|---------------|---------------------------|
| Atraso | 05/mar | fevereiro |
| Normal | 05/mar | março |
| Adiantado | 28/mar | **abril** (não março) |

Dois PIX no mês → competências **distintas**; se repetir competência → **alerta**, correção manual.

### B — Saídas

| Situação | Data no banco | Competência sugerida | Gravação |
|----------|---------------|----------------------|----------|
| Repasse dia 5/fev | 05/fev | janeiro | Só após **Confirmar** |
| Conta dia 15/fev | 15/fev | fevereiro | Default = mês da data |

**Não fazer:** regra automática “dia ≤ 10 = mês anterior” sem confirmação.

### C — Fluxo × extrato

| O que secretária vê hoje | O que falta |
|--------------------------|-------------|
| Multi-mês: pago / pendente / parcial | **Validado com extrato?** (✓ / ? / ✗) |
| Validação diária: OK do dia | Mesmo status **dentro do fluxo**, por linha/mês |
| Calendário: status por dia | Totais **fluxo** por aba/modalidade/mês |

**Status proposto por pagamento (ou célula aluno×competência):**

| Status | Significado |
|--------|-------------|
| `validado` | Vínculo validação ou match automático confirmado (mesma regra da validação diária) |
| `pendente` | Lançado no fluxo, ainda sem match no extrato |
| `divergente` | Valor/data/nome não batem; precisa ação |
| `sem_lancamento` | Célula vazia (só multi-mês) |

Link rápido: “Abrir validação” com `?data=` do pagamento.

---

## MVP recomendado (3 frentes)

### Frente 1 — Competência no extrato (Entradas + Despesas)

**Entradas**
- Campo **Mês de referência** por transação (destaque se qtd > 1 no grupo).
- Sugestão: vínculo Validação → `mes_competencia` fluxo; senão → mês da data.
- Adiantamento: sugerir mês **futuro** da mensalidade; só entra no Controle na competência escolhida.
- Alerta (não bloqueio) se duas transações com mesma competência.

**Despesas**
- Mesmo campo; sugestão repasse (dia 1–10 → mês anterior) como **chip “Sugerido: jan” + Confirmar**.
- Nunca gravar competência alternativa sem confirmação.

**Controle**
- Toggle **Caixa | Competência** no topo.
- Sync repasses usa competência **confirmada**.

**Dados:** `mes_competencia_efetivo`, `ano_competencia_efetivo`, `competencia_confirmada` por `transacao_id` (tabela `transacao_competencia` ou similar).

**APIs:**  
`PATCH /api/entradas/transacoes/:id/competencia`  
`PATCH /api/despesas/transacoes/:id/competencia`

---

### Frente 2 — OK extrato no Fluxo de caixa

**Backend**
- Endpoint: enriquecer pagamentos do fluxo com `status_extrato`, `transacao_banco_id`, `validacao_vinculo_id`.
- Reutilizar: `validacao_vinculos`, match da validação diária, conciliação (±7 dias, ±0,01, nome).
- Estender `resumo-multi-mes` e listagem mensal do fluxo com campos de validação.

**Frontend (`FluxoCaixaOperacionalPage`)**
- Visão **mensal**: badge ✓ / ⏳ / ⚠ por pagamento ou por linha de aluno.
- Visão **multi-mês**: ícone na célula do mês (além de pago/pendente).
- Tooltip: data banco, pessoa, link validação.

**Critério:** pagamento lançado no fluxo marcado `validado` iff existe vínculo ou match confirmado igual à validação diária.

---

### Frente 3 — Totais fluxo por aba × modalidade × mês

**Objetivo:** “Em março/2026, BYLA DANÇA · Infantil deve entrar R$ X pelo fluxo.”

**Backend**
- `GET /api/fluxo-operacional/totais-competencia?ano=&mes=&agrupar=aba|modalidade|aba_modalidade`
- Soma `valor` de `fluxo_pagamentos_operacionais` por `mes_competencia` + `ano_competencia` (não data pagamento).
- Opcional: coluna **validado** vs **pendente** no total.

**Frontend**
- Bloco resumo no fluxo (mensal + multi-mês): tabela aba → modalidade → total competência do mês.
- Comparativo opcional: total fluxo vs total extrato validado (fase 2).

---

## Como o mercado resolve (síntese)

| Abordagem | Uso |
|-----------|-----|
| **Caixa + competência** (ERP) | Dois eixos; humano confirma competência |
| **Sugestão + confirmação** | Conciliação bancária; nosso padrão para saídas |
| **Operacional vs banco** | Escolas: lançamento operacional + status “reconciled” |
| **Regra fixa automática** | Folha — **rejeitado** pelo gestor para saídas Byla |

---

## Critérios de aceite

**Competência**
- [ ] Toggle Caixa | Competência no Controle
- [ ] Adiantamento só na competência da mensalidade
- [ ] Saída: sugestão mês anterior, **confirmação obrigatória**
- [ ] Duplicata mesma competência: **alerta**, escolha manual
- [ ] Validação pré-preenche competência nas entradas

**Fluxo × extrato**
- [ ] Fluxo mensal: status validado/pendente/divergente por pagamento
- [ ] Fluxo multi-mês: mesmo status na célula do mês
- [ ] Link para validação do dia

**Totais**
- [ ] Total por mês de competência, filtrável por aba e modalidade
- [ ] Visível na tela do fluxo (mensal e/ou multi-mês)

---

## Ordem de implementação sugerida

| Fase | Escopo | Prioridade |
|------|--------|------------|
| **1** | Tabela competência + Entradas (transação) + alerta duplicata | Alta |
| **2** | Despesas (sugestão + confirmar) + toggle Controle | Alta |
| **3** | Status extrato no fluxo mensal | Alta |
| **4** | Totais aba/modalidade/mês | Média |
| **5** | Status extrato no multi-mês + comparativo fluxo vs banco | Média |

---

## Próximo passo

1. ~~Gestor responde 4 perguntas~~ **Feito.**
2. Implementar Fase 1 (competência Entradas).
3. Paralelizar Fase 3 (OK extrato no fluxo mensal) — alto valor operacional para secretária.
4. UAT março/2026: 2 PIX mesma pessoa, adiantamento, repasse dia 5, lançamento fluxo vs extrato.
