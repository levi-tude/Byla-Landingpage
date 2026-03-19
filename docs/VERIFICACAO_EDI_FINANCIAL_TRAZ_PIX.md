# Verificação: EDI PagBank traz PIX nas transações

## Resposta direta

**Sim.** O extrato EDI do PagBank (tanto **transactional** quanto **financial**) inclui transações PIX.

---

## Onde o PIX aparece

| Endpoint EDI      | Contém PIX? | Observação |
|-------------------|-------------|------------|
| **transactional** | Sim         | Evento da venda (data da transação, valor, código) |
| **financial**     | Sim         | Liquidação (quando o valor cai na conta) |

Fonte: documentação PagBank – [Cenários de teste](https://developer.pagbank.com.br/docs/cenarios-de-teste), **Cenário 4: Venda PIX** e cenários com `meio_pagamento: "11"`.

---

## Como o PIX é identificado na resposta

Nos objetos de cada item em `detalhes`:

- **`meio_pagamento": "11"`** → PIX (código oficial na EDI)
- **`arranjo_ur": "PIX"`** → confirma que é PIX
- **`instituicao_financeira": "BACEN"`** → comum em PIX

Exemplo (trecho) de uma venda PIX no **transactional**:

```json
{
  "codigo_transacao": "76C4327C1B414A119CDD2BF2CFC2849D",
  "codigo_venda": "666667",
  "valor_total_transacao": 108.96,
  "valor_liquido_transacao": 107.88,
  "meio_pagamento": "11",
  "instituicao_financeira": "BACEN",
  "arranjo_ur": "PIX",
  "data_inicial_transacao": "2024-07-29",
  "data_venda_ajuste": "2024-07-29"
}
```

No **financial** a estrutura é a mesma, com campos como `data_movimentacao` e `valor_liquido_transacao` para a liquidação.

---

## O que o workflow faz com isso

1. **Transactional**  
   - Chama o EDI por data.  
   - Se `meio_pagamento === "11"` ou `arranjo_ur === "PIX"`, a **descrição** é definida como **"PIX"**.  
   - Caso contrário, usa `arranjo_ur` ou outros campos (ex.: cartão).

2. **Financial**  
   - Mesma lógica: PIX identificado por `meio_pagamento "11"` ou `arranjo_ur "PIX"`.  
   - Descrição **"PIX"** para liquidações PIX.  
   - Uso de `data_movimentacao` (ou fallbacks) para a data.

3. **Evitar duplicidade**  
   - Transactional e financial podem trazer a mesma venda (evento + liquidação).  
   - Os **id_unico** são diferentes: transactional sem prefixo, financial com prefixo **`f-`**, então ambos podem ser salvos sem duplicar registro na tabela `transacoes` (ou você pode, em regra de negócio, preferir só um deles).

---

## Nome do pagador (PIX) – por que não aparece na EDI?

Você tem razão: **no extrato do app/banco, quando você recebe um PIX, costuma aparecer o nome de quem enviou.** O banco tem essa informação; faz sentido esperar o mesmo na API. O que acontece: **no app** o PagBank mostra quem enviou o PIX; **na API EDI** (`movement/v3.00`) a documentação e os cenários de teste **não mostram** campo "nome do pagador" na resposta JSON – só códigos, valores, datas. Ou seja: o app mostra, a API (pelo que está documentado) não expõe. Pode ser foco da EDI em conciliação (valor/data/código), ou o campo existir em outro endpoint/versão. **Na prática:** (1) Rode o workflow num dia com PIX e confira a saída bruta do nó EDI – veja se aparece algum campo com nome (`nome_pagador`, `origem`, etc.) e use no mapeamento se existir. (2) Pergunte ao suporte PagBank se a API EDI retorna nome do pagador PIX e qual o nome do campo. (3) Enquanto não tiver o nome, use **valor + data + código** para ligar no Supabase, ou a planilha/extrato do app quando precisar do nome.

Na resposta EDI existem, por exemplo, `tx_id`, `codigo_ur`, `codigo_transacao`, `codigo_venda`.  

Por isso, no Supabase o campo **pessoa** para PIX tende a vir como “Transação &lt;codigo_venda&gt;” ou “Liquidação &lt;codigo&gt;”.  
Até confirmar um campo de nome na API, use valor + data + código para ligar no Supabase, ou a planilha/extrato do app quando precisar do nome para a ligação.

---

## Checklist do que foi verificado

- [x] EDI **financial** traz PIX (liquidações com `meio_pagamento` 11 e `arranjo_ur` PIX).
- [x] EDI **transactional** traz PIX (evento da venda com os mesmos identificadores).
- [x] Workflow atual usa os dois endpoints (transactional + financial).
- [x] Mapeamento identifica PIX por `meio_pagamento === '11'` e `arranjo_ur === 'PIX'` e preenche **descricao** como **"PIX"** em ambos os nós (Mapear transacional e Mapear financial).
- [x] Data no financial usa `data_movimentacao` entre os fallbacks.
- [x] EDI não fornece nome do pagador PIX; pessoa fica como código/transação ou liquidação.

---

## Referências

- [Cenários de teste PagBank – Cenário 4: Venda PIX](https://developer.pagbank.com.br/docs/cenarios-de-teste#link-cenario-04)
- [API do extrato EDI](https://developer.pagbank.com.br/docs/api-do-extrato-edi)
- Workflow: `n8n-workflows/workflow-pagbank-edi-para-supabase.json`
