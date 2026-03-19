# Tabela Supabase: `transacoes`

O workflow mapeia manualmente os campos do node **Create a row** para as colunas da tabela abaixo (a tabela **não** tem coluna `categoria`).

## Schema da tabela (conforme seu Supabase)

```sql
create table public.transacoes (
  id uuid not null default gen_random_uuid(),
  data date not null,
  pessoa text not null,
  valor numeric(12, 2) not null,
  descricao text null,
  tipo text not null,
  created_at timestamp without time zone null default now(),
  id_unico text null,
  mes text null,
  ano integer null,
  constraint transacoes_pkey primary key (id),
  constraint transacoes_id_unico_key unique (id_unico),
  constraint transacoes_tipo_check check (tipo in ('entrada', 'saida'))
);
```

## Mapeamento no workflow (Create a row)

| Coluna na tabela | Valor no n8n | Observação |
|------------------|--------------|------------|
| `data` | `{{ $json.data }}` | Enviada como date (YYYY-MM-DD) pelo Code |
| `pessoa` | `{{ $json.pessoa ?? '' }}` | NOT NULL – nome da pessoa (vindo da descrição da transação no Pluggy) |
| `valor` | `{{ $json.valor }}` | NOT NULL |
| `descricao` | `{{ $json.descricao }}` | Só o método de pagamento (ex.: PIX) |
| `tipo` | `{{ $json.tipo ?? 'saida' }}` | NOT NULL – só 'entrada' ou 'saida' |
| `id_unico` | `{{ $json.id_unico }}` | Unique – evita duplicatas |

As colunas `id`, `created_at`, `mes` e `ano` não são preenchidas pelo workflow (id e created_at têm default; mes e ano ficam null).

## Code in JavaScript (antes do Supabase)

- **pessoa:** texto da transação no Pluggy (nome da pessoa) – `r.description` ou `r.merchantName` ou `r.paymentData?.payer?.name`, com fallback `'Transação sem descrição'`.
- **descricao:** apenas o método de pagamento – `r.paymentData?.paymentMethod` (ex.: PIX), ou string vazia.
- **data:** só a parte da data (YYYY-MM-DD) quando vier em ISO.
- **tipo:** sempre `'entrada'` ou `'saida'` (fallback `'saida'`).
