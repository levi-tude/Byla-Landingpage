# Explicação da correção do workflow PagBank EDI → Supabase

Documento em linguagem simples: o que o workflow faz, qual era o problema e como a correção resolve.

---

## 1. O que o workflow faz (objetivo)

O workflow **BYLA - PagBank EDI para Supabase** tem um objetivo único:

- Buscar **movimentações bancárias** dos últimos 7 dias na API do PagBank (EDI).
- Transformar essas movimentações no formato da tabela **transacoes** do Supabase (data, pessoa, valor, descricao, tipo, id_unico).
- Inserir **só as transações novas** no Supabase (evitando duplicatas).

Ou seja: **PagBank vira a fonte dos dados; o Supabase guarda só o que ainda não está lá.**

---

## 2. Qual era o problema

O fluxo tinha **dois problemas** que impediam de funcionar direito:

### Problema A: “Id_unicos no Supabase” não rodava junto com o resto

- O **agendador** (Schedule) só estava ligado ao nó **“Últimos 7 dias”**.
- O nó **“Id_unicos no Supabase”** (que lê as transações já salvas para evitar duplicata) **não** era acionado pelo agendador.
- Resultado: na hora de decidir “o que é novo?”, o workflow não tinha a lista de transações que já estavam no banco. Ou o nó não rodava, ou rodava em outro momento, e a comparação ficava errada.

### Problema B: Várias “rodadas” do PagBank e do Mapear

- **“Últimos 7 dias”** gera **7 itens** (uma data por dia).
- O n8n trata cada item como uma execução: então o **HTTP Request** ao PagBank roda **7 vezes** (uma por data).
- O nó **“Mapear para transacoes”** também roda **7 vezes**, uma para cada resposta do PagBank, e em cada vez devolve **várias** transações (uma por movimento).
- Ou seja: no final do “Mapear” você tem **muitos itens** (todas as transações dos 7 dias), mas eles chegam em “lotinhos” (um lote por dia).
- O nó **“Só novos”** precisa enxergar **todas** essas transações de uma vez e comparar com **todos** os `id_unico` que já estão no Supabase. Se ele não recebesse tudo junto ou se a lista do Supabase não estivesse disponível, a filtragem “só novos” ficava incompleta ou errada.

Resumindo:  
**Problema A** = falta da lista “o que já está no Supabase” no mesmo fluxo.  
**Problema B** = necessidade de juntar todos os resultados do PagBank (7 dias) e usar essa lista inteira na comparação.

---

## 3. O que foi feito (a correção)

Foram feitas **três mudanças** no workflow:

### Correção 1: Agendador aciona dois nós

- **Antes:** o **Schedule** só ligava em **“Últimos 7 dias”**.
- **Agora:** o **Schedule** liga em **dois** nós ao mesmo tempo:
  1. **“Últimos 7 dias”** (que gera as 7 datas e segue para PagBank → Mapear → Só novos → Inserir).
  2. **“Id_unicos no Supabase”** (que busca as transações já salvas no Supabase).

Assim, **toda vez** que o workflow roda (por exemplo 1x por dia), duas coisas acontecem em paralelo:

- O Supabase é consultado e fica “preenchido” com os `id_unico` que já existem.
- O fluxo das datas → PagBank → Mapear segue normalmente.

Quando o nó **“Só novos”** rodar, ele consegue usar a lista do Supabase porque **“Id_unicos no Supabase”** já foi executado na mesma rodada.

### Correção 2: Um único caminho até “Só novos”

- **Antes:** “Mapear para transacoes” tinha duas saídas: uma para “Id_unicos no Supabase” e outra para “Só novos”. Isso confundia o fluxo (quem dispara quem e com quantos itens).
- **Agora:** “Mapear para transacoes” tem **uma única** saída: só para **“Só novos”**.
- “Id_unicos no Supabase” **não** é mais acionado pelo Mapear; ele é acionado **só pelo Schedule** (correção 1).

Fica assim:

- Quem **alimenta** “Só novos” com transações é **só** o “Mapear para transacoes” (com todos os itens dos 7 dias).
- Quem **alimenta** “Id_unicos no Supabase” é o **Schedule**, para ele rodar sempre que o workflow rodar.

### Correção 3: Código de “Só novos” usando tudo que veio do Mapear e do Supabase

- **Antes:** o código podia depender de “um item por vez” ou de estrutura diferente.
- **Agora** o código faz o seguinte, de forma explícita:
  1. **Pega todas as transações** que vieram do “Mapear”: `$input.all()` (todos os itens que o n8n passou para este nó).
  2. **Pega todos os `id_unico`** que já estão no Supabase: lê o nó **“Id_unicos no Supabase”** com `$('Id_unicos no Supabase').all()` (e usa `|| []` se por algum motivo não houver resultado).
  3. **Filtra:** mantém só as transações cujo `id_unico` **não** está nessa lista do Supabase (e que tenham `id_unico` definido).
  4. **Devolve** só essas transações “novas” para o próximo nó (Inserir no Supabase).

Assim, “Só novos” passa a enxergar:

- **Todas** as transações mapeadas (dos 7 dias).
- **Todas** as transações já existentes no Supabase (porque “Id_unicos no Supabase” rodou no início).

E a decisão “é novo ou duplicata?” fica correta.

---

## 4. Como funciona agora (passo a passo simples)

1. **O agendador dispara** (ex.: 1x por dia).
2. **Duas coisas começam ao mesmo tempo:**
   - **Ramal 1:** “Últimos 7 dias” gera 7 datas → para cada data o PagBank é chamado → “Mapear para transacoes” transforma cada resposta em várias transações (data, pessoa, valor, etc.) → no final você tem **uma lista grande** com todas as transações dos 7 dias.
   - **Ramal 2:** “Id_unicos no Supabase” lê a tabela **transacoes** e fica com a lista de **id_unico** que já existem.
3. **“Só novos”** recebe a lista grande do “Mapear” (todos os itens), lê a lista do “Id_unicos no Supabase” e **remove** da lista grande tudo que já está no Supabase. O que sobra são só transações **novas**.
4. **“Inserir Supabase”** recebe só essas transações novas e grava na tabela **transacoes**.

Assim:

- O banco é preenchido com o que vem do PagBank.
- Duplicatas são evitadas (cada transação é identificada por `id_unico`).
- Tudo acontece na mesma execução: mesma “rodada” do Schedule, mesma lista do Supabase, mesma lista dos 7 dias.

---

## 5. Resumo em uma frase

**Antes:** o workflow não garantia que a lista do Supabase fosse lida na mesma execução nem que “Só novos” visse todas as transações dos 7 dias juntas.  
**Depois:** o agendador dispara o Supabase e o fluxo dos 7 dias ao mesmo tempo, e “Só novos” usa todas as transações mapeadas e todos os `id_unico` do Supabase para enviar só transações novas para inserção.

Se quiser, no próximo passo podemos desenhar um diagrama (em texto ou em imagem) desse fluxo “antes e depois” para ficar ainda mais visual.
