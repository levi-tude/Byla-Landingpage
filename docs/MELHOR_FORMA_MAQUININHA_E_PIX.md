# Melhor forma: maquininha + PIX (tudo que cai na conta PagBank)

Tudo que você recebe (maquininha e PIX) cai na **mesma conta PagBank**. A forma que temos hoje de pegar o máximo pela **API**, sem depender de planilha, é usar **os dois endpoints EDI** na mesma rotina.

---

## O que a EDI oferece na mesma conta

A API EDI do PagBank (com o mesmo token e USER) tem dois tipos de movimento que, juntos, cobrem o que a documentação chama de “conta” do estabelecimento:

| Endpoint        | O que traz |
|-----------------|------------|
| **transactional** | Vendas na **maquininha** (cartão): valor, data, bandeira, NSU, código da venda. Não traz nome de pessoa (só dados do cartão). |
| **financial**     | **Liquidações**: pagamentos que caem na conta, chargebacks, cancelamentos, **transferências entre contas PagBank**, cashouts, antecipações. Ou seja, o “dinheiro que entrou/saiu” na conta. |

Não existe um único endpoint “extrato completo com nome do pagador PIX”. O que existe é:
- **transactional** = origem da venda (maquininha)
- **financial** = liquidação na conta (pode incluir fluxos que envolvem PIX/liquidação, dependendo de como o PagBank classifica)

Por isso a **melhor forma possível via API** é: usar **os dois** na mesma automação.

---

## O que foi implementado no workflow

O workflow **BYLA - PagBank EDI para Supabase** passou a fazer o seguinte:

1. **Últimos 15 dias** gera as 15 datas e alimenta **em paralelo**:
   - **PagBank EDI (transactional)** → **Mapear para transacoes** → **Só novos** → **Inserir Supabase**
   - **PagBank EDI (financial)** → **Mapear financial** → **Só novos** → **Inserir Supabase**

2. **Transactional** continua igual: vendas da maquininha (cartão), com `id_unico` sem prefixo.

3. **Financial** é mapeado para a mesma tabela **transacoes**, com:
   - `id_unico` com prefixo **`f-`** para não colidir com as transações de maquininha
   - Campos tentando os nomes típicos de liquidação: `data_liquidacao`, `data_pagamento`, `valor_liquido_transacao`, etc.
   - **pessoa** / **descricao**: quando a API não manda nome, usamos algo como “Liquidação” + código, para ficar legível

4. **Só novos** e **Inserir Supabase** recebem as saídas dos **dois** mapeadores. Assim, maquininha e movimentos financeiros (liquidações) entram na mesma tabela, sem duplicar por `id_unico`.

---

## Sobre PIX com nome do pagador

- Se o PagBank incluir **PIX** no EDI **financial** (ou em outro tipo de movimento) e mandar **nome do pagador** nos campos da resposta, o mapeador **financial** pode ser ajustado para usar esse campo em **pessoa** (basta alinhar os nomes dos campos no código do nó “Mapear financial” com o JSON real).
- Se a API EDI **não** trouxer PIX com nome (só liquidação genérica), aí o único jeito de ter “nome de quem pagou no PIX” continua sendo:
  - **Planilha**: exportar o extrato no app/site (onde o PIX aparece com nome) e enviar para o Supabase pela planilha + Apps Script ou workflow planilha → Supabase.

Ou seja: **maquininha + liquidações (financial)** a gente pega pelo workflow com os dois endpoints; **PIX com nome** só via API se a EDI passar a trazer esse dado; senão, via planilha.

---

## Resumo

| Objetivo                         | Como está hoje |
|----------------------------------|----------------|
| Pegar **maquininha** (cartão)    | ✅ Endpoint **transactional** no workflow |
| Pegar **liquidações** na conta   | ✅ Endpoint **financial** no workflow |
| Tudo na **mesma tabela** Supabase| ✅ Os dois mapeiam para **transacoes** |
| **PIX com nome do pagador**      | ⚠️ Só se a EDI trouxer; senão, planilha (extrato do app) |

Reimporte o workflow **workflow-pagbank-edi-para-supabase.json** no n8n para usar a versão com **transactional + financial**. Depois de rodar, confira no Supabase se as linhas do **financial** fazem sentido; se a resposta da API tiver outros nomes de campos, ajuste o nó “Mapear financial” conforme o JSON real.
