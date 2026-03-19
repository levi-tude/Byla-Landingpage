# Critérios oficiais para identificar PIX no EDI PagBank (verificação)

Fonte: **Cenários de teste PagBank** – [developer.pagbank.com.br/docs/cenarios-de-teste](https://developer.pagbank.com.br/docs/cenarios-de-teste) (Cenário 4 – Venda PIX e exemplos cashout).

---

## 1. Transactional e Financial (vendas e liquidações)

Cada item em `detalhes` pode ser **PIX** quando:

| Campo | Valor que identifica PIX | Exemplo no JSON |
|-------|---------------------------|------------------|
| **meio_pagamento** | Código **11** (string ou número) | `"meio_pagamento": "11"` |
| **arranjo_ur** | **PIX** (texto) | `"arranjo_ur": "PIX"` |
| **instituicao_financeira** | Comum em PIX, mas não exclusivo | `"instituicao_financeira": "BACEN"` |

**Critério seguro para considerar PIX:**

- `meio_pagamento` igual a **11** (aceitar string `"11"` ou número `11`), **ou**
- `arranjo_ur` igual a **PIX** (comparação case-insensitive recomendada), **ou**
- `arranjo_pagamento` igual a **PIX** (se vier no mesmo objeto; em cenários de teste aparece em cashouts).

**Não usar só `instituicao_financeira === "BACEN"`** como critério único, pois pode haver outros usos.

---

## 2. Cashouts (saques / saldo para conta)

Cada item em `detalhes` do endpoint **cashouts** pode ser **PIX** quando:

| Campo | Valor que identifica PIX | Exemplo no JSON |
|-------|---------------------------|------------------|
| **arranjo_pagamento** | **PIX** (texto) | `"arranjo_pagamento": "PIX"` |

Estrutura do item: `tipo_registro` "4", `data_cashout`, `valor_cashout`, `codigo_cashout`, `codigo_ur`, `tipo_cashout` (ex.: "Saldo Carteira").

**Critério seguro:** `arranjo_pagamento` igual a **PIX** (comparação case-insensitive recomendada).

---

## 3. Resumo dos critérios implementados no workflow (verificado)

| Nó | Condição para descrição = "PIX" |
|----|----------------------------------|
| **Mapear para transacoes** | `(meio_pagamento == 11 \|\| String(meio_pagamento) === '11')` **ou** `arranjo_ur` = "PIX" (case-insensitive) **ou** `arranjo_pagamento` = "PIX" (case-insensitive) |
| **Mapear financial** | Mesma lógica do transactional |
| **Mapear cashouts** | `arranjo_pagamento` = "PIX" (case-insensitive, com trim) |

**Implementação:** o workflow foi atualizado para usar exatamente esses critérios, aceitando `meio_pagamento` como string ou número e comparando `arranjo_ur`/`arranjo_pagamento` em maiúsculas após trim.

---

## 4. Possíveis variações da API (e como tratar)

- **meio_pagamento** pode vir como número `11` em vez de string `"11"` → usar `d.meio_pagamento == 11 \|\| String(d.meio_pagamento) === '11'`.
- **arranjo_ur** / **arranjo_pagamento** podem vir com outro casing ("pix", "Pix") → usar `String(d.arranjo_ur || '').trim().toUpperCase() === 'PIX'` (e o mesmo para `arranjo_pagamento`).

Com isso, os critérios ficam alinhados à documentação e à prova de pequenas variações de tipo e de caixa.

---

## 5. Checklist de verificação (conferido)

- [x] **Transactional / Financial:** PIX identificado por `meio_pagamento` 11 (string ou número) conforme Cenário 4 PagBank.
- [x] **Transactional / Financial:** PIX identificado por `arranjo_ur === "PIX"` (agora case-insensitive).
- [x] **Transactional / Financial:** Incluído `arranjo_pagamento === "PIX"` (case-insensitive) caso a API envie o campo.
- [x] **Cashouts:** PIX identificado por `arranjo_pagamento === "PIX"` (case-insensitive + trim), conforme exemplo cashout Cenário 4.
- [x] **Cashouts:** Uso dos campos oficiais `data_cashout`, `valor_cashout`, `codigo_cashout`, `codigo_ur`, `tipo_cashout` no mapeamento.
- [x] **Endpoints:** workflow chama os três tipos de movimento (transactional, financial, cashouts) para não perder PIX em nenhum deles.
