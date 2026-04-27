# Checklist de corte de planilha por modulo

Objetivo: desligar dependencia de planilha aos poucos, sem quebrar operacao.

---

## 1) Estado atual (snapshot)

### Ja pronto / avancado

- Fluxo operacional no banco (`fluxo_alunos_operacionais`, `fluxo_pagamentos_operacionais`) com CRUD no app.
- Controle de caixa com estrutura padrao mensal e tela de edicao (`/controle-caixa`).
- Cobertura mensal do `controle_caixa_periodos` para meses com operacao em 2026 (01..08).

### Ainda com dependencia de planilha (fallback ou fonte principal)

- `alunos-completo`, `modalidades-completo`, `pendencias-completo`: hoje seguem regra de planilha como complemento/fonte principal.
- Relatorios e conciliacao ainda leem dados da planilha em partes do fluxo.
- Calendario financeiro ainda cruza planilha de pagamentos.

---

## 2) Regra de corte (simples)

Para cada modulo, so cortar planilha quando os 3 criterios abaixo estiverem true:

1. **Paridade**: resultado banco vs planilha sem divergencia material.
2. **Operacao real**: secretaria e admin usaram no sistema por pelo menos 1 ciclo mensal.
3. **Observabilidade**: existe consulta/relatorio de validacao para monitorar.

---

## 3) Ordem recomendada de corte

1. **Controle de caixa** (admin)
2. **Fluxo operacional** (secretaria)
3. **Pendencias**
4. **Modalidades**
5. **Alunos completo**
6. **Relatorios / conciliacao / calendario** (por ultimo)

Motivo: essa ordem reduz risco, porque os primeiros modulos ja estao mais maduros no Supabase.

---

## 4) Checklist por modulo

## Modulo A - Controle de caixa

- [x] Tabela operacional existe (`controle_caixa_*`).
- [x] Tela de edicao no sistema existe.
- [x] Meses 2026/01..08 cobertos.
- [ ] Fechar regra de migracao de valores historicos para todos os meses-alvo.
- [ ] Validar 1 fechamento mensal completo sem usar planilha.
- [ ] Desligar fallback de planilha no fluxo completo (quando consolidado).

### Gate de corte
- [ ] Aprovar em UAT com admin.
- [ ] Congelar planilha para este modulo (somente consulta).

## Modulo B - Fluxo operacional

- [x] CRUD no sistema (alunos/pagamentos).
- [x] Auditoria operacional (`fluxo_operacional_auditoria`).
- [ ] Fechar rotina de onboarding para cadastrar direto no sistema (sem editar planilha).
- [ ] Validar reconciliacao de pagamentos por 1 ciclo.

### Gate de corte
- [ ] Secretaria operar 100% no sistema por 30 dias.

## Modulo C - Pendencias / modalidades / alunos completo

- [ ] Definir regras de verdade unica por campo (quem manda: banco vs planilha).
- [ ] Criar relatorio de divergencia automatizado.
- [ ] Ajustar casos de uso para Supabase-primary com fallback opcional.

### Gate de corte
- [ ] Divergencia abaixo do limite aceito por 2 semanas.

## Modulo D - Relatorios / conciliacao / calendario

- [ ] Remover dependencias diretas de planilha de pagamentos onde possivel.
- [ ] Garantir que os relatorios usam base operacional no Supabase.
- [ ] Manter planilha apenas como auditoria historica, nao como fonte operacional.

### Gate de corte
- [ ] KPI de relatorio e conciliacao bate com fechamento mensal.

---

## 5) Comandos de verificacao (pre-corte)

## Banco

```sql
-- Cobertura mensal do controle
select ano, mes, origem from public.controle_caixa_periodos order by ano desc, mes desc;

-- Fluxo operacional por mes
select date_part('year', data_pagamento)::int as ano,
       date_part('month', data_pagamento)::int as mes,
       count(*)::int as qtd
from public.fluxo_pagamentos_operacionais
group by 1,2
order by 1 desc,2 desc;
```

## Scripts existentes no backend

```bash
npm run migrate:fluxo-operacional -- 2026
npm run validate:fluxo-migracao -- 2026
npm run migrate:controle-mes -- 3 2026
```

---

## 6) Definicao do dia da virada

Quando os gates acima estiverem verdes:

1. Congelar edicao manual das planilhas operacionais.
2. Comunicar equipe: "a partir de hoje, alteracoes so no sistema".
3. Monitorar 7 dias com checklist diario de divergencias.
4. Se ok, remover fallback por modulo (feature flag/env).

---

## 7) Flags de controle (ambiente)

- `BYLA_FLUXO_SOURCE_PRIMARY=supabase`
- `BYLA_SOURCE_CADASTRO_PRIMARY=supabase`

Observacao: manter fallback temporario por modulo ate o gate ficar verde.

