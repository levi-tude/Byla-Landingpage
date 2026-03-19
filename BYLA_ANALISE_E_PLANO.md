# Byla – Análise do sistema e plano de evolução

Espaço de atividades físicas (danças, pilates, etc.). Este documento compara o que você tem com o mundo corporativo e propõe um plano para virar um sistema completo.

---

## 1. O que foi ajustado no workflow (resumo)

- **Execução:** 1x por dia (a cada 24 horas), em vez de a cada 6 horas.
- **Só transações novas:**  
  - O fluxo começa buscando todas as transações no Supabase (**Get many rows**).  
  - **Se tiver linhas:** usa **Pegar última data** (pega a data da última transação e pede ao Pluggy só de “dia seguinte” até “hoje”) → só entram transações novas.  
  - **Se a tabela estiver vazia:** usa **Code in JavaScript2** (últimos 30 dias) na primeira vez.  
- **Duplicatas:** continuam evitadas pelo `id_unico` (constraint UNIQUE no Supabase).

Assim o processo fica automatizado: roda 1x por dia e só adiciona o que ainda não está na tabela.

---

## 2. Seu sistema hoje vs. mundo corporativo

| Aspecto | Seu sistema atual | Prática corporativa típica |
|--------|--------------------|----------------------------|
| **Conciliação bancária** | Pluggy + n8n + Supabase (automático, 1x/dia) | ERPs (SAP, Totvs, etc.) ou sistemas de conciliação com regras, matching e alertas |
| **Dados por categoria** | Uma tabela `transacoes` (pessoa, valor, tipo, descricao, data) | Múltiplas dimensões: centro de custo, projeto, departamento, categoria de receita/despesa |
| **Listas por “produto”** | Lista manual de alunos de pilates (plano, forma de pagamento) | Cadastros de clientes, planos, contratos e vínculo com financeiro |
| **Relatórios** | Ainda não automatizados | DRE, fluxo de caixa, por centro de custo, por período, dashboards |
| **Cobrança / inadimplência** | Ainda manual (“quem pagou / quem falta”) | Módulo de cobrança, lembretes, status por aluno e por parcela |
| **Auditoria e governança** | Logs do n8n + histórico no banco | Logs de alteração, perfil de acesso, aprovações e trilha de auditoria |

Ou seja: você já tem a base (conciliação automática e tabela de transações). O que falta é **estruturar por atividade (pilates, dança, etc.), por aluno e por plano**, e aí conectar isso a relatórios e controles de pagamento.

---

## 3. O que podemos melhorar (em ordem prática)

### 3.1 Dados estruturados por atividade (prioridade alta)

- **Objetivo:** Uma “lista por categoria de atividade” (pilates, dança, etc.) com aluno, plano e forma de pagamento, como você já tem no pilates.
- **Como fazer:**
  - No **Supabase**, criar tabelas (ou colunas) que representem:
    - **Atividades** (ex.: Pilates, Dança, etc.)
    - **Alunos** (nome, contato, etc.)
    - **Planos** (nome do plano, valor, atividade)
    - **Vínculo aluno–plano–atividade** (quem faz o quê, forma de pagamento)
  - Manter a tabela **transacoes** como está (movimento financeiro real). O passo seguinte é **relacionar** transações a alunos/planos/atividades (por nome, valor, data ou por um identificador futuro).

Isso é a base para “quanto entrou de pilates”, “quanto de dança”, “lista de alunos por atividade” e “quem paga como”.

### 3.2 Relatórios do mês (entrada, saída, por atividade)

- **Objetivo:** Saber quanto entrou, quanto saiu, quanto entrou “só de pilates” ou “só de dança”, quanto saiu por funcionário.
- **Como fazer:**
  - **Opção rápida:** queries SQL no Supabase (por `data`, `tipo`, `pessoa`, `descricao`) e, quando tiver **atividade** nos dados, agrupar por atividade.
  - **Depois:** relatórios no n8n (workflow que roda no fim do mês, lê do Supabase e gera resumo em texto/planilha) ou um painel (Supabase + ferramenta de BI ou planilha).

Assim você sobe um degrau em direção ao que empresas fazem em “relatório gerencial”.

### 3.3 Controle de “quem pagou / quem falta pagar”

- **Objetivo:** Select por aluno para ver se pagou no mês e quem falta pagar no próximo.
- **Como fazer:**
  - Ter na base **quem é aluno** e **qual plano/mensalidade** (tabelas de alunos e planos).
  - Comparar **transacoes** (entradas por pessoa/data) com a **expectativa de pagamento** (ex.: todo mês, valor X para o aluno Y). Quem não tiver transação no período = “falta pagar”.
  - Isso pode ser uma query + lista (ou depois um workflow n8n que gera a lista de “pendentes”).

### 3.4 IA para relatórios e insights

- **Objetivo:** Resumos do mês, “quanto entrou de pilates”, “quanto saiu para cada funcionário”, em linguagem natural.
- **Como fazer:**
  - Manter os dados no Supabase bem organizados (transacoes + atividades + alunos).
  - Um workflow n8n que:
    - Lê os dados (transações, totais por atividade, etc.)
    - Envia um resumo em texto para uma API de IA (OpenAI, Claude, etc.)
    - Pede: “Gere um resumo executivo do mês para a diretoria”
  - Ou um chat que tenha acesso só a relatórios pré-definidos (para não expor dados brutos).

Isso se aproxima do que empresas usam em “analytics com linguagem natural”.

### 3.5 Segurança, backup e governança

- **Corporativo:** controle de quem acessa o quê, backup automático, logs de alteração.
- **Sugestão para a Byla:**  
  - Backup automático do Supabase (já existe em planos pagos).  
  - Poucas pessoas com acesso ao n8n e ao Supabase; senhas fortes e 2FA onde possível.  
  - Não versionar credenciais (API Pluggy, Supabase) no Git.

---

## 4. Plano sugerido (roadmap) para a Byla

Fase 1 – **Base de dados por atividade (1–2 semanas)**  
- Definir atividades (Pilates, Dança, etc.).  
- Criar tabelas (ou colunas) de alunos, planos e vínculo aluno–plano–atividade.  
- Replicar a “lista do pilates” (alunos + plano + forma de pagamento) para as outras atividades.

Fase 2 – **Relatórios simples (1–2 semanas)**  
- Queries ou relatório no Supabase: total de entradas/saídas do mês.  
- Quando houver “atividade” nos dados: total por atividade (ex.: “quanto entrou de pilates”).  
- Se tiver “funcionário” ou “destino” em saídas: total por funcionário.

Fase 3 – **Controle de pagamento por aluno (2–3 semanas)**  
- Regra: “aluno X deve pagar valor Y todo mês”.  
- Comparar com transacoes e listar “quem pagou” e “quem falta pagar no próximo mês”.  
- Pode ser uma tela simples (planilha ou app interno) que consome o Supabase.

Fase 4 – **Automação e IA (depois)**  
- Workflow n8n que gera resumo do mês e envia por e-mail/WhatsApp.  
- Opcional: integração com IA para texto executivo a partir dos mesmos dados.

---

## 5. Resumo

- **Workflow:** Já ajustado para rodar 1x por dia e buscar só transações novas; duplicatas continuam evitadas pelo `id_unico`.  
- **Sistema atual:** Boa base (conciliação automática); falta estruturar por atividade, aluno e plano.  
- **Próximo passo:** Organizar dados por atividade (como a lista do pilates) e, em seguida, relatórios por mês e por atividade, depois “quem pagou / quem falta” e, por último, IA e mais automação.

Se quiser, no próximo passo podemos desenhar juntos as tabelas do Supabase (atividades, alunos, planos) e as primeiras queries para “quanto entrou de pilates” e “lista por atividade”.
