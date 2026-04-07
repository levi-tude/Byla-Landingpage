# Calendário mensal (banco × planilha) — regras de produto

## Posicionamento no calendário

- Cada pagamento da planilha entra no **dia da data de pagamento** (`data` em YYYY-MM-DD), não no “dia da competência”.
- Os totais do dia somam o que caiu **naquele dia** pela planilha e pelo banco.

## Competência

- Quando o registro tiver **mês/ano de competência** (`mesCompetencia`, `anoCompetencia`):
  - **Sempre** mostrar na interface qual é a competência (ex.: “março de 2026”).
  - Se a competência for **diferente** do mês civil da data de pagamento, mostrar um **aviso visível** (badge/ícone + texto curto) explicando que o valor está no dia pela **data**, mas o **serviço referente** é da competência indicada.
- Se competência e mês da data forem o **mesmo**, pode bastar o rótulo normal de competência, sem alerta forte.

## API

- `GET /api/calendario-financeiro?mes=1-12&ano=YYYY` — agrega por dia do mês: entradas oficiais no banco (mesmas exclusões que `/api/transacoes` tipo entrada) e pagamentos da planilha FLUXO BYLA pela **data de pagamento**.

## Referência de implementação

- Helpers: `frontend/src/utils/competenciaPagamento.ts`
- Tela: **Calendário financeiro** (`/calendario-financeiro`) — grade mensal + modal de detalhes; link para **Validação de pagamentos** com `?data=YYYY-MM-DD`.
- Validação: tabela “Pagamentos da planilha no dia” e coluna Competência.
