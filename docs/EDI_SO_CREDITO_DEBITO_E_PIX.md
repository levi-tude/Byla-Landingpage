# Por que o EDI só mostra crédito/débito e onde pode estar o PIX

## O que você está vendo

Nos resultados dos nós **PagBank EDI (transactional)** e **PagBank EDI (financial)** aparecem só operações em **crédito e débito** (cartão), e **não PIX**.

---

## Por que isso acontece

O EDI do PagBank separa as movimentações assim:

| Endpoint      | O que traz |
|---------------|------------|
| **transactional** | Vendas do dia: **cartão (crédito/débito)** e **venda PIX na maquininha**. Ou seja, transações que passaram no terminal. |
| **financial**  | Liquidações dessas vendas + transferências entre contas PagBank + **cashouts** (saques para a conta, etc.). |
| **cashouts**   | **Saques/cashouts** – por exemplo “Saldo Carteira” quando o valor vai para a conta. Aqui pode aparecer **PIX** (`arranjo_pagamento: "PIX"`). |

Se nos resultados você só vê **crédito e débito**:

1. **Transactional/Financial**  
   - Pode ser que no período consultado **não tenha havido “Venda PIX” na maquininha** (só vendas em cartão).  
   - “Venda PIX” na maquininha viria com `meio_pagamento: "11"` e `arranjo_ur: "PIX"` no mesmo endpoint. Se a API não devolver nenhum item com isso, o EDI está só com cartão mesmo.

2. **PIX que “cai na conta”**  
   - PIX recebido como **transferência** (alguém te mandou PIX para a conta) pode **não** vir como venda no **transactional**, e sim em:
     - **financial** (como liquidação/transferência), ou  
     - **cashouts** (ex.: “Saldo Carteira” em PIX).

Por isso: **só crédito/débito nos dois primeiros nós não significa que o EDI “não tem PIX”; pode ser que o PIX esteja em outro tipo de movimento (financial/cashouts) ou que no período não tenha venda PIX no terminal.**

---

## O que foi alterado no workflow

Foi adicionado o uso do endpoint **cashouts**:

1. **Nó "PagBank EDI (cashouts)"**  
   - Chama a API:  
     `https://edi.api.pagbank.com.br/movement/v3.00/cashouts/{{ data }}?pageNumber=1&pageSize=1000`  
   - Mesmas credenciais (HTTP Basic Auth) dos outros nós EDI.

2. **Nó "Mapear cashouts"**  
   - Lê `detalhes` da resposta.  
   - Usa `data_cashout`, `valor_cashout`, `arranjo_pagamento` (quando for `"PIX"` grava descrição **PIX**), `tipo_cashout`, `codigo_cashout` / `codigo_ur`.  
   - Gera `id_unico` com prefixo **`c-`** para não bater com transactional (`id_unico` sem prefixo) e financial (prefixo `f-`).  
   - Envia tudo para o mesmo fluxo **Só novos** → **Inserir Supabase**.

Assim, além de **transactional** e **financial**, o workflow passa a incluir **cashouts**. Se o PagBank enviar PIX no cashout (ex.: “Saldo Carteira” em PIX), essas linhas passarão a aparecer nas transações no Supabase.

---

## Resumo

- **Só crédito/débito** nos nós transactional e financial = no período pode não ter “Venda PIX” no terminal, ou o PIX estar em outro tipo de movimento.
- **PIX no EDI** pode vir em:
  - **transactional** → venda PIX na maquininha (`meio_pagamento` 11).  
  - **financial** → liquidação/transferência.  
  - **cashouts** → saque/cashout em PIX (agora coberto pelo novo nó).
- Depois de rodar o workflow com o nó **PagBank EDI (cashouts)** e **Mapear cashouts**, confira de novo os resultados e a tabela `transacoes` no Supabase para ver se passaram a aparecer movimentos em PIX.

Se mesmo com cashouts não aparecer PIX, pode ser que a sua conta/contrato EDI só receba movimento de maquininha (cartão) e que **PIX recebido na conta** não seja exposto nesses endpoints; aí vale confirmar com o suporte PagBank o que exatamente entra em cada tipo de movimento (transactional, financial, cashouts) para o seu estabelecimento.
