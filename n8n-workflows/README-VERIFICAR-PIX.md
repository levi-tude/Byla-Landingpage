# Como verificar se o retorno da API EDI traz PIX

## Script

No terminal, na pasta `n8n-workflows`:

```bash
node verificar-retorno-edi-pix.cjs [AAAA-MM-DD]
```

- **Com data:** `node verificar-retorno-edi-pix.cjs 2025-02-15`
- **Sem data:** usa ontem automaticamente.

O script:

1. Chama a API PagBank EDI (transactional, financial, cashouts) para a data informada.
2. Salva o JSON bruto em:
   - `resp-transactional-AAAA-MM-DD.json`
   - `resp-financial-AAAA-MM-DD.json`
   - `resp-cashouts-AAAA-MM-DD.json`
3. Analisa cada `detalhes` e imprime:
   - total de itens por endpoint;
   - quantos itens são PIX (critério: `meio_pagamento` 11 ou `arranjo_ur`/`arranjo_pagamento` = PIX);
   - valores únicos de `meio_pagamento`, `arranjo_ur`, `arranjo_pagamento`;
   - conclusão (se há PIX no retorno ou não).

## Credenciais

O script usa as mesmas credenciais do workflow (do arquivo `n8n-credenciais.local`). Para usar outras:

- Variáveis de ambiente: `PAGBANK_EDI_USER` e `PAGBANK_EDI_TOKEN`
- Ou edite USER e TOKEN no início do arquivo `verificar-retorno-edi-pix.cjs`.

## Quando rodar

- **Data com movimento:** use uma data em que você sabe que teve vendas/PIX (ex.: um dia em que o n8n trouxe resultados). Assim você vê o JSON real e se há itens PIX.
- **Data sem movimento:** a API devolve `detalhes: []`; a conclusão será “Nenhum item retornado nessa data”.

## Exemplo de saída com dados

Se houver itens e algum for PIX:

```
--- transactional ---
Total itens: 5
Itens PIX (meio_pagamento 11 ou arranjo PIX): 2
meio_pagamento encontrados: 3, 11
arranjo_ur encontrados: CREDIT_VISA, PIX
...
Conclusão: SIM, o retorno contém 2 item(ns) PIX.
```

Assim você confere com certeza se o retorno está trazendo PIX.
