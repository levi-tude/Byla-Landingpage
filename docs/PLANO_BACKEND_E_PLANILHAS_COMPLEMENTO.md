# Plano: Backend + Planilhas como Complemento ao Supabase (Byla)

Este documento descreve o **plano de criação e adaptação** do sistema Byla para incluir um **backend** que une **Supabase** (fonte atual) e **planilhas do Espaço Byla** (2–3 planilhas usadas por financeiro e secretária) como fontes de dados, com **lógica explícita** para decidir o que funciona e o que não funciona. Segue as diretrizes de `ENGENHARIA_DE_PROMPT_E_SW_BYLA.md` e `BYLA_ANALISE_E_PLANO.md`.

---

## 1. Objetivo

- **Supabase continua sendo a fonte principal** para tudo que é **financeiro oficial**: extrato geral, saldo, entradas/saídas, transações, totais por período. Ou seja: a “verdade” do que entrou e saiu do caixa vem do Supabase (alimentado por n8n/Pluggy/PagBank etc.).
- **Planilhas do Espaço Byla** entram como **complemento** para a parte **operacional/cadastro**: alunos, alunos matriculados, modalidades (atividades) e pendências de pagamento. As planilhas têm informações a mais e informações mais verificadas pela secretária e pelo financeiro nesses temas; o backend usa as planilhas para enriquecer ou priorizar esses dados.
- **Centralizar** no backend a lógica que decide quando usar só Supabase, quando usar planilhas e quando combinar (merge/prioridade).
- **Frontend**: telas de extrato, saldo, entradas, visão geral financeira continuam chamando **só o Supabase**. Telas de alunos, matrículas, modalidades e pendências de pagamento passam a consumir o **backend**, que devolve dados combinados (Supabase + planilhas conforme a regra).

---

## 2. Princípios (engenharia de software – projeto Byla)

| Princípio | Aplicação neste plano |
|-----------|------------------------|
| **Modularidade** | Backend com rotas/responsabilidades claras; serviços separados para Supabase e Google Sheets; lógica de merge em um módulo dedicado. |
| **Single source of truth (por domínio)** | Transações oficiais continuam no Supabase; planilhas são “complemento” lido em tempo real ou cache, sem duplicar transações no Supabase. |
| **Documentação** | Este plano, o prompt de implementação e comentários no código; decisões de “prioridade” entre fontes registradas em `docs/`. |
| **Configuração externa** | Credenciais (Supabase URL/keys, Google Service Account, IDs das planilhas) em variáveis de ambiente; nunca no código versionado. |
| **Evolução incremental** | Fase 1: backend mínimo + uma rota que lê Supabase + uma planilha; Fase 2: mais planilhas e regras de merge; Fase 3: front consome backend onde fizer sentido. |

---

## 3. Arquitetura alvo

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React – painel Byla)                                  │
│  - Telas que não precisam de planilhas: continuam chamando       │
│    Supabase direto (como hoje).                                  │
│  - Telas que precisam de “dados completos”: chamam o backend       │
│    (ex.: GET /api/dados-completos, GET /api/conciliacao-completa)│
└───────────────────────────┬─────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │ Supabase (direto)   │   Backend (novo)  │
         │ para visão geral,   │   para rotas que  │
         │ entradas, etc.      │   unem Supabase   │
         │                     │   + planilhas     │
         └─────────────────────┼───────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │  Backend (Node.js)  │
                    │  - Lê Supabase      │
                    │  - Lê Google Sheets │
                    │  - Lógica de merge  │
                    │  - Expõe REST API   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │  Supabase   │  │  Google      │  │  Regras     │
       │  (views /   │  │  Sheets API  │  │  (prioridade│
       │  tabelas)   │  │  (2–3        │  │  merge)     │
       │             │  │  planilhas) │  │             │
       └─────────────┘  └─────────────┘  └─────────────┘
```

- **Não há conflito**: cada fonte tem papel definido; a “verdade” por domínio fica explícita em `docs/REGRAS_FONTES_SUPABASE_PLANILHAS.md` e no código do backend.

---

## 4. Divisão de responsabilidade (Supabase vs planilhas)

| Domínio | Fonte principal | Papel das planilhas |
|---------|------------------|----------------------|
| **Extrato geral, saldo, entradas/saídas, totais** | **Supabase** | Não usadas; o financeiro oficial vem só do banco (Supabase). |
| **Alunos, alunos matriculados, modalidades** | **Planilhas** (complemento) | Planilhas têm informações a mais e mais verificadas; o backend usa-as para enriquecer ou priorizar lista de alunos, matrículas e modalidades. |
| **Pendências de pagamento** | **Planilhas** (complemento) | Informações mais verificadas na planilha; o backend combina com o que vier do Supabase (ex.: conciliação) quando fizer sentido. |

Resumo: **financeiro “quanto entrou/saiu” = Supabase. Cadastro e operação (alunos, matrículas, modalidades, pendências) = planilhas ajudam e podem prevalecer** onde houver informação mais completa ou mais verificada.

---

## 5. Escopo das planilhas (a definir com o usuário)

- **Quantidade:** 2 a 3 planilhas do Espaço Byla.
- **Uso atual:** financeiro e secretária (alunos, matriculados, modalidades, pendências).
- **Forma de alimentação do programa:** backend lê via **Google Sheets API** (pull), quando a rota for chamada, ou em cache com TTL definido (ex.: 5–15 min).
- **Não** gravar o conteúdo dessas planilhas nas tabelas do Supabase; usá-las só no backend para montar respostas combinadas.

*(Em um segundo momento pode-se documentar aqui os nomes/IDs das planilhas e o mapeamento de abas/colunas para alunos, modalidades e pendências.)*

---

## 6. Fases de implementação

### Fase 1 – Backend mínimo (1–2 semanas)

1. **Criar** um backend Node.js (Express ou Fastify) no repositório (ex.: pasta `backend/` ou `api/`).
2. **Configurar** variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (ou anon, conforme segurança), `GOOGLE_SHEETS_*` (credenciais de Service Account ou OAuth), IDs das planilhas.
3. **Implementar** uma rota de saúde (ex.: `GET /health`) e **uma rota de dados combinados** (ex.: `GET /api/dados-completos` ou nome alinhado ao primeiro caso de uso).
4. **Na rota combinada:** buscar dados do Supabase (ex.: mesma view que o front usa hoje) + ler **uma** planilha via Google Sheets API; aplicar uma regra simples de merge (ex.: retornar objeto `{ supabase: [...], planilha: [...], regra_usada: "..." }`).
5. **Documentar** no `README` do backend como rodar localmente e quais envs são obrigatórios.
6. **Hospedar** o backend (Vercel, Railway, Render ou outro); configurar envs em produção.

### Fase 2 – Lógica “o que funciona e o que não funciona” (1–2 semanas)

1. **Definir** com o usuário as regras: por exemplo, “para lista de alunos por atividade, priorizar planilha da secretária; para valores de transações, só Supabase”; ou “combinar por chave X e mostrar divergências”.
2. **Implementar** um módulo de regras (ex.: `backend/src/logic/merge.js` ou `merge.ts`) que recebe dados do Supabase e da(s) planilha(s) e devolve estrutura única (lista consolidada, totais, flags de origem).
3. **Expor** uma ou mais rotas (ex.: `GET /api/conciliacao-completa`, `GET /api/alunos-completo`) que usam esse módulo.
4. **Registrar** as regras em `docs/REGRAS_FONTES_SUPABASE_PLANILHAS.md` (quem prevalece em cada caso e por quê).

### Fase 3 – Integração com o frontend (1 semana)

1. **Criar** um cliente no frontend (ex.: `frontend/src/services/backendApi.ts`) que chama o backend (URL base em `VITE_BACKEND_URL` ou similar).
2. **Alterar** apenas as telas que precisam de “dados completos” para usar esse cliente em vez de (ou além de) Supabase direto.
3. **Manter** as demais telas chamando o Supabase como hoje.
4. **Testar** com dados reais e ajustar CORS e envs.

### Fase 4 (opcional) – Cache e performance

- Cache em memória ou Redis para leitura das planilhas (TTL configurável) para não bater no limite da API do Google a cada request.
- Logs e monitoramento básico das rotas do backend.

---

## 7. Decisões a documentar

- **Quais** das 2–3 planilhas serão lidas e para quais telas (alunos, matriculados, modalidades, pendências).
- **Regra por domínio:** já definida na seção 4 e em `docs/REGRAS_FONTES_SUPABASE_PLANILHAS.md`; detalhar por rota (ex.: `/api/alunos-completo` = planilha prevalece para lista; conciliação pode combinar Supabase + planilha para pendências).
- **Formato** de saída das rotas do backend (JSON com seções `supabase`, `planilha`, `combinado`, ou só `combinado`).

---

## 8. Referências no repositório

- `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md` – técnicas de prompt e princípios de software.
- `docs/PROMPT_RELATORIO_IA_BYLA.md` – exemplo de prompt estruturado (Role, Context, Instruction, Output).
- `docs/PROMPT_IMPLEMENTAR_BACKEND_PLANILHAS.md` – prompt mestre para executar este plano.
- `BYLA_ANALISE_E_PLANO.md` – análise do sistema e roadmap.
- `proximos-passos-planejamento.md` – fases gerais do sistema.

---

## 9. Resumo

| Item | Descrição |
|------|-----------|
| **O quê** | Backend que lê Supabase + planilhas (Google Sheets); lógica de merge/prioridade no backend; front opcionalmente consome o backend em telas “completas”. |
| **Por quê** | Ter Supabase e planilhas como complemento, sem conflito, com uma única lógica de “o que funciona e o que não funciona”. |
| **Onde** | Novo backend (pasta `backend/` ou `api/`) no mesmo repo ou em repo separado; front em `frontend/`. |
| **Como** | Pull das planilhas via Google Sheets API; credenciais em env; regras documentadas em `docs/`. |

Este plano deve ser usado em conjunto com o **prompt de implementação** (`PROMPT_IMPLEMENTAR_BACKEND_PLANILHAS.md`) para orientar a execução passo a passo.
