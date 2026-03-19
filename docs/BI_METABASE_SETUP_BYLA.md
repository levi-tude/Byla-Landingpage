# BI – Setup Metabase e Dashboards Byla

Passo a passo para conectar o **Metabase** ao Supabase e criar os três dashboards principais, usando as views oficiais do projeto.

---

## 1. Instalar e subir o Metabase

### Opção A – Docker (recomendado)

```bash
docker run -d -p 3000:3000 --name metabase metabase/metabase
```

Acesse: **http://localhost:3000**. No primeiro acesso, crie a conta de administrador.

### Opção B – Sem Docker

Baixe o JAR em [metabase.com/docs/latest/installation-and-operation/running-the-metabase-jar-file](https://www.metabase.com/docs/latest/installation-and-operation/running-the-metabase-jar-file) e execute:

```bash
java -jar metabase.jar
```

---

## 2. Conectar ao Supabase (PostgreSQL)

1. No Metabase: **Settings** (engrenagem) → **Admin settings** → **Databases** → **Add database**.
2. Preencha:
   - **Database type:** PostgreSQL
   - **Display name:** Byla Supabase
   - **Host:** `db.flbimmwxxsvixhghmmfu.supabase.co`
   - **Port:** 5432
   - **Database name:** postgres
   - **Username:** postgres
   - **Password:** (em Supabase: Project Settings → Database → Connection string → senha)
3. **Save**. O Metabase vai listar tabelas e **views**; use as views abaixo.

---

## 3. Views disponíveis para o BI

| View | Uso nos dashboards |
|------|---------------------|
| `v_resumo_mensal_oficial` | Totais por mês (entradas, saídas, saldo). Gráficos de evolução e KPIs. |
| `v_entradas_oficial` | Detalhe de entradas (data, pessoa, valor, forma_pagamento). Tabelas e filtros. |
| `v_reconciliacao_mensalidades` | Conciliação cadastro × banco. Lista de confirmados/pendentes (inadimplência). |
| `transacoes` | Tabela bruta; use com filtros (tipo, mes, ano) quando precisar de flexibilidade. |

---

## 4. Dashboard 1 – Visão Geral Financeira

**Objetivo:** KPIs do mês e evolução da receita.

### 4.1 KPI – Total entradas (mês atual)

- **New → Question → Native query**
- Database: **Byla Supabase**
- SQL:

```sql
SELECT
  SUM(total_entradas) AS total_entradas
FROM v_resumo_mensal_oficial
WHERE ano = EXTRACT(YEAR FROM CURRENT_DATE)
  AND mes = EXTRACT(MONTH FROM CURRENT_DATE);
```

- **Visualization:** Number.
- Salve como "KPI - Total entradas mês".

### 4.2 KPI – Total saídas (mês atual)

```sql
SELECT
  SUM(total_saidas) AS total_saidas
FROM v_resumo_mensal_oficial
WHERE ano = EXTRACT(YEAR FROM CURRENT_DATE)
  AND mes = EXTRACT(MONTH FROM CURRENT_DATE);
```

- **Visualization:** Number.

### 4.3 KPI – Saldo do mês

```sql
SELECT
  SUM(saldo_mes) AS saldo_mes
FROM v_resumo_mensal_oficial
WHERE ano = EXTRACT(YEAR FROM CURRENT_DATE)
  AND mes = EXTRACT(MONTH FROM CURRENT_DATE);
```

- **Visualization:** Number.

### 4.4 Gráfico – Evolução da receita (últimos 6 meses)

```sql
SELECT
  ano,
  mes,
  TO_CHAR(TO_DATE(mes::text || '-' || ano::text, 'MM-YYYY'), 'TMM Mon/YY') AS mes_ano,
  total_entradas,
  total_saidas,
  saldo_mes
FROM v_resumo_mensal_oficial
WHERE (ano || '-' || LPAD(mes::text, 2, '0')) >= TO_CHAR(CURRENT_DATE - INTERVAL '6 months', 'YYYY-MM')
ORDER BY ano, mes;
```

- **Visualization:** Line chart. Eixo X: `mes_ano`. Série: `total_entradas`, `total_saidas` (e opcionalmente `saldo_mes`).

### 4.5 Montar o dashboard

- **New → Dashboard** → nome "Byla - Visão Geral Financeira".
- **Add** as questões salvas (KPIs + gráfico de linha). Organize os números no topo e o gráfico abaixo.

---

## 5. Dashboard 2 – Conciliação e Inadimplência

**Objetivo:** Mensalidades confirmadas no banco vs pendentes.

### 5.1 Tabela – Pendentes (não confirmados no banco)

```sql
SELECT
  atividade_nome,
  aluno_nome,
  valor,
  data_pagamento,
  nome_pagador_cadastro,
  confirmado_banco
FROM v_reconciliacao_mensalidades
WHERE confirmado_banco = false
  AND data_pagamento >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
ORDER BY data_pagamento DESC, aluno_nome;
```

- **Visualization:** Table.
- Salve como "Inadimplentes - pendentes no banco".

### 5.2 Número – Quantidade de pendentes (mês de referência)

```sql
SELECT
  COUNT(*) AS qtd_pendentes
FROM v_reconciliacao_mensalidades
WHERE confirmado_banco = false
  AND data_pagamento >= DATE_TRUNC('month', CURRENT_DATE)
  AND data_pagamento < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

- **Visualization:** Number.

### 5.3 Taxa de adimplência (mês atual)

A view não tem coluna "status"; use `confirmado_banco`:

```sql
SELECT
  COUNT(*) FILTER (WHERE confirmado_banco = true) AS confirmados,
  COUNT(*) FILTER (WHERE confirmado_banco = false) AS pendentes,
  COUNT(*) AS total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE confirmado_banco = true) / NULLIF(COUNT(*), 0),
    2
  ) AS taxa_adimplencia_pct
FROM v_reconciliacao_mensalidades
WHERE data_pagamento >= DATE_TRUNC('month', CURRENT_DATE)
  AND data_pagamento < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

- **Visualization:** Table ou vários Numbers (confirmados, pendentes, taxa).

### 5.4 Dashboard

- **New → Dashboard** → "Byla - Conciliação e Inadimplência".
- Adicione as questões acima.

---

## 6. Dashboard 3 – Entradas (detalhe)

**Objetivo:** Listar entradas recentes e, se quiser, agrupar por descrição/forma de pagamento.

### 6.1 Tabela – Últimas entradas

```sql
SELECT
  data,
  pessoa,
  valor,
  forma_pagamento_banco AS forma_pagamento
FROM v_entradas_oficial
ORDER BY data DESC
LIMIT 200;
```

- **Visualization:** Table.

### 6.2 Gráfico – Entradas por descrição (agrupado, mês atual)

```sql
SELECT
  COALESCE(forma_pagamento_banco, 'Outros') AS forma_pagamento,
  SUM(valor) AS total
FROM v_entradas_oficial
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
GROUP BY forma_pagamento_banco
ORDER BY total DESC;
```

- **Visualization:** Bar chart ou Pie chart.

### 6.3 Dashboard

- **New → Dashboard** → "Byla - Entradas (detalhe)".
- Adicione a tabela e o gráfico.

---

## 7. Resumo e manutenção

- **Fonte da verdade:** `transacoes`; BI usa apenas **views** (`v_resumo_mensal_oficial`, `v_entradas_oficial`, `v_reconciliacao_mensalidades`).
- **Atualização:** Metabase lê direto do Supabase; ao rodar os workflows (EDI + planilha), os dashboards refletem os dados novos.
- **Segurança:** Em produção, restrinja acesso ao Metabase (usuários/senha ou SSO) e mantenha a senha do Supabase em variável de ambiente ou gestor de segredos.

Para mais detalhes visuais dos layouts, veja `docs/EXEMPLO_DASHBOARDS_BI.md`.
