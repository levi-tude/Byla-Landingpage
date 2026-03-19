# Conceitos de arquitetura e plano de melhorias – Byla

Este documento registra os **conceitos fundamentais** que o projeto adota como referência (Clean Architecture, DDD, Fundamentos de Arquitetura de Software, System Design Interview) e um **plano de melhorias** proposto com base neles. As mudanças do plano só são aplicadas após sua aprovação.

---

## 1. Conceitos fundamentais (referência do projeto)

### 1.1 Clean Architecture (série Robert C. Martin – “Uncle Bob”)

- **Regra de dependência:** o código de dentro não conhece o de fora. As dependências apontam para o núcleo (regras de negócio).
- **Camadas típicas (de dentro para fora):** Entidades → Casos de uso (Application) → Interfaces (adapters: API, UI, DB). Frameworks e drivers ficam na borda.
- **Objetivo:** regras de negócio independentes de banco, UI e frameworks; testáveis e estáveis ao trocar tecnologias.

### 1.2 Domain-Driven Design (DDD – Eric Evans)

- **Domínio:** o que o negócio faz (ex.: fluxo de caixa, alunos, conciliação, mensalidades).
- **Linguagem ubíqua:** mesmo vocabulário entre código e negócio (entradas, saídas, inadimplência, mês de referência).
- **Bounded contexts:** fronteiras claras entre subdomínios (ex.: financeiro oficial vs cadastro/operação).
- **Aggregates e entidades:** objetos com identidade e invariantes; raiz de agregação controla alterações.

### 1.3 Fundamentos da arquitetura de software (Richardson, Ford, etc.)

- **Atributos de qualidade:** desempenho, escalabilidade, manutenibilidade, segurança, disponibilidade.
- **Trade-offs:** toda decisão arquitetural tem custo e benefício; documentar o “porquê”.
- **Estilo arquitetural:** modular (módulos com responsabilidade clara), em camadas, e quando fizer sentido event-driven ou CQRS para leitura/escrita separadas.

### 1.4 System Design Interview (Alex Xu)

- **Escalabilidade:** horizontal (mais nós) vs vertical (mais recurso por nó); stateless quando possível.
- **Consistência e disponibilidade:** CAP; eventual consistency quando aceitável.
- **Componentes comuns:** cache, filas, load balancer, particionamento de dados; quando e por que usar cada um.
- **Desenho por passos:** requisitos → estimativas → alto nível → detalhes de componentes críticos → trade-offs.

---

## 2. Estado atual do sistema Byla (resumo)

- **Frontend:** React (Vite, TypeScript), telas por domínio (Visão Geral, Entradas, Conciliação, Atividades, Alunos, Despesas), contexto global de mês/ano, chamadas diretas ao Supabase e ao backend.
- **Backend:** Node/Express, rotas que unem Supabase e Google Sheets (planilhas), lógica de merge em módulo dedicado.
- **Fontes de dados:** Supabase (transações, views oficiais), duas planilhas (FLUXO DE CAIXA BYLA para alunos/ATENDIMENTOS; CONTROLE DE CAIXA para totais por mês).
- **Regras de negócio:** documentadas em `REGRAS_FONTES_SUPABASE_PLANILHAS.md` (quem é fonte principal por domínio).

---

## 3. Plano de melhorias (fundamentado nos conceitos)

Cada item indica **o que fazer**, **por que** (qual conceito/livro) e **impacto esperado**. Você pode aprovar ou não cada bloco.

---

### 3.1 Camada de domínio explícita (Clean Architecture + DDD)

**O quê:**  
Criar uma pasta/camada “domínio” (ex.: `frontend/src/domain` e/ou `backend/src/domain`) com:

- **Entidades** só com dados e regras de negócio (ex.: “Mês de referência”, “Resumo mensal”, “Origem dos dados: Supabase vs planilha”).
- **Value objects** para conceitos repetidos (ex.: valor monetário, período mes/ano).
- Nenhuma importação de React, Express, Supabase ou Google: só tipos e funções puras.

**Por quê:**  
Clean Architecture: o núcleo não depende de frameworks. DDD: linguagem ubíqua e conceitos do negócio no centro do código.

**Benefício:**  
Regras (ex.: “qual fonte prevalece”, “como calcular saldo do mês”) ficam testáveis e reutilizáveis; trocar API ou UI não quebra o núcleo.

---

### 3.2 Casos de uso (Application) (Clean Architecture)

**O quê:**  
Agrupar a “orquestração” em casos de uso nomeados, por exemplo:

- “Obter resumo do mês selecionado” (Supabase + opcionalmente planilha).
- “Obter lista de alunos completos” (Supabase + planilha ATENDIMENTOS, com regra de prioridade).
- “Obter totais da planilha CONTROLE para um mês”.

Cada caso de uso: entrada clara (ex.: mes, ano), chama repositórios/serviços, devolve DTO. As páginas e as rotas da API chamam esses casos de uso em vez de falar direto com Supabase/Sheets.

**Por quê:**  
Clean Architecture: a lógica de aplicação fica em uma camada estável; a UI e a API são “adapters” que apenas chamam os casos de uso.

**Benefício:**  
Um lugar único para entender “o que o sistema faz” por funcionalidade; mais fácil evoluir e testar.

---

### 3.3 Bounded contexts e responsabilidades (DDD)

**O quê:**  
Deixar explícito no código e na documentação:

- **Contexto “Financeiro oficial”:** extrato, saldo, entradas/saídas, totais por período → só Supabase.
- **Contexto “Cadastro e operação”:** alunos, matrículas, modalidades, pendências → planilhas complementam/prevalecem; backend faz o merge.

Evitar que rotas ou telas misturem responsabilidades (ex.: uma rota que ao mesmo tempo “é a verdade do caixa” e “lista alunos da planilha” sem separação clara).

**Por quê:**  
DDD: bounded contexts reduzem acoplamento e ambiguidade; cada parte do sistema tem uma responsabilidade bem definida.

**Benefício:**  
Menos confusão sobre “de onde vem esse dado” e “quem é dono dessa regra”.

---

### 3.4 Portas e adapters para fontes de dados (Clean Architecture)

**O quê:**  
Definir “portas” (interfaces) para leitura de dados, por exemplo:

- `IResumoMensalRepository` (obter resumo por mes/ano).
- `IAlunosCompletosRepository` (obter alunos com regra Supabase + planilha).
- `IFluxoPlanilhaRepository` (obter totais da planilha CONTROLE por mês).

Os “adapters” implementam essas portas: um adapter Supabase, um adapter Google Sheets. Os casos de uso dependem só das portas, não do Supabase nem do Sheets diretamente.

**Por quê:**  
Clean Architecture: a aplicação não depende de detalhes de infraestrutura; trocar ou mockar uma fonte é trocar o adapter.

**Benefício:**  
Testes com mocks; futura troca de planilha por outra API sem reescrever a lógica de negócio.

---

### 3.5 Documentar trade-offs (Fundamentos da arquitetura de software)

**O quê:**  
Para decisões importantes (ex.: “leitura das planilhas em toda requisição” vs “cache com TTL”, “filtro por mês no frontend” vs “no backend”), registrar em `docs/`:

- decisão;
- alternativas consideradas;
- trade-off (ex.: simplicidade vs desempenho);
- quando revisar.

**Por quê:**  
Fundamentos de arquitetura: decisões conscientes e documentadas evitam que mudanças futuras quebrem o que foi planejado sem saber o motivo.

**Benefício:**  
Onboarding e evolução mais seguros; menos “por que está assim?”.

---

### 3.6 Escalabilidade e cache (System Design Interview)

**O quê:**  
Quando o uso crescer:

- **Backend:** cache em memória (ou Redis) para leituras das planilhas (TTL configurável, ex.: 5–15 min), para não bater no limite da API do Google a cada request.
- Manter backend **stateless** (sem sessão em memória) para facilitar mais de uma instância no futuro.
- Opcional: health check e métricas simples (ex.: quantidade de chamadas por rota) para monitorar.

**Por quê:**  
System Design Interview: cache reduz carga e latência; stateless permite escalar horizontalmente.

**Benefício:**  
Menos risco de limite de cota do Google; preparação para mais usuários ou mais dados.

---

### 3.7 Ordem sugerida de implementação

| Fase | Itens | Prioridade |
|------|--------|------------|
| 1 | 3.1 Domínio explícito (entidades e value objects mínimos) | Alta |
| 2 | 3.4 Portas e adapters (interfaces para Supabase e Sheets) | Alta |
| 3 | 3.2 Casos de uso (orquestração por funcionalidade) | Alta |
| 4 | 3.3 Bounded contexts (documentação e organização do código) | Média |
| 5 | 3.5 Documentar trade-offs (decisões atuais e futuras) | Média |
| 6 | 3.6 Cache e stateless (quando houver necessidade de escala) | Quando necessário |

---

## 4. Implementação realizada (pós-aprovação)

- **Domínio (3.1):** `backend/src/domain/` (MesAno, OrigemDados, FluxoPlanilhaTotais); `frontend/src/domain/` (tipos alinhados).
- **Portas e adapters (3.4):** `backend/src/ports/` (IAlunosRepository, IPlanilhaAlunosRepository, IFluxoPlanilhaRepository); `backend/src/adapters/` (Supabase, Planilha, Cache com TTL para fluxo).
- **Casos de uso (3.2):** `backend/src/useCases/` (GetAlunosCompletoUseCase, GetFluxoCompletoUseCase); rotas `/api/alunos-completo` e `/api/fluxo-completo` chamam os use cases.
- **Bounded contexts (3.3):** documentado em `docs/BOUNDED_CONTEXTS_BYLA.md`.
- **Trade-offs (3.5):** documentado em `docs/TRADE-OFFS_ARQUITETURA.md`.
- **Cache (3.6):** CacheFluxoPlanilhaAdapter com TTL configurável via `FLUXO_PLANILHA_CACHE_TTL_MS` (padrão 5 min).

---

## 5. Como usar este documento

- **Conceitos (seção 1):** servem como referência para novas funcionalidades e refatorações; o time e a IA devem alinhar decisões a esses princípios quando fizer sentido.
- **Plano (seção 3):** cada bloco foi aprovado e implementado conforme a seção 4.
- **Referências:** Clean Architecture (Robert C. Martin), Domain-Driven Design (Eric Evans), Fundamentals of Software Architecture (Richardson et al.), System Design Interview (Alex Xu).
