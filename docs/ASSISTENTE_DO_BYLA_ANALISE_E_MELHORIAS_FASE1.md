# Assistente do Byla - Fase 1 (Fluxo de Caixa + Pendências/Cobranças)

## A) Diagnóstico profundo do estado atual

### Arquitetura atual
- Frontend chama `POST /api/ai/assistant/chat` com contexto de rota, role e competência.
- Backend classifica intenção via `classifyIntent()` e monta fallback via `buildAssistantPlaybookResponse()`.
- Serviço tenta LLM em cascata (`gemini` -> `groq` -> `openai`), com fallback determinístico.
- Frontend executa ação de navegação retornada em `actions` (com confirmação via `ConfirmDialog`).

### Causas-raiz da baixa efetividade observada
- Catálogo de intents incompleto para Pendências/Cobranças.
- Prompt ainda amplo demais, permitindo respostas fora do escopo fase 1.
- Política de ação não estava estritamente alinhada à regra "sempre confirmar".
- Playbook com foco maior em Fluxo geral e menor em operações de cobrança diária.

### Falha em entender intenção vs executar fluxo
- Entendimento: dúvidas de "quem cobrar" e "como agir em pendência" podiam cair em intents genéricas.
- Execução: ação de abrir Fluxo nem sempre era oferecida de forma consistente após resposta útil.

## B) GAP estado atual vs desejado

| Tema | Atual (antes) | Desejado (alvo) | Impacto |
|---|---|---|---|
| Escopo operacional | Misturava Fluxo com temas adjacentes | Foco estrito em Fluxo + Pendências/Cobranças | Alto |
| Intents de cobrança | Parcial | Cobrir "quem cobrar", "cobrar agora", pendência vs cobrança | Alto |
| Confirmação de ação | Parcial/variável | Sempre confirmar navegação/execução | Alto |
| Resposta útil | Boa em alguns casos | Sempre começar com passo a passo direto | Alto |
| Quick replies | Genéricas | Alinhadas ao trabalho da secretária | Médio |
| Medição de qualidade | Básica | Métricas de precisão/resolução/retrabalho | Médio |

## C) Plano técnico de melhoria

### Melhorias implementadas nesta fase
- Prompt reforçado para escopo fase 1 e regra de confirmação explícita.
- Novos intents:
  - `fluxo_pendencias_cobrancas`
  - `fluxo_cobranca_acao`
- Playbook atualizado com instruções operacionais para pendências/cobranças.
- Política de confirmação reforçada:
  - Backend marca `needsConfirmation=true` sempre que há ação.
  - Frontend força confirmação para qualquer `navigate`.

### Regras de decisão operacional
- Responder primeiro com passos (1-4 itens).
- Perguntar só 1 ponto crítico quando sem dado mínimo.
- Sugerir ação de abrir Fluxo quando intenção do escopo for identificada.
- Sempre solicitar confirmação antes de navegar.

### Métricas recomendadas
- Precisão de intenção (% de intents corretas em amostra validada).
- Taxa de resolução na primeira resposta.
- Taxa de confirmação aceita (ações aprovadas/ações sugeridas).
- Taxa de retrabalho (usuário repete a mesma dúvida em até 3 mensagens).

## D) Plano de testes (30 cenários)

Formato: Entrada | Intent esperada | Ação esperada | Confirmação | Critério

1. Como lanço entrada hoje? | fluxo_lancar_entrada | abrir fluxo | sim | passo a passo + oferta de abrir fluxo  
2. Quero registrar saída de aluguel | fluxo_lancar_saida | abrir fluxo | sim | inclui categoria/motivo  
3. Corrigir lançamento errado | fluxo_editar_lancamento | abrir fluxo | sim | orienta filtro + edição  
4. Excluir lançamento duplicado | fluxo_excluir_lancamento | abrir fluxo | sim | alerta de impacto  
5. Conferir total de hoje | fluxo_conferir_total_dia | abrir fluxo | sim | checklist do dia  
6. Conferir total mensal | fluxo_conferir_total_mes | abrir fluxo | sim | usa competência  
7. Fechar mês | fluxo_fechamento_mes | abrir fluxo | sim | checklist de fechamento  
8. Filtrar por período | fluxo_filtrar_periodo | abrir fluxo | sim | orienta calendário  
9. Ver resumo por forma | fluxo_resumo_pagamento | abrir fluxo | sim | cita aba Resumo  
10. Categoria desse lançamento | fluxo_categoria_lancamento | abrir fluxo | sim | regra entrada/saída  
11. Saldo não bateu | fluxo_erro_saldo | abrir fluxo | sim | roteiro diagnóstico  
12. Abrir fluxo de caixa | abrir_fluxo_caixa | abrir fluxo | sim | pergunta confirmação  
13. Quem cobrar hoje? | fluxo_pendencias_cobrancas | abrir fluxo | sim | separa pendência x cobrança  
14. Quero cobrar esse aluno agora | fluxo_cobranca_acao | abrir fluxo | sim | roteiro cobrança  
15. Pendências de cadastro | fluxo_pendencias_cobrancas | abrir fluxo | sim | orienta resolver pendência  
16. Vence amanhã, o que faço? | fluxo_pendencias_cobrancas | abrir fluxo | sim | priorização por vencimento  
17. "saldo n bate" (typo) | fluxo_erro_saldo | abrir fluxo | sim | robustez a typo  
18. "lançar entrda" (typo) | fluxo_lancar_entrada | abrir fluxo | sim | robustez a typo  
19. "cobrança vencidos" | fluxo_pendencias_cobrancas | abrir fluxo | sim | classe correta  
20. "pagamentos por pix" | fluxo_resumo_pagamento | abrir fluxo | sim | forma de pagamento  
21. "como ver pendencias e cobrancas" | fluxo_pendencias_cobrancas | abrir fluxo | sim | diferencia blocos  
22. "me ajuda no fluxo" | abrir_fluxo_caixa | abrir fluxo | sim | resposta objetiva  
23. "como fechar sem erro" | fluxo_fechamento_mes | abrir fluxo | sim | checklist útil  
24. "qual filtro data usar?" | fluxo_filtrar_periodo | abrir fluxo | sim | orienta por período  
25. "corrigir categoria saída" | fluxo_categoria_lancamento | abrir fluxo | sim | evita categoria errada  
26. "quero cobrança" | fluxo_cobranca_acao | abrir fluxo | sim | ação clara  
27. mensagem vazia | fallback_duvida_operacional | sem ação | não | oferece 4 opções  
28. "oi" | fallback_duvida_operacional | sem ação | não | direciona escopo  
29. "alunos novos" (fora escopo) | fallback_duvida_operacional | sem ação | não | redireciona ao escopo  
30. "transações pluggy" (fora escopo) | fallback_duvida_operacional | sem ação | não | informa fase 1  

## E) Execução prática realizada

### Arquivos alterados
- `backend/src/ai/intentCatalog.ts`
- `backend/src/ai/assistantPlaybook.ts`
- `backend/src/services/aiAssistantService.ts`
- `frontend/src/components/ai/AccessibilityChatPanel.tsx`
- `backend/src/ai/assistantQuality.test.ts` (novo)

### Validação executada
- `backend`: build + testes.
- `frontend`: build.

## F) Relatório final

### O que foi alterado
- Ampliação de intents para pendências/cobranças.
- Padronização de confirmação obrigatória para navegação.
- Prompt e playbook com foco em fase 1.
- Testes automatizados para intents e política de confirmação.

### Melhorias objetivas esperadas
- Menos respostas vagas para cobrança/pendência.
- Maior previsibilidade da navegação (sempre com confirmação).
- Maior aderência ao fluxo operacional da secretária.

### O que falta para próxima fase
- Medição contínua de qualidade em produção (logs analíticos por intent e retrabalho).
- Expansão de escopo para módulos além de Fluxo/Pendências conforme aprovação.
- Suite de testes E2E em UI com cenários completos de confirmação.

## Checklist final de validação
- [x] Escopo restrito à fase 1 respeitado.
- [x] Confirmação obrigatória para ações de navegação.
- [x] Intents de pendências/cobranças adicionados.
- [x] Build backend/frontend executado.
- [x] Testes automatizados adicionados e executados.
- [x] Matriz com 30 cenários documentada.
