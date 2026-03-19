# Engenharia de Prompt e Engenharia de Software – Projeto Byla

Este documento estabelece **como o projeto Byla aplica** (1) técnicas de **engenharia de prompt** em qualquer uso de IA e (2) conceitos clássicos de **engenharia de software** na evolução do sistema. Todo comando ou implementação que envolva IA ou arquitetura deve seguir estes princípios.

---

## Parte 1 – Engenharia de Prompt (referência: PDF + promptingguide.ai)

### Técnicas que usamos no projeto

| Técnica | Uso no Byla | Referência |
|--------|--------------|------------|
| **Role Prompting** | Atribuir papel ao modelo (ex.: "Você é analista financeiro do Espaço Byla") para respostas contextualizadas. | Spring AI patterns |
| **Contextual Embedding** | Injetar dados reais (resumo mensal, inadimplentes) no prompt para a IA não inventar números. | promptingguide.ai/techniques/contextual |
| **Instruction Tuning** | Instruções claras e únicas: "Gere um resumo executivo em português com as seções X, Y, Z." | Wei et al., RLHF |
| **Output Constraining** | Definir formato de saída (markdown, seções obrigatórias, máximo de palavras/tokens). | Spring AI, response format |
| **Chain-of-Thought (CoT)** | Para análise: "Pense passo a passo: 1) Totais 2) Tendência 3) Inadimplência 4) Recomendações." | Wei et al. 2022, zero-shot CoT |
| **Zero-shot** | Tarefas simples (classificação, extração) sem exemplos; reduz tamanho do prompt. | promptingguide.ai/techniques/zeroshot |
| **Few-shot** | Quando o formato de saída é crítico: 1–2 exemplos de entrada/saída desejada. | promptingguide.ai/techniques/fewshot |

### Template de prompt para relatórios/análise (Byla)

1. **Role:** Quem é o modelo (ex.: analista financeiro do espaço cultural Byla).
2. **Context:** Dados reais em texto ou JSON (resumo mensal, lista de inadimplentes).
3. **Instruction:** O que fazer (ex.: gerar resumo executivo, destacar riscos, sugerir ações).
4. **Output constraint:** Formato (ex.: markdown, seções ## Resumo ## Números ## Inadimplentes ## Próximos passos, máx. 500 palavras).
5. **CoT (opcional):** "Analise passo a passo antes de responder" para raciocínio explícito.

Referências externas: [Zero-shot](https://www.promptingguide.ai/techniques/zeroshot), [Few-shot](https://www.promptingguide.ai/techniques/fewshot), [CoT](https://www.promptingguide.ai/techniques/cot), [Spring AI patterns](https://docs.spring.io/spring-ai/reference/api/chat/prompt-engineering-patterns.html).

---

## Parte 2 – Engenharia de Software (conceitos clássicos)

### Princípios aplicados no Byla

- **Modularidade:** Workflows n8n com nós bem nomeados e responsabilidade única (ex.: "Normalizar linhas", "Só linhas novas"). BI separado em dashboards por domínio (financeiro, conciliação).
- **Single source of truth:** Dados oficiais em `transacoes`; relatórios e BI consomem **views** (`v_resumo_mensal_oficial`, `v_reconciliacao_mensalidades`), não lógica duplicada.
- **Documentação:** Cada view e workflow crítico documentado (README, comentários SQL, docs em `docs/`).
- **Configuração externa:** Credenciais e IDs (Supabase, Google, OpenAI) fora do código; uso de credenciais do n8n.
- **Testabilidade:** Dados de exemplo e passos manuais para validar workflows e relatório IA (ex.: rodar manualmente no 1º dia do mês).
- **Evolução incremental:** BI em 3 dashboards (Visão Geral, Receita por Atividade, Conciliação); relatório IA em uma versão inicial com prompt versionado em documento.

### Referência

Conceitos alinhados a práticas de autores clássicos (Clean Code, SOLID, documentação como parte do produto). Detalhes do sistema em `BYLA_ANALISE_E_PLANO.md`, `APRESENTACAO_SISTEMA_BYLA_COMPLETO.md`.

### Conceitos fundamentais de arquitetura (referência do projeto)

O projeto adota como referência os seguintes conceitos para evolução da arquitetura e do código:

- **Clean Architecture (série Robert C. Martin):** regra de dependência (núcleo independente de frameworks), camadas Entidades → Casos de uso → Adaptadores.
- **Domain-Driven Design (DDD):** domínio no centro, linguagem ubíqua, bounded contexts, aggregates.
- **Fundamentos da arquitetura de software:** atributos de qualidade, trade-offs documentados, estilos arquiteturais (modular, em camadas).
- **System Design Interview (Alex Xu):** escalabilidade, cache, consistência, desenho por passos.

Resumo, aplicação ao Byla e **plano de melhorias** (para aprovação) estão em **`docs/CONCEITOS_ARQUITETURA_E_PLANO_MELHORIAS.md`**. Ao propor ou implementar mudanças de arquitetura, usar esse documento como base.

---

## Parte 3 – Como usar este guia

- **Ao criar ou alterar um prompt de IA no projeto:** preencher Role, Context, Instruction, Output constraint e, se útil, CoT; registrar em `docs/PROMPT_RELATORIO_IA_BYLA.md` (ou arquivo equivalente).
- **Ao adicionar funcionalidade (BI, workflow, API):** manter módulos com responsabilidade clara e documentar fonte de dados e decisões em `docs/`.
- **Ao receber um comando do usuário:** interpretar à luz deste guia (melhor prompt possível para IA; desenho de software modular e documentado).
- **Ao implementar o backend e integração Supabase + planilhas:** seguir o plano em `docs/PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md` e usar o prompt mestre em `docs/PROMPT_IMPLEMENTAR_BACKEND_PLANILHAS.md`.
