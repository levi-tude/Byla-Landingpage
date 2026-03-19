# Exemplos de Dashboards BI para Byla

Este documento mostra como serão os painéis de BI que o sistema vai gerar.

---

## Dashboard 1: Visão Geral Financeira

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  BYLA - VISÃO GERAL FINANCEIRA                    Fevereiro 2025 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │  Entradas   │  │   Saídas    │  │    Saldo    │  │ Variação││
│  │  R$ 12.500  │  │  R$ 8.200   │  │  R$ 4.300   │  │  +8%    ││
│  │     ↑       │  │     ↓       │  │     ↑       │  │  vs Jan ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Evolução da Receita (últimos 6 meses)                    │  │
│  │                                                            │  │
│  │  15k ┤                                            ●        │  │
│  │      │                                    ●               │  │
│  │  10k ┤                        ●   ●                       │  │
│  │      │            ●   ●                                   │  │
│  │   5k ┤                                                    │  │
│  │      └────┬────┬────┬────┬────┬────                      │  │
│  │          Set  Out  Nov  Dez  Jan  Fev                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │  Entradas por Forma Pgto    │  │  Entradas x Saídas      │  │
│  │                              │  │                          │  │
│  │      PIX (45%)               │  │  15k ┤ ■ Entradas       │  │
│  │      ████████████            │  │      │ □ Saídas         │  │
│  │                              │  │  10k ┤ ■                │  │
│  │   Débito (30%)               │  │      │ ■ □              │  │
│  │      ████████                │  │   5k ┤ ■ □              │  │
│  │                              │  │      └─┬──┬──┬──┬──┬──  │  │
│  │  Crédito (25%)               │  │       D  J  F  M  A  M  │  │
│  │      ███████                 │  │                          │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Métricas

- **Entradas:** Total de receitas do mês
- **Saídas:** Total de despesas do mês
- **Saldo:** Entradas - Saídas
- **Variação:** Comparação com mês anterior (%)

### Gráficos

1. **Linha:** Evolução da receita (últimos 6 meses)
2. **Barras horizontais:** Entradas por forma de pagamento (PIX, Débito, Crédito)
3. **Barras agrupadas:** Entradas x Saídas por mês

### Fonte de Dados

- View: `v_resumo_mensal_oficial`
- Tabela: `transacoes` (agregada por `mes`, `ano`, `tipo`)

---

## Dashboard 2: Receita por Atividade

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  BYLA - RECEITA POR ATIVIDADE                     Fevereiro 2025 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Receita por Modalidade                                    │  │
│  │                                                            │  │
│  │  Pilates       ████████████████████████ R$ 6.900 (55%)    │  │
│  │  Dança         ████████████ R$ 3.200 (26%)                │  │
│  │  Locações      ████████ R$ 2.400 (19%)                    │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │  Alunos Ativos              │  │  Ticket Médio           │  │
│  │                              │  │                          │  │
│  │  Pilates: 30 alunos          │  │  Pilates: R$ 230        │  │
│  │  Dança: 14 alunos            │  │  Dança: R$ 228          │  │
│  │  Teatro: 8 alunos            │  │  Teatro: R$ 200         │  │
│  │                              │  │                          │  │
│  │  Total: 52 alunos            │  │  Geral: R$ 225          │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Evolução de Alunos por Atividade (últimos 6 meses)       │  │
│  │                                                            │  │
│  │  35 ┤                                            ●─Pilates │  │
│  │     │                                    ●               │  │
│  │  25 ┤                        ●   ●                       │  │
│  │     │            ●   ●                   ▲─Dança         │  │
│  │  15 ┤    ▲   ▲   ▲   ▲   ▲   ▲                          │  │
│  │     │                        ■   ■   ■   ■─Teatro        │  │
│  │   5 ┤    ■   ■   ■   ■                                   │  │
│  │     └────┬───┬───┬───┬───┬───┬──                        │  │
│  │         Set Out Nov Dez Jan Fev                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Métricas

- **Receita por modalidade:** Total de entradas por atividade
- **Alunos ativos:** Quantidade de alunos por atividade
- **Ticket médio:** Receita / Alunos (por atividade)

### Gráficos

1. **Barras horizontais:** Receita por modalidade (com %)
2. **Cards:** Alunos ativos e ticket médio
3. **Linhas múltiplas:** Evolução de alunos por atividade

### Fonte de Dados

- View: `v_mensalidades_por_atividade`
- View: `v_alunos_por_atividade`
- Tabela: `aluno_planos` (join com `atividades`)

---

## Dashboard 3: Conciliação e Inadimplência

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  BYLA - CONCILIAÇÃO E INADIMPLÊNCIA               Fevereiro 2025 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Confirmados │  │  Pendentes  │  │   Taxa de   │             │
│  │     49      │  │      3      │  │ Adimplência │             │
│  │   (94%)     │  │    (6%)     │  │     94%     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Mensalidades Confirmadas (últimos 10)                    │  │
│  ├─────────┬───────────┬──────────┬──────────┬──────────────┤  │
│  │ Aluno   │ Atividade │ Valor    │ Data Pgto│ Status       │  │
│  ├─────────┼───────────┼──────────┼──────────┼──────────────┤  │
│  │ João    │ Pilates   │ R$ 230   │ 20/02    │ ✅ Confirmado│  │
│  │ Maria   │ Dança     │ R$ 228   │ 18/02    │ ✅ Confirmado│  │
│  │ Pedro   │ Pilates   │ R$ 230   │ 15/02    │ ✅ Confirmado│  │
│  │ Ana     │ Teatro    │ R$ 200   │ 12/02    │ ✅ Confirmado│  │
│  │ Carlos  │ Pilates   │ R$ 230   │ 10/02    │ ✅ Confirmado│  │
│  │ ...     │ ...       │ ...      │ ...      │ ...          │  │
│  └─────────┴───────────┴──────────┴──────────┴──────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Mensalidades Pendentes (ATENÇÃO!)                        │  │
│  ├─────────┬───────────┬──────────┬──────────┬──────────────┤  │
│  │ Aluno   │ Atividade │ Valor    │ Venc.    │ Dias Atraso  │  │
│  ├─────────┼───────────┼──────────┼──────────┼──────────────┤  │
│  │ Lucas   │ Pilates   │ R$ 230   │ 05/02    │ 18 dias      │  │
│  │ Fernanda│ Dança     │ R$ 228   │ 05/02    │ 18 dias      │  │
│  │ Rafael  │ Teatro    │ R$ 200   │ 05/02    │ 18 dias      │  │
│  └─────────┴───────────┴──────────┴──────────┴──────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Evolução da Taxa de Adimplência (últimos 6 meses)        │  │
│  │                                                            │  │
│  │ 100% ┤ ●───●───●───●───●───●                             │  │
│  │      │                                                    │  │
│  │  95% ┤                                                    │  │
│  │      │                                                    │  │
│  │  90% ┤                                                    │  │
│  │      └────┬───┬───┬───┬───┬───┬──                        │  │
│  │          Set Out Nov Dez Jan Fev                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Métricas

- **Confirmados:** Mensalidades com transação no banco
- **Pendentes:** Mensalidades sem transação no banco
- **Taxa de adimplência:** Confirmados / Total (%)

### Tabelas

1. **Mensalidades confirmadas:** Últimas 10 (verde)
2. **Mensalidades pendentes:** Todas (vermelho, ordenadas por dias de atraso)

### Gráficos

1. **Linha:** Evolução da taxa de adimplência (últimos 6 meses)

### Fonte de Dados

- View: `v_reconciliacao_mensalidades`

---

## Dashboard 4: Operacional (Futuro)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  BYLA - OPERACIONAL                               Fevereiro 2025 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │  Ocupação de Salas (%)      │  │  Receita por Sala       │  │
│  │                              │  │                          │  │
│  │  Atendimentos: 85%           │  │  Atendimentos: R$ 4.2k  │  │
│  │  Movimento: 92%              │  │  Movimento: R$ 5.8k     │  │
│  │  Teatro: 78%                 │  │  Teatro: R$ 2.5k        │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Despesas por Categoria                                    │  │
│  │                                                            │  │
│  │  Salários       ████████████████████ R$ 6.000 (73%)       │  │
│  │  Manutenção     ████ R$ 1.500 (18%)                       │  │
│  │  Materiais      ██ R$ 700 (9%)                            │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Agenda da Semana (Próximas Locações)                     │  │
│  ├──────┬──────────┬────────────────┬────────────────────────┤  │
│  │ Dia  │ Sala     │ Horário        │ Cliente                │  │
│  ├──────┼──────────┼────────────────┼────────────────────────┤  │
│  │ Seg  │ Teatro   │ 19h-21h        │ Grupo de Teatro XYZ    │  │
│  │ Ter  │ Movimento│ 18h-20h        │ Aula de Dança          │  │
│  │ Qua  │ Atend.   │ 14h-16h        │ Sessão Terapia         │  │
│  │ ...  │ ...      │ ...            │ ...                    │  │
│  └──────┴──────────┴────────────────┴────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Métricas

- **Ocupação de salas:** % de horas utilizadas vs disponíveis
- **Receita por sala:** Total de locações por sala
- **Despesas por categoria:** Salários, Manutenção, Materiais, etc.

### Tabelas

1. **Agenda da semana:** Próximas locações agendadas

### Fonte de Dados

- Tabela: `locacoes` (a criar)
- Tabela: `transacoes` (filtradas por tipo = "saida", com categorização)

---

## Como Implementar

### Passo 1: Instalar Metabase (ou Power BI)

**Metabase (grátis, open source):**

```bash
docker run -d -p 3000:3000 --name metabase metabase/metabase
```

Acesse: `http://localhost:3000`

**Power BI:**
- Baixar Power BI Desktop (grátis)
- Instalar no Windows

### Passo 2: Conectar no Supabase

**Metabase:**
1. Admin → Databases → Add database
2. Database type: **PostgreSQL**
3. Host: `db.flbimmwxxsvixhghmmfu.supabase.co`
4. Port: `5432`
5. Database name: `postgres`
6. Username: `postgres`
7. Password: (do Supabase Settings → Database)
8. Save

**Power BI:**
1. Get Data → PostgreSQL
2. Server: `db.flbimmwxxsvixhghmmfu.supabase.co:5432`
3. Database: `postgres`
4. Username/Password: (do Supabase)

### Passo 3: Criar Dashboards

**Metabase:**
1. New → Dashboard
2. Add Question (gráfico/tabela)
3. Escolher a view (ex.: `v_resumo_mensal_oficial`)
4. Arrastar campos para X/Y
5. Salvar

**Power BI:**
1. Importar tabelas/views
2. Relationships (conectar tabelas)
3. Arrastar campos para visualizações
4. Publicar

### Passo 4: Compartilhar

**Metabase:**
- Gerar link público (Settings → Public Sharing)
- Ou criar usuários (Settings → People)

**Power BI:**
- Publicar no Power BI Service (cloud)
- Compartilhar link ou incorporar em site

---

## Queries SQL Úteis para o BI

### Receita por Atividade (mês atual)

```sql
SELECT 
  a.nome AS atividade,
  COUNT(DISTINCT ap.aluno_id) AS alunos,
  SUM(t.valor) AS receita_total,
  AVG(t.valor) AS ticket_medio
FROM transacoes t
JOIN aluno_planos ap ON t.pessoa ILIKE '%' || (SELECT nome FROM alunos WHERE id = ap.aluno_id) || '%'
JOIN atividades a ON ap.atividade_id = a.id
WHERE t.tipo = 'entrada'
  AND t.mes = EXTRACT(MONTH FROM CURRENT_DATE)
  AND t.ano = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY a.nome
ORDER BY receita_total DESC;
```

### Taxa de Adimplência (mês atual)

```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'Confirmado') AS confirmados,
  COUNT(*) FILTER (WHERE status = 'Pendente') AS pendentes,
  COUNT(*) AS total,
  ROUND(COUNT(*) FILTER (WHERE status = 'Confirmado')::numeric / COUNT(*) * 100, 2) AS taxa_adimplencia
FROM v_reconciliacao_mensalidades
WHERE mes = EXTRACT(MONTH FROM CURRENT_DATE)
  AND ano = EXTRACT(YEAR FROM CURRENT_DATE);
```

### Evolução da Receita (últimos 6 meses)

```sql
SELECT 
  TO_CHAR(TO_DATE(mes || '-' || ano, 'MM-YYYY'), 'Mon/YY') AS mes_ano,
  total_entradas
FROM v_resumo_mensal_oficial
WHERE TO_DATE(mes || '-' || ano, 'MM-YYYY') >= CURRENT_DATE - INTERVAL '6 months'
ORDER BY ano, mes;
```

---

## Exemplo de Relatório Automático (WhatsApp)

### Mensagem Gerada pela IA

```
📊 *Relatório Financeiro - Fevereiro 2025*

💰 *Resumo Geral*
✅ Entradas: R$ 12.500
❌ Saídas: R$ 8.200
💵 Saldo: R$ 4.300
📈 Variação: +8% vs Janeiro

📚 *Receita por Atividade*
• Pilates: R$ 6.900 (55%) - 30 alunos
• Dança: R$ 3.200 (26%) - 14 alunos
• Locações: R$ 2.400 (19%)

⚠️ *Inadimplentes (3)*
• Lucas Silva - Pilates - R$ 230 (18 dias)
• Fernanda Costa - Dança - R$ 228 (18 dias)
• Rafael Santos - Teatro - R$ 200 (18 dias)

💡 *Insights da IA*
1. Pilates continua sendo a principal fonte de receita. Considerar abrir turma extra.
2. Dança teve crescimento de 15% vs janeiro. Tendência positiva.
3. 3 inadimplências detectadas. Recomendo contato imediato para regularização.
4. Saldo operacional saudável (R$ 4.300). Margem de 34%.

📅 *Próximo relatório: 01/03/2025*
```

### Como Gerar Automaticamente

**Workflow n8n:**
1. **Schedule Trigger:** Dia 1º do mês, 8h
2. **Supabase Query:** Buscar dados do mês anterior (views)
3. **Code Node:** Formatar dados em JSON
4. **HTTP Request:** Enviar para API da IA (OpenAI/Claude)
   - Prompt: "Gere um resumo executivo com esses dados: {dados}"
5. **WhatsApp Node:** Enviar mensagem formatada

---

## Próximos Passos

1. **Implementar Metabase:** 1-2 dias
2. **Criar 3 dashboards principais:** 2-3 dias
3. **Testar com dados reais:** 1 dia
4. **Apresentar para os donos:** 1 dia
5. **Ajustar conforme feedback:** 1-2 dias

**Total:** 1-2 semanas para BI completo funcionando.

---

**Com esses dashboards, a Byla terá visão completa do negócio em tempo real, sem planilhas manuais.**
