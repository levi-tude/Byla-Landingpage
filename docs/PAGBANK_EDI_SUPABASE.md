# PagBank EDI → Supabase (grátis, conta PagBank Empresas)

Sua conta no Pluggy era **PagBank Empresas**. O PagBank oferece uma **API de extrato EDI** que você pode usar **de graça** para buscar movimentos e gravar na tabela **transacoes** do Supabase.

---

## 1. Pedir o token (uma vez)

1. Acesse: [Token API EDI – PagBank](https://developer.pagbank.com.br/devpagbank/docs/edi#token-api-edi).
2. Abra o **portal de solicitação** (link do Pipefy na página).
3. Em **Quem é você?** escolha **Cliente PagBank**.
4. Em **Descrição**, informe que quer **1 token para 1 estabelecimento** (1x1) e informe o **número do estabelecimento** (USER). Se tiver mais de um estabelecimento, escolha 1xN e informe os IDs.
5. O **token** será enviado para o e-mail informado (pode levar alguns dias úteis).

Você vai usar:
- **USER:** número do estabelecimento (já você tem no painel PagBank).
- **TOKEN:** o que vier no e-mail.

---

## 2. Autenticação na API

A API EDI usa **Basic Authentication**:
- Credenciais: `USER:TOKEN` (ex.: `12345678:abc-def-ghi`).
- Header: `Authorization: Basic <base64(USER:TOKEN)>`.

No n8n você pode usar um node **HTTP Request** com **Authentication: Generic Credential Type** → **Basic Auth**, e preencher User = USER e Password = TOKEN.

---

## 3. Endpoints que interessam

Base: `https://edi.api.pagbank.com.br/movement/v3.00/`

- **Movimentos transacionais** (vendas, PIX, etc.):  
  `GET /transactional/{AAAA-MM-DD}?pageNumber=1&pageSize=1000`
- **Movimentos financeiros** (liquidações, cashouts):  
  `GET /financial/{AAAA-MM-DD}?pageNumber=1&pageSize=1000`

Só é possível consultar **uma data por vez** (não há intervalo). Os dados ficam **completos em D+1** (dia seguinte). No header da resposta vem **VALIDADO: true/false**; use só quando for `true`.

---

## 4. Workflow n8n

Foi criado o workflow **n8n-workflows/workflow-pagbank-edi-para-supabase.json**. Ele:

1. Gera as datas dos **últimos 15 dias**.
2. Para cada data, chama a API EDI (transactional).
3. Converte a resposta para o formato da tabela **transacoes** (data, pessoa, valor, descricao, tipo, id_unico).
4. Filtra as que ainda não estão no Supabase e insere.

**O que você precisa fazer:**
- Importar o workflow no n8n.
- Configurar **USER** e **TOKEN** (variáveis ou credenciais Basic Auth).
- O nó **Mapear para transacoes** já mapeia os nomes da API EDI para a tabela **transacoes**. Campos usados da resposta (array `detalhes`):
  - **data:** `data_inicial_transacao`, `data_venda_ajuste`, `data_movimentacao`, ou `data` / `dataLancamento` / `date`.
  - **valor:** `valor_total_transacao`, `valor_parcela`, ou `valor` / `amount` / `value`.
  - **pessoa:** `descricao`, `nome_comprador`, `nome`, `payerName`, `pessoa`, ou "Transação " + `codigo_venda`/`codigo_transacao`.
  - **descricao:** `tipoMovimento`, `metodo`, `paymentMethod`, `tipo_transacao`, ou "PIX".
  - Se a API retornar outros nomes, edite o código do nó "Mapear para transacoes" e inclua os campos reais.

---

## 5. EDI não traz PIX (com nome do pagador)

A API EDI **transactional** traz vendas na **maquininha (cartão)** – não traz o extrato da conta com **PIX recebido** e nome de quem pagou. Para ter PIX com nome na tabela **transacoes**, use a **planilha**: exporte o extrato do app PagBank (onde aparecem os PIX) e envie pela planilha + Apps Script ou workflow planilha → Supabase. Detalhes: [**EDI_PAGBANK_NAO_TEM_PIX.md**](./EDI_PAGBANK_NAO_TEM_PIX.md).

---

## 6. Resumo

| Item | Onde |
|------|------|
| Pedir token | Portal (Pipefy) no link da doc Token API EDI |
| URL base | `https://edi.api.pagbank.com.br/movement/v3.00/` |
| Autenticação | Basic (USER:TOKEN) |
| Workflow n8n | **n8n-workflows/workflow-pagbank-edi-para-supabase.json** |
| Tabela de destino | **transacoes** (mesma do projeto) |

Depois de configurar, agende o workflow (ex.: 1x por dia de manhã) para manter o Supabase atualizado com o extrato PagBank sem custo.
