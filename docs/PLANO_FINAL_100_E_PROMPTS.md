# Plano final para 100% + prompts de execução

Documento baseado no UAT v2 (`docs/PROMPT_EXECUCAO_UAT_V2_BYLA.md`) e no que **ainda não está completo**.  
Objetivo: fechar lacunas de produto, UX e adoção para a gestão considerar o painel **pronto para uso diário**.

---

## O que ainda NÃO está completo (lista explícita)

| # | Item | Tipo | Por que ainda não está 100% |
|---|------|------|-----------------------------|
| 1 | Textos “planilha” na validação/calendário | Código (UI) | Dados vêm do fluxo Supabase, mas a interface ainda fala “planilha” → confusão (P0-1 parcial) |
| 2 | Padrões visuais em Overview e Controle | Código (UI) | Só Transações (e parte do Fluxo) usam `FilterBar`/`KpiStrip` (P1-6 parcial) |
| 3 | Controle de caixa mais legível | Código (UI) | Resumo no topo existe, mas blocos abaixo ainda intimidam (P1-3 parcial) |
| 4 | Categorias de saídas no painel | Código + dados | Pedido no UAT v1; não há categorização clara em Transações/saídas (P2-1 aberto) |
| 5 | Conciliação — adoção e clareza | UX + processo | Funciona tecnicamente, gestão marcou “não usar”; falta microcopy e reteste (P2-4) |
| 6 | Relatórios IA | UX | Nota 3 no v1; não melhorado neste ciclo (P2-2) |
| 7 | Performance / benchmark | UX | Nota 3 no v1; não melhorado neste ciclo (P2-3) |
| 8 | Reteste gestão (Samuel) | Processo | Validacao promovida no teste técnico, mas gestão não revalidou formalmente |
| 9 | Reteste secretária | Processo | Formulário v2 não preenchido; feedback verbal só parcial |
| 10 | `render.yaml` com env de validação | Infra | Variáveis aplicadas no Render; arquivo no repo pode não estar commitado (INFRA-2) |
| 11 | UAT v2 formal documentado | Processo | Falta relatório final em `docs/` após reteste humano |

**Fora do escopo “100% rápido” (opcional depois):** renomear campo JSON `planilha` → `fluxo` na API (quebra compatibilidade); fundir validação+calendário em uma tela só com abas.

---

## Visão das fases (ordem recomendada)

```text
Fase A (1–2 dias)  → Copy “fluxo” + Controle legível     → desbloqueia confiança na validação
Fase B (2–4 dias)  → Padrões UX Overview/Controle       → sensação de produto único
Fase C (3–5 dias)  → Categorias de saídas               → pedido forte da gestão
Fase D (1–2 dias)  → Conciliação + Relatórios + Perf.   → fechar módulos medianos
Fase E (½ dia)     → Infra + commit render.yaml
Fase F (1 sessão)  → UAT humano v2 + relatório final    → aceite oficial
```

---

## Fase A — Linguagem clara (validação e calendário)

### O que é (simples)

Trocar na **tela** tudo que o usuário lê como “planilha” para **“fluxo operacional”** ou **“pagamentos do fluxo”**, mantendo o significado: lado dos pagamentos lançados no sistema (não o extrato do banco).

### Por que importa

Samuel deu **nota 1** em validação por não entender o propósito. Os dados já estão certos; o texto ainda sugere Google Sheets.

### Arquivos principais

- `frontend/src/components/validacao/ValidacaoCalendarioGuia.tsx`
- `frontend/src/pages/ValidacaoPagamentosDiariaPage.tsx` (strings visíveis ao usuário)
- `frontend/src/pages/CalendarioFinanceiroPage.tsx` (labels “Planilha” nos cards → “Fluxo”)

### Critério de pronto

- Nenhum texto **visível** na validação/calendário diz só “planilha” sem contexto “fluxo”.
- Calendário: rótulo do dia **“Fluxo”** (não “Planilha”) quando `fonte_pagamentos === fluxo_operacional`.
- UAT v2: **P0-1 = aceito**.

### Prompt A — Copy fluxo × banco

```markdown
## Papel
Você é dev frontend no projeto Byla (React + TypeScript + Tailwind). Escopo mínimo: apenas textos visíveis ao usuário.

## Contexto
- Fonte real dos pagamentos: `fluxo_pagamentos_operacionais` (Supabase).
- API ainda usa chave JSON `planilha` internamente — NÃO renomear tipos/campos da API nesta tarefa.
- UAT reprovou validação por confusão “planilha Google” vs “fluxo operacional”.

## Tarefa
1. Em `ValidacaoCalendarioGuia.tsx`, substituir copy do checklist e cards:
   - “planilha × banco” → “fluxo operacional × banco” ou “pagamentos do fluxo × extrato”.
2. Em `CalendarioFinanceiroPage.tsx`, onde o usuário vê “Planilha” nos dias do calendário e totais, usar **“Fluxo”** quando meta indica fluxo_operacional.
3. Em `ValidacaoPagamentosDiariaPage.tsx`, revisar apenas strings em JSX (títulos, empty states, tooltips) — não renomear `ValidacaoDiariaPlanilhaItem`.
4. Manter “Banco” / “Extrato” para o lado `transacoes`.

## Restrições
- Não alterar lógica de conciliação, fetch ou tipos em `backendApi.ts`.
- Não mudar nomes de variáveis TypeScript `planilha` se não for exibido ao usuário.
- Português BR, tom direto (gestão + secretária).

## Entrega
- Diff pequeno e listagem das frases antes/depois.
- Checklist manual: abrir validação + calendário abril/2026 e confirmar zero “planilha” solto na UI.
```

---

## Fase B — Controle de caixa mais fácil de ler

### O que é (simples)

Manter o **Resumo do fechamento** em destaque e tornar os blocos de lançamento **menos cansativos** (menos rolagem, blocos colapsados, instrução clara no topo).

### Por que importa

Gestão disse que **controle de caixa** é obrigatório corrigir e deu nota **3/5** — é a ferramenta de fechamento do mês.

### Critério de pronto

- Em viewport ~1280px, resumo + pelo menos um bloco de entrada visível sem rolar muito.
- Texto no topo: “Comece pelo resumo; expanda blocos para lançar valores”.
- UAT: **P1-3 = aceito**.

### Prompt B — Controle de caixa legível

```markdown
## Papel
Dev frontend Byla. Melhorar UX de `ControleCaixaPage.tsx` sem mudar regras de negócio nem schema Supabase.

## Contexto
- Já existe região `Resumo do fechamento` (entradas, saídas, resultado).
- UAT v1: “controle de caixa” obrigatório corrigir; visualização difícil.

## Tarefa
1. Garantir que `Resumo do fechamento` fique sticky ou sempre visível no topo ao rolar (se simples com CSS).
2. Blocos de lançamento: todos colapsados por padrão exceto o primeiro; contador “N blocos”.
3. Reduzir largura mínima da tabela interna se houver scroll horizontal desnecessário.
4. Não remover funcionalidade (adicionar bloco, linha, salvar).

## Restrições
- Reutilizar componentes existentes; não criar design system novo.
- Sem mudanças no backend.

## Entrega
- Descrição em 3 bullets do que mudou para o usuário.
- `npm run build` no frontend sem erro.
```

---

## Fase C — Padrões visuais (Overview + Controle)

### O que é (simples)

Usar os mesmos blocos de **filtros** e **faixa de KPIs** que já existem em Transações (`docs/UX_PATTERNS.md`), para o painel parecer **um produto só**.

### Por que importa

Gestão reclamou que “os dados não estão organizados”. Consistência visual ajuda sem mudar os números.

### Critério de pronto

- `OverviewPage`: seção executiva pode manter `KpiCard`, mas filtros de mês alinhados ao padrão (ou subtítulo único).
- `ControleCaixaPage`: `FilterBar` ou cabeçalho equivalente ao Fluxo/Transações.
- **P1-6 = aceito** ou parcial documentado.

### Prompt C — Padronizar Overview e Controle

```markdown
## Papel
Dev frontend Byla especializado em UX financeiro.

## Contexto
- Componentes em `frontend/src/components/finance/`: FilterBar, KpiStrip, StatusBadge, StateBlocks.
- Piloto completo: `TransacoesPage.tsx`. Fluxo já usa FilterBar parcialmente.
- Overview e Controle ainda heterogêneos.

## Tarefa
1. Ler `docs/UX_PATTERNS.md` e `TransacoesPage.tsx` como referência.
2. `OverviewPage.tsx`: agrupar filtros/contexto de mês de forma consistente; não quebrar 6 KPIs + 3 alertas.
3. `ControleCaixaPage.tsx`: integrar FilterBar leve (título, subtítulo, mês) sem duplicar seletor global do Topbar.
4. Usar `StatusBadge` onde houver badges ad-hoc de status.

## Restrições
- Zero mudança em endpoints ou cálculos.
- Diff focado; não refatorar Fluxo inteiro.

## Entrega
- Lista de páginas tocadas e print mental: o que ficou igual entre Transações e Overview.
```

---

## Fase D — Categorias de saídas

### O que é (simples)

Permitir ver e filtrar **saídas por categoria** (aluguel, funcionários, material, etc.) — no mínimo em Transações ou em uma seção de saídas, usando dados que o backend/relatórios já conhecem.

### Por que importa

Gestão pediu explicitamente no UAT: “não há forma de categorizar despesas”.

### Critério de pronto

- Usuário vê totais por categoria no mês OU edita categoria em saída (se schema permitir).
- Se só leitura: gráfico/tabela “Saídas por categoria” na Visão geral ou Transações (filtro saída).
- **P2-1 = aceito** ou escopo reduzido documentado.

### Prompt D — Categorias de saídas (descoberta + MVP)

```markdown
## Papel
Dev full-stack Byla. Primeiro investigar, depois implementar o menor MVP útil.

## Contexto
- UAT P2-1: categorização de saídas inexistente no painel.
- `RelatoriosPage` já exibe `saidas_por_categoria` de relatório IA.
- Pode existir tabela/campo em Supabase ou planilha CONTROLE — verificar antes de inventar.

## Tarefa — Fase 1 (investigar, 30 min código)
1. Buscar no repo: `categoria`, `saidas_por_categoria`, `despesas`, rotas de saídas.
2. Documentar em 5 linhas: de onde vêm os dados hoje e o que falta.

## Tarefa — Fase 2 (MVP UI)
Escolher UMA opção (a mais barata que funcione):
- A) Card “Saídas por categoria” em `OverviewPage` ou `TransacoesPage` (filtro tipo=saída) consumindo endpoint existente ou novo GET enxuto.
- B) Coluna/filtro `categoria` em transações de saída se campo existir em `transacoes`.

## Restrições
- Não criar 20 categorias hardcoded sem alinhar ao CONTROLE/planilha se já houver lista oficial.
- Backend: rota mínima, sem migration pesada sem necessidade.

## Entrega
- O que foi escolhido (A ou B) e por quê.
- Como testar: mês com saídas, ver pelo menos 3 categorias com valor.
```

---

## Fase E — Conciliação, Relatórios IA, Performance

### O que é (simples)

- **Conciliação:** texto no topo explicando “para que serve” em 1 frase + link para validação diária.
- **Relatórios IA:** layout mais escaneável (resumo no topo, categorias em cards).
- **Performance:** título + legenda “o que este ranking mede” e fonte dos dados.

### Por que importa

Notas medianas (3/5) e “não usar” na adoção de conciliação — não é bug crítico, mas impede **100% de confiança** da gestão.

### Critério de pronto

- Cada tela tem bloco “Em 10 segundos” ou equivalente (pode reutilizar padrão de `ValidacaoCalendarioGuia`).
- Reteste UAT: gestão descreve propósito em 1 frase por tela.

### Prompt E1 — Conciliação clara

```markdown
## Papel
Dev frontend Byla.

## Tarefa
Em `ConciliacaoPage.tsx` (ou rota equivalente):
1. Adicionar bloco curto no topo: propósito = conferir vencimentos/adimplência (não substituir validação diária).
2. Link: “Conferir pagamentos do dia →” para `/validacao-pagamentos-diaria`.
3. Não alterar cálculos existentes.

## Entrega
Texto final em português (3–4 linhas) visível na página.
```

### Prompt E2 — Relatórios IA escaneáveis

```markdown
## Papel
Dev frontend Byla.

## Tarefa
Em `RelatoriosPage.tsx`:
1. Resumo executivo (3 bullets) fixo no topo após gerar relatório.
2. `saidas_por_categoria` em cards ou tabela compacta (já existe parcialmente — melhorar hierarquia).
3. Loading e erro com `ErrorPanel` de `components/finance/StateBlocks.tsx` se existir.

## Restrições
- Não mudar prompt da IA nem backend de geração nesta tarefa.

## Entrega
Antes/depois em bullets.
```

### Prompt E3 — Performance com contexto

```markdown
## Papel
Dev frontend Byla.

## Tarefa
Na página Performance por atividade:
1. Subtítulo: fonte = fluxo operacional, competência = mês do seletor global.
2. Legenda do ranking: o que é “principal modalidade” (ex.: maior receita no mês).
3. Empty state claro se sem dados.

## Entrega
Copy em português colado no PR.
```

---

## Fase F — Infra e documentação

### O que é (simples)

Garantir que `render.yaml` no GitHub tenha as mesmas variáveis de validação já usadas no Render, e gerar relatório UAT v2 após reteste humano.

### Prompt F — Infra render.yaml

```markdown
## Papel
DevOps leve no repo Byla.

## Tarefa
1. Em `render.yaml`, confirmar presença de:
   - BYLA_SOURCE_FLUXO_PRIMARY=true
   - BYLA_PLANILHA_READ=false
   - BYLA_VALIDACAO_PLANILHA_FALLBACK=false
2. Atualizar `docs/SEGURANCA_SIMPLES.md` se necessário (1 parágrafo).
3. Não commitar secrets.

## Entrega
Diff só em render.yaml + doc se preciso.
```

---

## Fase G — Aceite humano (não é código)

### O que é (simples)

Samuel (~45 min) e secretária (~20 min) repetem o roteiro do canvas v2 e marcam aceite. Você gera `docs/RELATORIO_UAT_V2_FINAL.md`.

### Prompt G — Facilitador UAT (processo)

```markdown
## Papel
Facilitador. Não escrever código.

## Tarefa
1. Abrir `canvases/teste-usuario-byla-v2.canvas.tsx` e `docs/PROMPT_EXECUCAO_UAT_V2_BYLA.md`.
2. Ambiente: produção ou localhost com login gestão.
3. Mês: Abril/2026 na validação/calendário.
4. Preencher aceite por critério P0–P2.
5. Gerar `docs/RELATORIO_UAT_V2_FINAL.md` na estrutura da seção 10 do prompt UAT.

## Critério de sucesso
- Validação: decisão “Usar já” ou “Ajustar antes” (não “Não usar”).
- Lista máx. 3 itens ainda pós-lançamento.
```

---

## Prompt “mestre” — rodar o plano inteiro no Cursor

Use **um prompt por fase** (A → G). Não misturar tudo num único chat.

```markdown
Você vai executar o Plano Final 100% do Byla em fases isoladas.

Leia: docs/PLANO_FINAL_100_E_PROMPTS.md

Regra: execute SOMENTE a Fase indicada abaixo. Ao terminar, pare e liste o que falta para a próxima fase.

Fase atual: [A | B | C | D | E1 | E2 | E3 | F | G]

Após cada fase com código:
- `cd frontend && npm run build`
- Atualizar checklist no final deste arquivo (seção Checklist de progresso).

Não fazer deploy nem commit salvo se eu pedir explicitamente.
```

---

## Checklist de progresso (marque ao concluir)

| Fase | Item | Status |
|------|------|--------|
| A | Copy fluxo na UI validação/calendário | ☐ |
| B | Controle de caixa legível | ☐ |
| C | Padrões UX Overview/Controle | ☐ |
| D | Categorias de saídas MVP | ☐ |
| E1 | Conciliação — propósito claro | ☐ |
| E2 | Relatórios IA escaneáveis | ☐ |
| E3 | Performance — legenda/fonte | ☐ |
| F | render.yaml + docs infra | ☐ |
| G | UAT humano + RELATORIO_UAT_V2_FINAL.md | ☐ |

---

## Definição de “100%” para este projeto

| Área | 100% significa |
|------|----------------|
| Validação + Calendário | Gestão entende e usa; dados abril/2026 ok; copy só “fluxo” |
| Fluxo + Transações + Overview | Nota ≥4 no reteste ou “Usar já” |
| Controle | “Ajustar antes” no máximo; resumo claro |
| Conciliação | Pelo menos “Ajustar antes” com propósito claro |
| Categorias saídas | MVP visível no painel |
| Relatórios / Performance | Legível; nota ≥3 aceitável se gestão não usar diariamente |
| Processo | Relatório UAT v2 final assinado verbalmente pela gestão |

---

*Plano alinhado a `docs/PROMPT_EXECUCAO_UAT_V2_BYLA.md` e `docs/RELATORIO_TESTE_GESTAO_2026-05-26.md`.*
