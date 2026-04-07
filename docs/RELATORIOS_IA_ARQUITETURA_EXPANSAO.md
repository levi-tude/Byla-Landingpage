# Relatórios gerados por IA — Arquitetura expandida (validação antes da implementação)

**Status:** **validado e em evolução no código** (payloads, endpoints, IA, UI; PDF no painel). Este documento registra decisões de produto e engenharia.

**Objetivo:** passar de relatórios **simples** (um JSON + prompt genérico) para um **catálogo de relatórios** com **profundidade alinhada às regras de negócio** do Byla, **rastreabilidade de fonte** (banco / planilha / sistema) e **engenharia de prompt** explícita.

**Documentos já existentes que este arquivo estende (não substitui):**

- `RELATORIOS_IA_OBJETIVOS.md` — payloads atuais (mensal, trimestral, anual) e prompt base.
- `RELATORIOS_ENTRADAS_SAIDAS_PROPOSTA_APROVACAO.md` — diário, mensal, trimestral (entradas/saídas).
- `ENGENHARIA_DE_PROMPT_E_SW_BYLA.md` — Role, Context, Instruction, Output constraint, CoT; princípios de software.
- `PROMPT_RELATORIO_IA_BYLA.md` — prompts versionados do relatório.
- `REGRAS_FONTES_SUPABASE_PLANILHAS.md` — o que é “oficial” e de onde vem.

---

## 1. Visão geral: duas camadas (engenharia de software)

| Camada | Responsabilidade | Por quê |
|--------|------------------|---------|
| **Montagem de dados (determinística)** | Buscar no Supabase, na planilha e nos casos de uso já existentes; calcular totais, listas, comparativos; **marcar origem** de cada bloco. | Números e regras **não** dependem do LLM; auditáveis e testáveis. |
| **Narrativa com IA (probabilística)** | Transformar o JSON em texto executivo, **citando** apenas o que veio no payload; destacar tensões (ex.: divergência banco × planilha) **sem inventar** valores. | Onde o modelo agrega valor: interpretação, priorização, linguagem. |

Isso alinha-se a **Clean Architecture** (regra de negócio e dados no núcleo; IA como adaptador de apresentação) e a boas práticas de **IA financeira**: cálculos e totais fora do modelo; LLM com **temperatura baixa** para narrativa; **saída estruturada** em seções (mesmo que o texto seja prosa).

### 1.1 Legenda obrigatória de fonte (em todo relatório)

Toda seção numérica ou lista no JSON deve permitir que a IA (e o usuário) saiba:

| Código | Significado |
|--------|-------------|
| **`banco`** | Dados derivados de `transacoes` / views oficiais no Supabase (extrato), após filtros do sistema (ex.: `filtrarTransacoesOficiais`). |
| **`planilha`** | Dados da planilha FLUXO / CONTROLE DE CAIXA (ou abas específicas), via `GetFluxoCompletoUseCase` / leitura de pagamentos. |
| **`sistema`** | **Combinação explícita** ou **regra** aplicada nos dois (ex.: “priorizar planilha quando preenchida”, conciliação); sempre documentar qual regra em `fontes.regra_usada` ou equivalente. |

O texto gerado pela IA deve **repetir** essa convenção (ex.: “*Total de entradas (fonte: banco — transações oficiais)* …”).

---

## 2. Catálogo de tipos de relatório (matriz)

| ID | Nome | Periodicidade | Foco principal | Fontes típicas | Complexidade |
|----|------|----------------|----------------|------------------|--------------|
| **R1** | Mensal executivo — entradas e saídas | Mês | Resumo financeiro, comparativo mês anterior, lucro | Banco + planilha + sistema | Média (já existe; enriquecer) |
| **R2** | Mensal operacional — “o espaço no mês” | Mês | Operação: atividades, modalidades, mensalidades, padrões de receita; **não só** totais | Banco, planilha, agregações por aba/modalidade; **pode** incluir KPIs de conciliação | Alta |
| **R3** | Diário — entradas e saídas com detalhe | Dia | **Quais** entradas e saídas (top N, destaques, categorias); saldo do dia | Quase só **banco** (transações do dia); opcional cruzar com planilha se houver evento no mesmo dia | Média |
| **R4** | Alunos — panorama (snapshot) | Mês ou “hoje” | Cadastro, modalidades, volume de alunos ativos; **sem** necessariamente inadimplência | Planilha + Supabase conforme endpoints existentes | Média |
| **R5** | Alunos — inadimplência / sem pagar no mês | Mês | Quem ficou sem pagar na competência; vencimento; **opcional** status banco (planilha × extrato) | **Sistema** (regra conciliação/vencimento) + planilha | Alta |

**Anual / trimestral:** podem existir como **variantes** de R1 (agregação temporal) — não duplicar lógica; só mudar período e granularidade no payload.

**Exemplo de payload trimestral (R1, agregação):** `GET /api/relatorios/trimestral?trimestre=1&ano=2026` devolve `tipo: "trimestral"`, `trimestre`, `ano`, `meses: [1,2,3]`, `periodo_label` (ex.: `1º trimestre de 2026 (Janeiro–Março)`), totais oficiais e da planilha, `por_mes` com `total_entradas`, `total_saidas`, `saldo` por mês, e `fontes` (resumo oficial + planilha). A IA usa o mesmo roteiro de prompt que o mensal, com título trimestral.

---

## 3. Especificação por relatório (para validação)

### 3.1 R1 — Mensal executivo (refino do atual)

**Objetivo:** manter o relatório mensal atual, mas:

- Incluir `fontes` **por bloco** (`entradas.total_oficial` → `banco`, `total_planilha` → `planilha`, parágrafo comparativo → `sistema` se for merge).
- Seções obrigatórias no JSON: `resumo_executivo`, `entradas`, `saidas`, `lucro`, `comparativo_periodo_anterior`, `destaques`, `alertas_divergencia` (opcional: quando `|oficial - planilha| > tolerância`).

**Implementação:** evoluir `GET /api/relatorios/mensal` e o tipo `RelatorioMensalPayload` sem quebrar o front (campos opcionais).

---

### 3.2 R2 — Mensal operacional (“o espaço no mês”)

**Objetivo:** uma **análise de negócio** do mês, não só fluxo de caixa:

- Distribuição de receitas por **aba/modalidade** (planilha) vs entradas no banco por **categoria/pessoa** quando fizer sentido.
- Indicadores de **saúde operacional**: ex. proporção de receita concentrada, dias com maior entrada (calendário), menção a **metas** só se existirem no payload (não inventar meta).
- **Comentários pedagógicos / qualidade da operação:** permitidos quando sustentados pelos dados (ex.: concentração por modalidade, volume de alunos por aba no JSON); **não** inventar indicadores ou avaliações sem base no payload.
- **Fontes:** sempre explícitas; se um insight depender de **dois** sistemas, marcar `sistema` e listar sub-fontes.

**Payload:** novo tipo `tipo: 'mensal_operacional'` com seções negociais (lista de KPIs + séries agregadas). **Novo endpoint** sugerido: `GET /api/relatorios/mensal-operacional?mes=&ano=` (montagem pesada no backend).

---

### 3.3 R3 — Diário com foco em linhas

**Objetivo:** além do resumo do dia atual (`GET /api/relatorios/diario`), enfatizar:

- **Maiores** entradas e saídas (top N com `pessoa`, `valor`, `descricao`).
- Opcional: **categorização** (se `categoria` existir na transação).
- Bloco `origem_dados: { entradas: 'banco', ... }` explícito.

**Implementação:** estender payload diário com `entradas.itens_destaque`, `saidas.itens_destaque`, `limite_itens` (ex.: 15), `truncado: true/false`.

---

### 3.4 R4 — Relatório de alunos (panorama)

**Objetivo:** texto sobre **quantos alunos**, por **aba/modalidade**, **ativos** (regra de limite por aba já usada no sistema). Fonte principal **planilha** + eventualmente dados combinados.

**Payload:** novo tipo `tipo: 'alunos_panorama'` com totais por aba, lista de modalidades, `regra_ativos` (linha limite por aba em resumo textual vinda do backend, não da IA).

---

### 3.5 R5 — Inadimplência / sem pagar (mensal)

**Objetivo:** lista e resumo de alunos **sem pagamento** na competência **mês/ano**, com vencimento e, se disponível, **status de conciliação com banco** (já existe lógica em `conciliacao-vencimentos`).

**Fontes:** predominantemente **sistema** (regra vencimento + planilha); trechos **banco** quando houver `banco_status`.

**Payload:** novo tipo `tipo: 'alunos_inadimplencia_mes'` com `mes`, `ano`, `kpis`, `itens[]` (aba, modalidade, aluno, situacao, vencimento, mensagem, flags banco).

**Nomes no texto da IA:** **permitido usar nomes completos** dos alunos quando vierem no payload (uso interno operacional). Manter tom profissional; não atribuir culpa de forma pejorativa.

**Sensibilidade:** evitar expor dados desnecessários em **logs** do backend; em **PDF/exportação** do painel, tratar como documento interno — quem exporta é responsável pelo compartilhamento.

---

## 4. Engenharia de prompt (consolidação + referências externas)

O projeto já define **Role, Context, Instruction, Output constraint e CoT** em `ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`. Abaixo, o que **adicionamos** para relatórios **complexos** e financeiros:

### 4.1 Framework ROLES (literatura de prompt financeiro / operacional)

- **R**ole: analista financeiro **e** operacional do Espaço Byla (ou separar dois papéis em R2 se desejar mais foco pedagógico).
- **O**bjective: objetivo do relatório (um por tipo R1–R5).
- **L**imits: máximo de palavras, proibição de inventar números, obrigar menção de fonte por parágrafo.
- **E**vidence: só dados do JSON; se faltar dado, dizer “não informado no payload” em vez de supor.
- **S**afeguards: não dar aconselhamento jurídico/fiscal; não prometer receita futura.

*(Variações “ROLE + Objective + Limits + Safeguards” aparecem em guias de *prompting* para finanças; ver Pertama Partners / ViewValue / Revexpanse.)*

### 4.2 Práticas recomendadas (síntese de pesquisa 2024–2026)

| Prática | Aplicação no Byla |
|---------|-------------------|
| **Saída estruturada** (seções fixas, markdown) | Cada tipo de relatório tem **template de seções** no system prompt; facilita revisão humana e exportação. |
| **Temperatura baixa** (0–0.3) | Narrativa estável; números vêm do JSON, não do “criativo”. |
| **Raciocínio em cadeia explícito (CoT)** apenas no **rascunho interno** ou bloco opcional “*Análise passo a passo (opcional)*” — para não poluir o relatório final. |
| **Citação de fonte** | Cada bullet ou parágrafo com números deve poder ser rastreado a `banco` / `planilha` / `sistema`. |
| **Dados tabulares** | Para LLMs, preferir **JSON compacto** + instrução “não reproduza tabelas gigantes linha a linha; sintetize top N”. |
| **Privacidade** | Dados sensíveis: minimizar nomes em prompts de log; em produção, não enviar dados a modelos sem política de retenção. |

Referências externas úteis (para leitura da equipe):

- [Prompting Guide — CoT, Zero-shot](https://www.promptingguide.ai/) (técnicas gerais).
- Literatura citada no próprio `ENGENHARIA_DE_PROMPT_E_SW_BYLA.md` (Wei et al. CoT; Spring AI patterns).
- Artigos de *financial prompt engineering* (ex.: ViewValue, AI Prompt Finance) — reforçam **traceability** e **terminologia financeira explícita**.

### 4.3 “PDF de engenharia de prompt”

Se você colou um PDF específico no chat, ele **não está anexado neste repositório**. O documento canônico do projeto para isso é **`ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`**. Quando quiser, **cole trechos** do PDF ou anexe o arquivo no repositório; atualizamos este documento com uma seção “Alinhamento ao material do usuário”.

### 4.4 Prompts por tipo (esboço — para implementação futura)

- **System comum:** português BR; não inventar números; citar fonte; se divergência banco/planilha, descrever sem “resolver” conflito.
- **User R1:** JSON + “Gere seções: Resumo, Entradas (com sub-fonte), Saídas, Lucro, Comparativo, Destaques.”
- **User R2:** JSON operacional + “Gere análise do **espaço**: receita por modalidade, concentração, riscos operacionais leves; pode incluir **comentários pedagógicos/operacionais** quando os dados suportarem; sem recomendações financeiras irreais.”
- **User R3:** JSON diário + “Destaque as **maiores** entradas e saídas e o saldo; cite origem banco.”
- **User R4/R5:** JSON alunos + R5 pode **citar nomes completos** conforme payload; R4 minimizar dados desnecessários; respeitar LGPD no uso (armazenamento, base legal, compartilhamento).

---

## 5. Arquitetura técnica sugerida (implementação em fases)

### Fase A — Contratos e payloads

1. Definir schemas TypeScript / Zod para cada novo `tipo` de payload.
2. Endpoints novos: `mensal-operacional`, `alunos-panorama`, `alunos-inadimplencia` (nomes finais a combinar).
3. Manter **retrocompatibilidade** com `gerar-texto-ia` aceitando `tipo` novo no body.

### Fase B — Montagem de dados

1. Reutilizar `GetFluxoCompletoUseCase`, `lerPagamentosPorAbaEAno`, agregações de `conciliacao-vencimentos` (ou serviço compartilhado).
2. Testes unitários com **JSON de ouro** (fixtures) para cada payload.

### Fase C — IA

1. `POST /api/relatorios/gerar-texto-ia`: roteamento por `payload.tipo` para **system + user** diferentes (arquivo `relatoriosPrompts.ts` ou similar).
2. Versionar prompts (`PROMPT_VERSION` no código ou em doc).

### Fase D — Frontend (`RelatoriosPage`)

1. Seletor de **tipo de relatório** (R1–R5).
2. Preview do JSON + texto IA + **legenda de fontes** fixa na UI (não só no texto).

### Fase E — Exportação PDF (painel)

1. **Exportar PDF** via **impressão do navegador** (o usuário escolhe “Salvar como PDF”): bloco só para impressão com cabeçalho (Espaço Byla, tipo, período, data/hora), texto do relatório e legenda de fontes; conteúdo interativo com `no-print`.
2. **Material PDF externo** (se houver): o repositório canônico de engenharia de prompt continua sendo `ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`; se um PDF específico precisar ser espelhado no produto, anexar ou colar trechos e referenciar neste doc.

---

## 6. Decisões registradas (validação)

| Tema | Decisão |
|------|---------|
| **R2 — comentários pedagógicos** | **Sim:** permitidos quando sustentados pelos dados do payload (sem inventar métricas). |
| **R5 — nomes** | **Sim:** o texto da IA pode listar **nomes completos** quando vierem no JSON (uso interno). |
| **Ordem de implementação** | Seguir o que já está no código: **contratos → montagem → IA → UI → PDF**; evoluir com PRs pequenos (testes de contrato e otimizações pontuais depois). |
| **PDF** | **Sim** no painel (Fase E), via impressão/salvar PDF do browser. |

---

## 7. Checklist de aprovação

- [x] Catálogo R1–R5 adequado; **trimestral** coberto como variante R1 (exemplo de payload na §2); tipo `trimestral_operacional` só se surgir necessidade de negócio.
- [x] Legenda `banco` / `planilha` / `sistema` clara para operação.
- [x] Fases A→D (e E para PDF) na ordem acordada.
- [ ] **PDF / material colado no chat:** não há PDF anexado ao repositório; equivalência com documento externo depende de você **anexar ou colar trechos** em `docs/` ou neste arquivo (§4.3).

A implementação segue **por fases**, com PRs pequenos e testes de contrato nos endpoints conforme prioridade.
