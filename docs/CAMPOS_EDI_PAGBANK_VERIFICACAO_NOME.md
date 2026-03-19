# Verificação: campos da resposta EDI PagBank e campo “nome do pagador”

## O que foi feito

1. **Chamada real à API**  
   Foi chamada a API do PagBank EDI (mesma URL e autenticação do nó do workflow) para as datas **2025-02-15** e **2025-02-20** (transactional e financial).  
   - **Resultado:** a API respondeu com sucesso, mas com **`detalhes: []`** (nenhuma transação nesses dias para o estabelecimento). Por isso não foi possível inspecionar um payload real com dados.

2. **Estrutura oficial documentada**  
   Foi usada a estrutura do **Cenário 4: Venda PIX** da documentação PagBank ([Cenários de teste](https://developer.pagbank.com.br/docs/cenarios-de-teste)), que é o exemplo completo de resposta para uma venda PIX.

---

## Lista de campos em cada item de `detalhes` (transactional / financial)

Em cada objeto dentro de `detalhes`, a documentação traz exatamente estes campos (PIX e cartão):

| Campo | Exemplo / descrição |
|-------|----------------------|
| `movimento_api_codigo` | ID do movimento na API |
| `tipo_registro` | Tipo do registro (ex.: "1") |
| `estabelecimento` | Número do estabelecimento |
| `data_inicial_transacao` | Data da transação |
| `hora_inicial_transacao` | Hora da transação |
| `data_venda_ajuste` | Data venda/ajuste |
| `hora_venda_ajuste` | Hora venda/ajuste |
| `tipo_evento` | Tipo do evento |
| `tipo_transacao` | Tipo da transação |
| `codigo_transacao` | Código único da transação |
| `codigo_venda` | Código da venda |
| `valor_total_transacao` | Valor total |
| `valor_parcela` | Valor da parcela |
| `pagamento_prazo` | À vista / parcelado etc. |
| `plano` | Plano |
| `parcela` | Número da parcela |
| `quantidade_parcelas` | Quantidade de parcelas |
| `data_prevista_pagamento` | Data prevista de pagamento |
| `valor_original_transacao` | Valor original |
| `taxa_intermediacao` | Taxa |
| `tarifa_intermediacao` | Tarifa |
| `valor_liquido_transacao` | Valor líquido |
| `status_pagamento` | Status do pagamento |
| `meio_pagamento` | **"11" = PIX** |
| `instituicao_financeira` | Ex.: "BACEN" (PIX) |
| `canal_entrada` | Canal de entrada |
| `leitor` | Leitor |
| `meio_captura` | Meio de captura |
| `numero_serie_leitor` | Número de série do leitor |
| `tx_id` | ID da transação PIX |
| `codigo_ur` | Código UR |
| `arranjo_ur` | **"PIX"** (confirma PIX) |

No **financial** entram ainda, quando aplicável: `data_movimentacao`, `taxa_antecipacao`, `valor_liquido_antecipacao`.

---

## Conclusão sobre o campo que traz o nome

**Na estrutura documentada da API EDI PagBank (transactional e financial) não existe nenhum campo que represente o nome do pagador (quem enviou o PIX).**

- Nenhum dos nomes de campo acima é `nome`, `nome_pagador`, `nome_origem`, `remetente`, `favorecido`, `pagador` ou similar.
- Há códigos (`codigo_transacao`, `codigo_venda`, `tx_id`, `codigo_ur`) e dados de valor/data/meio de pagamento, mas **não** nome da pessoa.

Isso foi verificado:

1. Pela **lista oficial** de campos do Cenário 4 (Venda PIX).
2. Pela **chamada real** à API (que funcionou, mas retornou 0 transações nas datas testadas).

---

## Como conferir quando tiver transações

Quando houver movimento (ex.: um dia em que você recebeu PIX):

1. Rode o workflow no n8n nesse dia (ou use “Últimos 15 dias” e deixe um dia com PIX ser consultado).
2. Abra o nó **“PagBank EDI (transactional)”** ou **“PagBank EDI (financial)”** e veja a **saída JSON**.
3. Abra um item dentro de `detalhes` e confira **todas as chaves** do objeto. Se aparecer alguma chave que não está na tabela acima (por exemplo `nome_pagador`, `origem`, `nome_origem`), podemos usar esse campo no mapeamento para o **pessoa** no Supabase.

Arquivo de referência com a lista de campos: **`n8n-workflows/pagbank-edi-campos-detalhes-pix.json`**.
