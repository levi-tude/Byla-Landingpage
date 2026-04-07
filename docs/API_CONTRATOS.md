# Contratos de API (principais)

Contratos de referencia para frontend e backend nas rotas mais sensiveis.

## Convencoes

- Erro de validacao: `400` com `{ error: string }` (mensagem pode listar campos invalidos; ver `backend/src/validation/apiQuery.ts`)
- Dependencia nao configurada (ex.: Supabase): `503` com `{ error: string }`
- Erro de integracao externa (ex.: Sheets/Supabase): `502` quando aplicavel
- Header de rastreio: `x-request-id` em todas as respostas (quando backend estiver ativo)

## `GET /api/conciliacao-vencimentos?mes=1-12&ano=YYYY`

### Resposta 200 (resumo)

```json
{
  "mes": 3,
  "ano": 2026,
  "tolerancia_dias": 5,
  "hoje": "2026-03-18",
  "kpis": {
    "total": 0,
    "ok": 0,
    "atrasado": 0,
    "em_aberto": 0,
    "a_vencer": 0,
    "sem_vencimento": 0,
    "banco_ok": 0,
    "banco_pendente": 0,
    "banco_ambiguo": 0
  },
  "itens": []
}
```

### Campos adicionais por item

- `banco_confirmado`: `boolean | null`
- `banco_status`: `ok | possivel | nao | nao_aplicavel`
- `data_banco`, `pessoa_banco`, `transacao_banco_id`, `banco_mensagem`

## `GET /api/validacao-pagamentos-diaria?data=YYYY-MM-DD&aba=...&modalidade=...`

### Regras de match

- tolerancia de valor;
- compatibilidade de nome (aluno/responsavel/pagador pix);
- janela de dias no banco;
- regra especial Pilates (pagador via view);
- cada transacao do banco pode ser usada uma unica vez.

## `GET /api/calendario-financeiro?mes=1-12&ano=YYYY`

- Agrega por dia do mes:
  - entradas do banco (regras EA/Blead/Samuel aplicadas)
  - pagamentos da planilha por data de pagamento

## `GET /api/transacoes?mes=1-12&ano=YYYY&tipo=entrada|saida`

- Lista transacoes do mes ja filtrando entradas externas e saidas vinculadas.

## Parametros centrais de regra (backend)

Configurados em `backend/src/businessRules.ts` e opcionais no `.env`:

- `BYLA_BANCO_JANELA_DIAS`
- `BYLA_MATCH_VALOR_TOLERANCIA`
- `BYLA_GRACE_DIAS_APOS_VENCIMENTO`
- `BYLA_EXTERNAL_ENTRIES`
- `BYLA_SAMUEL_NAME_PREFIX`
- `BYLA_EXTERNAL_PAIR_TOLERANCE`
- `BYLA_ELIGIBLE_SHEETS`

## Organizacao das rotas (backend)

O router principal e [`backend/src/routes/api.ts`](../backend/src/routes/api.ts) (agrega sub-routers). Modulos por area:

- `calendario.ts`, `conciliacao.ts`, `relatorios.ts` (factory com `GetFluxoCompletoUseCase`)
- `planilhaFluxoByla.ts` — debug e pagamentos por aba
- `fontes.ts`, `transacoes.ts`, `despesas.ts`
- `cadastroCompleto.ts` — `dados-completos`, `*-completo`, `fluxo-completo`

Logica de match planilha x banco (reutilizada na validacao diaria e testada): [`backend/src/logic/conciliacaoPagamentoMatch.ts`](../backend/src/logic/conciliacaoPagamentoMatch.ts).
