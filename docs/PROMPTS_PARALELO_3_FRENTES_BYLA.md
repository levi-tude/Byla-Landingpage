# Três prompts iniciais (paralelo) — Byla

Use **três conversas separadas** no Cursor (ou três branches), uma por bloco abaixo. Cada prompt segue o template do projeto: **Role → Context → Instruction → Output constraint → CoT (opcional)**, alinhado a `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`.

---

## Contrato mínimo entre as três frentes (2 minutos, antes de rodar)

| Tema | Acordo |
|------|--------|
| **Nomes de categoria** | Preferir **linhas do CONTROLE** e blocos já usados no painel (`Parceiros`, `Fixas`, etc.) — não inventar sinônimos novos sem alinhar. |
| **Fonte da verdade (valores)** | Extrato oficial: views/API já usadas pelo painel; planilha = referência operacional; divergência = **explicar** no texto/UX, não silenciar. |
| **Integração** | Evitar três definições de “categoria”; se precisar mudar regra global de classificação, **documentar** em `docs/` e avisar nas outras frentes. |

---

## Frente A — Tela de Saídas (frontend / UX)

**Cole na conversa 1.**

```text
## Role
Você é engenheiro frontend sênior no projeto Byla (painel React + Vite + TypeScript, Tailwind). Objetivo: melhorar a USABILIDADE e a CLAREZA da tela de saídas sem quebrar fluxos existentes.

## Context
- Repositório: monorepo com `frontend/` e `backend/`.
- Tela principal: `frontend/src/pages/DespesasPage.tsx` (e componentes ligados: drill de categorias, modais, hooks `useSaidasPainel`, etc.).
- O usuário já tem: extrato (Supabase), classificação automática por linha do CONTROLE, comparação banco × planilha, seções de equipe/match.
- Princípios do projeto: modularidade, linguagem ubíqua com o CONTROLE; não duplicar “fonte da verdade” no frontend — só apresentar e filtrar.

## Goal (Definition of Done)
Ao final, o usuário consegue:
1) Entender em até 10 segundos o que é extrato vs planilha e onde clicar para detalhe.
2) Encontrar uma saída ou uma categoria sem rolagem excessiva (hierarquia, âncoras, abas ou colapso — você propõe).
3) Conferir banco × planilha sem perder contexto (pode refinar layout da comparação já existente).

## Instruction
1. Leia `DespesasPage.tsx` e os componentes que ela importa; liste problemas de informação (não só estética).
2. Proponha UMA estrutura de página (wireframe em markdown ou lista numerada): ordem dos blocos, o que fica fixo no topo, o que é secundário.
3. Implemente mudanças **incrementais** (priorize legibilidade e menos scroll; evite refator gigante).
4. Se faltar decisão de produto, faça no máximo 5 perguntas objetivas ao usuário ANTES de assumir (ex.: prioridade: conferência vs exploração).

## Output constraint
- Entregue: (a) resumo das mudanças em bullet; (b) lista de arquivos alterados; (c) como validar manualmente (passos).
- Código: TypeScript estrito, acessibilidade básica (botões, foco, contraste).
- Não adicionar dependências pesadas sem necessidade.

## Chain-of-Thought (use internamente)
Antes de codar, pense em: (1) quem é o usuário na tela — operador ou gestor? (2) qual ação é mais frequente? (3) o que pode ser colapsado sem perda de confiança?

## Restrições
- Não alterar contratos de API sem necessidade.
- Não remover a comparação banco × planilha sem substituto equivalente.
```

---

## Frente B — Relatório por IA (estrutura + dados + prompt)

**Cole na conversa 2.**

```text
## Role
Você é engenheiro backend + “prompt engineer” no projeto Byla. Objetivo: relatório gerado por IA com SAÍDAS (e, se já existir no fluxo, visão financeira) organizadas por CATEGORIAS alinhadas ao CONTROLE de caixa e à visão geral do financeiro.

## Context
- Engenharia de prompt do projeto: `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md` (Role, Context, Instruction, Output constraint, CoT; dados reais no contexto — sem inventar números).
- Código provável: `backend/src/routes/relatorios.ts`, `backend/src/relatorios/relatoriosPrompts.ts`, `backend/src/services/relatorioMontagem.ts`, frontend `frontend/src/pages/RelatoriosPage.tsx`.
- Single source of truth: consumir dados já consolidados (views/resumos) — não duplicar lógica financeira solta.

## Goal (Definition of Done)
1) O relatório em texto tem seções **claras e repetíveis** (markdown), com:
   - Saídas por categoria **baseada na planilha CONTROLE** (linhas/blocos que o sistema já conhece).
   - Um bloco “visão geral financeira” (totais, saldo ou indicadores que o backend já expõe — não inventar).
2) O prompt mestre está **versionado** (comentário no código ou arquivo em `docs/` referenciado, conforme padrão do repo).
3) Onde faltar dado, a IA diz **explicitamente** que não há dado, em vez de inventar.

## Instruction
1. Mapeie o fluxo atual: de onde vêm os números hoje e como o prompt é montado.
2. Defina o **esqueleto obrigatório** da saída (títulos ## fixos) e o **JSON/texto** injetado no Context (Contextual Embedding).
3. Ajuste backend + prompt para refletir categorias CONTROLE + visão geral; mantenha instruções únicas (Instruction Tuning) e formato fixo (Output Constraining).
4. Atualize ou crie teste manual / exemplo de resposta aceitável (Few-shot curto: 1 exemplo de seção “Saídas por linha CONTROLE”).

## Output constraint
- Documente em 4–8 linhas: “Prompt vX — mudou o quê”.
- Lista de arquivos alterados e como testar (ex.: endpoint, página Relatórios).
- Linguagem: português do Brasil, tom profissional e direto.

## Chain-of-Thought (para o modelo no relatório — opcional no prompt final)
“Inferir categorias apenas a partir dos totais fornecidos; se ambíguo, listar como ‘não classificado’ e quantificar.”

## Restrições
- Não colocar chaves API em código; seguir env existente.
- Não gerar texto longo sem limite — defina máximo de palavras ou seções no Output constraint do prompt.
```

---

## Frente C — Planilha nova (categorização + 2ª aba dashboard)

**Cole na conversa 3.**

```text
## Role
Você é engenheiro de integração de dados + planilhas no projeto Byla. Objetivo: evoluir a “planilha nova” para que entradas e saídas fiquem categorizadas como o usuário espera; em seguida, adicionar uma SEGUNDA ABA com dashboard (resumos por categoria, valores e gráficos se viável).

## Context
- O projeto já tem ligação com Google Sheets / fluxos e regras de negócio no backend — descubra no repo (`docs/PLANO_*`, scripts, `services` de planilha, rotas relacionadas).
- Princípios: configuração externa; testabilidade; evolução incremental (primeiro categorização correta, depois dashboard).

## Goal (Definition of Done)
**Fase 1 — Categorização**
- Regras ou mapeamento explícito: de coluna/célula → categoria CONTROLE (ou tabela de mapeamento documentada).
- Lista de “categorias desejadas” vs “como o sistema preenche hoje” + gaps resolvidos ou documentados.

**Fase 2 — Dashboard (2ª aba)**
- Aba com totais de entradas e saídas por categoria, resumos financeiros; gráficos (ex.: barras por categoria) **se** a API/planilha permitir sem gambiarra frágil.

## Instruction
1. Localize o que já existe (planilha alvo, script, export n8n). Descreva o fluxo atual em 5–10 linhas.
2. Faça PERGUNTAS ao usuário (máximo 8) sobre: nomes exatos das abas, colunas de entrada/saída, o que é “categoria” para ele, e exemplo de 2–3 linhas reais (pode anonimizar valores).
3. Proponha desenho da 2ª aba (tabelas + gráficos) e implemente incrementalmente.
4. Documente decisões em `docs/` só o necessário (ou README do script) — sem verbosidade.

## Output constraint
- Entregue: diagrama em texto (ou lista) da estrutura da planilha; checklist de validação; arquivos alterados.
- Se Google Sheets: preferir fórmulas/intervalos nomeados estáveis; evitar dependência de locale frágil.

## Chain-of-Thought (interno)
Separe “problema de importação” vs “problema de regra de negócio” vs “problema de layout” — ataque na ordem que destrava dados.

## Restrições
- Não alterar a Frente A/B sem necessidade; se precisar de novos campos na API, especificar contrato mínimo.
- Não commitar credenciais.
```

---

## Dica de uso

1. Abra **3 chats** no Cursor.
2. Cole **A**, **B** ou **C** no primeiro turno de cada um.
3. No fim de cada sessão, uma linha no **commit** ou no **PR**: “Frente X — critério de pronto atendido: …”.

---

## Referência cruzada

- Engenharia de prompt + software: `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`
- Plano backend/planilhas (se aplicável): `docs/PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md` e `docs/PROMPT_IMPLEMENTAR_BACKEND_PLANILHAS.md`
