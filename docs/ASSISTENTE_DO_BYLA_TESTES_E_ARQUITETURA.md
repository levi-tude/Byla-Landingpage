# Assistente do Byla — arquitetura, causa raiz, prompt e cenários de teste

Este documento consolida **engenharia de software** (contrato API, camadas, bugfix) e **engenharia de prompt** (instruções do modelo, anti-padrões) para o chat da secretaria.

## 1. Arquitetura (visão em camadas)

| Camada | Responsabilidade | Arquivos principais |
|--------|------------------|---------------------|
| UI | Painel, atalhos, navegação opcional | `frontend/src/components/ai/AccessibilityChatPanel.tsx`, `AccessibilityChatButton.tsx` |
| API cliente | POST `/api/ai/assistant/chat` | `frontend/src/services/backendApi.ts` |
| Rota HTTP | Auth, validação, logs | `backend/src/routes/aiAssistant.ts`, `validation/apiQuery.ts` |
| Orquestração | Classificação de intent, LLM, fallback | `backend/src/services/aiAssistantService.ts` |
| Regras determinísticas | Respostas e ações quando não há LLM | `backend/src/ai/assistantPlaybook.ts` |
| Classificação léxica | Intent + confiança a partir do texto | `backend/src/ai/intentCatalog.ts` |

**Fluxo:** mensagem do usuário → `classifyIntent` → `buildAssistantPlaybookResponse` (fallback estruturado) → tentativa Gemini → Groq → OpenAI → se falhar, usa playbook puro.

## 2. Causa raiz: painel fechava a cada resposta (bug)

### Sintoma

Ao enviar mensagem ou receber resposta, o painel do assistente fechava sozinho.

### Diagnóstico

1. **Conflito semântico no merge da resposta:** em `generateAssistantReply`, quando o LLM retornava texto, o código fazia `{ ...fallback, message: textoDoLlm }`. O `fallback` do playbook inclui quase sempre `actions: [{ navigate → /fluxo-caixa }]`.
2. No frontend, `handleAssistantResponse` executava `runNavigation` quando `actions[0]` era `navigate`, chamando `navigate()` e **`onClose()`**, fechando o painel.
3. Assim, **toda resposta bem-sucedida do LLM** herdava navegação automática e fechava o chat, independentemente do conteúdo da resposta.

### Correção aplicada

- Respostas com texto gerado por LLM passam a usar **`actions: []`** e **`needsConfirmation: false`**, preservando `quickReplies` do playbook.
- Exceção intencional: intent **`abrir_fluxo_caixa`** com confiança mínima mantém `actions` do playbook para quem pede explicitamente para abrir a tela.
- Playbook **`fallback_duvida_operacional`** deixou de incluir navegação obrigatória (`actions: []`) e a mensagem passou a ser um mini-guia, não só perguntas.
- No frontend, **navegação não fecha mais o painel** (o assistente permanece disponível após ir ao Fluxo de Caixa).

## 3. Engenharia de prompt — problemas e melhorias

### Problema observado

O modelo tendia a **responder só com perguntas**, em parte por instrução explícita antiga (“se faltar contexto, faça 1 pergunta”).

### Princípios adotados

1. **Resposta útil primeiro:** passos ou checklist antes de qualquer clarificação.
2. **Uma pergunta só se necessário:** quando sem um dado objetivo não dá para orientar (ex.: nome do aluno).
3. **Uso de contexto:** `rota` e `competência` devem aparecer na orientação (“se você já está no Fluxo…”).
4. **Formato:** português BR, sem markdown, sem asteriscos; no máximo 4 passos numerados.
5. **Identidade:** o assistente é nomeado **Assistente do Byla** nas instruções de sistema e no painel.

### Anti-padrão evitado

Não misturar **texto generativo** com **ações de UI** sem política clara: isso gerou navegação fantasma e fechamento do painel.

## 4. Matriz de cenários de teste (secretaria)

Legenda de resultado esperado:

- **R:** resposta com passos úteis (LLM ou fallback).
- **N:** navegação automática só quando política permitir (`abrir_fluxo_caixa` explícito ou modo fallback com `actions` no playbook).
- **Q:** quick replies coerentes com o intent.

| # | Entrada (exemplo) | Intent esperado (aprox.) | Esperado |
|---|-------------------|--------------------------|----------|
| 1 | “Como lanço uma entrada?” | `fluxo_lancar_entrada` | R, Q; sem fechar painel (LLM). |
| 2 | “Preciso registrar uma saída de caixa” | `fluxo_lancar_saida` | R, Q. |
| 3 | “O saldo não bate com o que anotei” | `fluxo_erro_saldo` | R com checklist de conferência. |
| 4 | “Quero ver o fluxo” / “Abrir Fluxo de Caixa” | `abrir_fluxo_caixa` | R; **pode** navegar para `/fluxo-caixa`; painel permanece aberto. |
| 5 | “Resumo por pagamento” / “totais por Pix” | `fluxo_resumo_pagamento` | R mencionando aba **Resumo por meio de pagamento**. |
| 6 | “Filtrar por período” | `fluxo_filtrar_periodo` | R sobre calendário/período. |
| 7 | “Fechar o mês” | `fluxo_fechamento_mes` | R com checklist de fechamento. |
| 8 | “Excluir um lançamento” | `fluxo_excluir_lancamento` | R; se fallback puro, confirmação antes de ir ao fluxo (playbook). |
| 9 | Mensagem vazia ou só “oi” | `fallback_duvida_operacional` | Mensagem de guia rápido + Q (sem navegar no fallback). |
| 10 | Secretária em `/alunos` pergunta operação de caixa | (vários) | Resposta deve usar `rota` no prompt e ainda assim priorizar passos. |

### Teste de regressão do bug do painel

1. Abrir o Assistente do Byla.
2. Enviar: “Como lanço entrada?”.
3. **Esperado:** painel continua aberto; aparece resposta; não redireciona sozinho (com LLM ativo).
4. Enviar: “Abrir Fluxo de Caixa”.
5. **Esperado:** pode ir para `/fluxo-caixa`; painel **permanece aberto**.

## 5. Melhorias futuras (backlog técnico)

- **Testes automatizados** de `classifyIntent` e de política `withLlmMessage` (snapshot de JSON).
- **Telemetria:** taxa de `providerUsed`, intents mais frequentes, abandono após primeira mensagem.
- **RAG leve:** ancorar respostas em trechos da documentação interna (`docs/ESTRUTURA_ABAS_FLUXO_BYLA.md`, etc.) quando o modelo estiver disponível.

## 6. Referências internas

- Playbook e intents: `backend/src/ai/assistantPlaybook.ts`, `backend/src/ai/intentCatalog.ts`
- Serviço: `backend/src/services/aiAssistantService.ts`
- UI: `frontend/src/components/ai/AccessibilityChatPanel.tsx`

---

*Última atualização: alinhada à correção do merge LLM + actions e ao rebranding “Assistente do Byla”.*
