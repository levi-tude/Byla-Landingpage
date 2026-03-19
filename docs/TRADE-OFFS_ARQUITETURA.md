# Trade-offs de arquitetura – Byla

Decisões registradas para revisão futura. Ver também `CONCEITOS_ARQUITETURA_E_PLANO_MELHORIAS.md`.

---

## 1. Leitura das planilhas: sem cache vs cache com TTL

| Decisão atual | Cache em memória com TTL (ex.: 5 min) para leitura da planilha CONTROLE DE CAIXA (fluxo-completo). |
|---------------|------------------------------------------------------------------------------------------------------|
| Alternativa descartada | Ler no Google a cada requisição sem cache. |
| Trade-off | Com cache: menos chamadas à API do Google, resposta mais rápida, risco de dado desatualizado por até TTL. Sem cache: sempre atual, mais lento e mais consumo de cota. |
| Quando revisar | Se a planilha for editada com muita frequência e os usuários precisarem ver mudanças em tempo real; ou se a cota do Google se tornar problema. |
| Configuração | `FLUXO_PLANILHA_CACHE_TTL_MS` no `.env` do backend (padrão 300000 = 5 min). |

---

## 2. Filtro por mês: frontend vs backend

| Decisão atual | Visão Geral e resumo mensal: dados vêm do Supabase (v_resumo_mensal_oficial); o frontend filtra por mês selecionado no contexto. Entradas: período (data início/fim) sincronizado com o mês do seletor. Atividades: mensalidades buscadas do Supabase e filtradas por mês no frontend. |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Alternativa descartada | Fazer todas as filtragens no backend com query params. |
| Trade-off | Filtro no front: menos round-trips e lógica no backend; mas pode trazer mais dados do que o necessário. Filtro no back: menos dados trafegados, mais lógica no servidor. |
| Quando revisar | Se as listas crescerem muito (ex.: milhares de mensalidades) e a resposta ficar lenta; aí mover filtro para o backend (views com mes/ano ou query params). |

---

## 3. Duas fontes (Supabase + planilhas): merge no backend

| Decisão atual | Backend faz o merge (planilha prevalece para alunos/modalidades/pendências; Supabase para financeiro). Frontend chama uma única API (ex.: /api/alunos-completo) e recebe o combinado. |
|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Alternativa descartada | Frontend chamar Supabase e planilhas separadamente e combinar no cliente. |
| Trade-off | Merge no backend: regras centralizadas, frontend simples, uma fonte de verdade por rota. Merge no front: mais flexível por tela, mas duplicação de regras e mais complexidade no cliente. |
| Quando revisar | Se surgirem telas que precisem de combinações diferentes das atuais; aí avaliar endpoints mais granulares ou BFF por tela. |

---

## 4. Stateless do backend

| Decisão atual | Backend não guarda sessão em memória; cada requisição é independente. Cache de planilha é por mes/ano (dado), não por usuário. |
|---------------|---------------------------------------------------------------------------------------------------------------------------------|
| Trade-off | Stateless permite escalar horizontalmente (várias instâncias). Com sessão, seria mais complexo replicar. |
| Quando revisar | Se no futuro houver autenticação e necessidade de cache por usuário ou rate limit por usuário. |
