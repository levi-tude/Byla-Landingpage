# Problemas no Supabase Byla e como resolver

Este documento descreve os problemas identificados no projeto Supabase e as soluções adotadas ou recomendadas.

---

## 1. Valor da mensalidade: uns com valor, outros sem (valor NULL)

### O que acontece

Na tabela **aluno_planos** existem linhas em que a coluna **valor** está preenchida e outras em que está **vazia (NULL)**. Isso ocorreu porque:

- A coluna **valor** foi adicionada depois (por migração) em parte do banco.
- Alguns registros foram inseridos antes dessa coluna existir ou sem preencher o valor (cadastros antigos ou importações).
- No banco atual há **aluno_planos** com apenas `aluno_id`, `plano_id`, `data_referencia`, `nome_pagador_pix`, etc., mas **sem valor**.

Quando o valor está NULL:

- O total do cadastro (resumos e comparativos) fica **menor** do que o real, porque essas linhas não entram na soma.
- Fica difícil saber quanto aquela mensalidade foi.

### Como resolver

1. **Preencher o valor onde estiver NULL**  
   No Supabase (SQL Editor), você pode:
   - Listar quem está sem valor: use a view **v_mensalidades_sem_valor** (ou a query abaixo).
   - Atualizar manualmente cada um, por exemplo:  
     `UPDATE aluno_planos SET valor = 230.00 WHERE id = 'uuid-aqui';`
   - Ou usar o valor do plano quando fizer sentido:  
     `UPDATE aluno_planos ap SET valor = p.valor_mensal FROM planos p WHERE ap.plano_id = p.id AND ap.valor IS NULL AND p.valor_mensal > 0;`

   **Correção já feita (fev/2026):** As 13 mensalidades que estavam com valor NULL foram preenchidas cruzando com a tabela **transacoes** (banco): quando existia entrada na mesma data e nome do pagador compatível, usamos o valor da transação; nos demais casos (ex.: Jorge Luiz Amaral, Genuina sem transação na mesma data), usamos o **valor do plano** (valor_mensal). Hoje não há mais registros com valor NULL.

2. **Daqui pra frente: sempre preencher valor**  
   Ao inserir em **aluno_planos** (manual, planilha, app ou script), sempre informar a coluna **valor**. Nos scripts de seed (ex.: `seed-modalidades-alunos-byla-2026.sql`) o valor já é preenchido em todos os INSERTs.

3. **Views que somam valor**  
   As views de resumo e comparativo passaram a usar **COALESCE(ap.valor, 0)** nas somas. Assim, linhas com valor NULL contam como 0 e não quebram a query; o total “oficial” do cadastro ainda deve ser corrigido preenchendo os valores faltantes.

---

## 2. Confusão: nome do aluno vs nome do pagador

### O que acontece

Na tabela **aluno_planos** existem:

- **aluno_id** – quem é o **aluno** (a pessoa que faz a atividade). O **nome** dessa pessoa está na tabela **alunos**.
- **nome_pagador_pix** – quem **efetuou o pagamento** (pode ser o próprio aluno ou outra pessoa: pai, mãe, responsável).

Se você abrir só a tabela **aluno_planos** no Supabase, verá o **nome do pagador** (quando preenchido), mas **não** o nome do aluno – só o `aluno_id` (UUID). Por isso fica confuso: “essa linha é do aluno X ou do pagador Y?”.

Exemplos que você deixou claros:

- **Aluno** Maria Flor Villar Pitanga, **pagador** Robson Souza Pitanga.
- **Aluno** Sofia Bastos, **pagador** Taiane Bastos dos Santos Maciel.

Ou seja: **aluno** = quem faz a atividade; **pagador** = quem pagou (e pode ser outra pessoa).

### Como resolver

1. **Sempre que exibir ou exportar pagamentos, mostrar os dois:**
   - **Aluno (quem faz a atividade):** nome vindo de **alunos** (via `aluno_id`).
   - **Pagador (quem efetuou o pagamento):** coluna **nome_pagador_pix** (ou `nome_pagador`) de **aluno_planos**.

2. **Usar as views que já trazem aluno e pagador juntos:**
   - **v_mensalidades_por_atividade** – colunas `aluno_nome` e `nome_pagador`.
   - **v_reconciliacao_mensalidades** – colunas `aluno_nome` e `nome_pagador_cadastro`.
   - **v_mensalidades_aluno_e_pagador** – view criada só para deixar explícito: `aluno_quem_faz_atividade` e `pagador_quem_efetuou_pagamento`.

3. **Na tabela aluno_planos (Table Editor):**  
   Para ver o nome do aluno, é preciso abrir a tabela **alunos** e cruzar pelo **aluno_id**, ou usar uma das views acima em vez de olhar só **aluno_planos**.

4. **Regra ao cadastrar:**  
   Ao lançar uma mensalidade, preencher sempre:
   - **aluno_id** (ou escolher o aluno) = quem é o aluno.
   - **valor** = valor pago.
   - **data_referencia** = data do pagamento.
   - **forma_pagamento** = pix, débito, crédito, etc.
   - **nome_pagador_pix** = nome de quem pagou (no extrato do banco costuma aparecer como “pessoa”). Se for o próprio aluno, repetir o nome do aluno aqui.

---

## 3. Conciliação: conferir pelo PAGADOR (quem pagou), não pelo aluno

### O que acontece

A view **v_reconciliacao_mensalidades** marca se cada mensalidade foi **confirmada no banco** (existe uma transação de entrada que bate com aquele pagamento). A conferência é feita pelo **nome de quem pagou** (pagador), não pelo nome do aluno:

- **Transações do banco** vêm com o nome da **pessoa que enviou o PIX** (campo `pessoa` em **transacoes**).
- No cadastro, quem pagou está em **nome_pagador_pix** (ou, se estiver vazio, usamos o nome do aluno).
- Se o pagador for outra pessoa (ex.: marido paga pela aluna), a transação no banco está no nome do **pagador**; por isso a conciliação **tem** que ser por **nome_pagador_pix** (e não pelo nome da aluna/o).

Exemplo: **Lilian** (aluna) e o **marido** (Luciano) — quem paga é o Luciano. Ele enviou **um único PIX de R$ 460** (duas mensalidades de R$ 230). No banco aparece uma entrada de 460 em nome de "Luciano ...". A view trata isso assim:

- Agrupa por **data + pagador**: na mesma data, todas as mensalidades do mesmo pagador (Luciano) somam 460.
- Procura uma transação de **entrada** com essa data e valor 460 e nome compatível com o pagador.
- Se encontrar, **todas** as linhas daquele pagador naquela data ficam com **confirmado_banco = true** (incluindo a mensalidade da Lilian).

Assim, **não pode ficar null** para a Lilian: quem pagou foi o Luciano, e o PIX dele confirma as duas mensalidades.

### Como resolver

1. **Sempre preencher nome_pagador_pix** quando quem paga for diferente do aluno (pai, mãe, cônjuge, etc.). Assim a conciliação encontra a transação no nome certo.
2. **Usar a view v_reconciliacao_mensalidades** para ver quem está com `confirmado_banco = false`: são matriculados sem transação correspondente **no nome do pagador** (e valor/data compatíveis).
3. Se aparecer "null" em conciliação para casos em que outra pessoa pagou, verificar se **nome_pagador_pix** está preenchido com o nome de quem efetivamente pagou (como aparece no extrato).

---

## Resumo

| Problema | Causa | Solução |
|----------|--------|---------|
| Valor NULL em mensalidades | Coluna valor criada depois ou inserts sem valor | Preencher valor nas linhas que estão NULL; daqui pra frente sempre informar valor. Usar views com COALESCE(valor, 0) nas somas. |
| Confusão aluno vs pagador | Na tabela aluno_planos só tem pagador; nome do aluno está em alunos | Sempre exibir os dois. Usar views que trazem aluno_nome e nome_pagador. Regra: aluno = quem faz a atividade; pagador = quem pagou. |
| Conciliação null para quem tem pagador diferente | Conferência pelo nome do aluno; transação está no nome de quem pagou | Conciliação é pelo nome_pagador_pix (e aceita 1 PIX no valor total para várias mensalidades do mesmo pagador na mesma data). Preencher nome_pagador_pix quando quem paga não é o aluno. |

---

*Scripts e views atualizados: `scripts/views-mensalidades-e-alunos-por-atividade.sql`, `scripts/views-transacoes-oficial-e-reconciliacao.sql` e a nova view `v_mensalidades_aluno_e_pagador`.*
