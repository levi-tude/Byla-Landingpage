# Evolucao e Mudancas do Projeto Byla

## 1. Objetivo deste documento

Registrar de forma cronologica as mudancas relevantes do projeto, incluindo:

- o que foi alterado;
- por que foi alterado;
- impacto esperado;
- riscos e mitigacoes.

## 2. Baseline (inicio do ciclo atual)

Cenario inicial identificado:

- backend concentrado em arquivo de rotas extenso;
- validacoes de parametros espalhadas por endpoint;
- regras de conciliacao com trechos duplicados;
- documentacao dispersa em muitos arquivos sem trilha unica de leitura;
- UX com diferentes padroes de loading/erro por hook/pagina.

## 3. Linha do tempo de evolucao

## Marco 1 — Regras de negocio centralizadas

### O que mudou

- consolidacao de regras em `backend/src/businessRules.ts`;
- configuracao por variaveis de ambiente para janelas/tolerancias.

### Motivacao

Reduzir regras hardcoded e evitar divergencia entre endpoints.

### Impacto

- maior previsibilidade de conciliacao;
- ajuste fino sem alterar codigo-fonte.

### Risco e mitigacao

- risco: configuracao incorreta de env;
- mitigacao: `.env.example` documentado e defaults seguros.

## Marco 2 — Observabilidade inicial

### O que mudou

- logs estruturados JSON (`backend/src/services/logger.ts`);
- propagacao de `x-request-id` em respostas.

### Motivacao

Facilitar diagnostico de erro em ambiente real.

### Impacto

- suporte mais rapido;
- correlacao frontend/backend por referencia unica.

### Risco e mitigacao

- risco: baixa adesao ao uso do request-id;
- mitigacao: frontend passou a mostrar `(ref: ...)` quando recebido.

## Marco 3 — Modularizacao de rotas backend

### O que mudou

- `api.ts` virou agregador;
- separacao por dominio em:
  - `calendario.ts`
  - `conciliacao.ts`
  - `relatorios.ts`
  - `planilhaFluxoByla.ts`
  - `fontes.ts`
  - `transacoes.ts`
  - `despesas.ts`
  - `cadastroCompleto.ts`

### Motivacao

Aumentar manutenibilidade e reduzir risco de regressao em arquivo monolitico.

### Impacto

- menor complexidade por modulo;
- onboarding tecnico mais simples.

### Risco e mitigacao

- risco: regressao de rotas no refactor;
- mitigacao: typecheck/testes executados apos cada etapa.

## Marco 4 — Reuso de regra critica de match

### O que mudou

- extracao da regra `matchUmPagamentoPlanilhaBanco` para `logic/conciliacaoPagamentoMatch.ts`;
- testes unitarios dedicados.

### Motivacao

Eliminar duplicacao de regra na conciliacao e tornar comportamento testavel.

### Impacto

- consistencia da regra de match;
- evolucao segura por testes.

### Risco e mitigacao

- risco: alterar resultado de negocio;
- mitigacao: testes em tabela cobrindo cenarios chave (inclui Pilates).

## Marco 5 — Validacao de contratos com Zod

### O que mudou

- criacao de `validation/apiQuery.ts`;
- aplicacao em rotas criticas (calendario, conciliacao, relatorios, transacoes, despesas, fluxo);
- testes unitarios de schema + testes de integracao HTTP (`routes.integration.test.ts`).

### Motivacao

Padronizar respostas 400 e reduzir erro por parsing manual.

### Impacto

- contratos mais confiaveis;
- manutencao simplificada.

### Risco e mitigacao

- risco: quebra de consumidores com erro mais estrito;
- mitigacao: mensagens de erro explicitas e validacao de contrato em testes.

## Marco 6 — UX de dados e cache no frontend

### O que mudou

- adocao de TanStack Query no frontend (provider + hooks principais);
- melhoria no parser de erro HTTP com exibicao de referencia `x-request-id`.

### Motivacao

Padronizar loading/erro/cache e melhorar experiencia operacional.

### Impacto

- menor retrabalho de estado manual em hooks;
- depuracao mais objetiva para usuario e suporte.

### Risco e mitigacao

- risco: inconsistencias de estado durante migracao;
- mitigacao: migracao incremental por hook e verificacao via typecheck/build.

## Marco — Documentacao de expansao dos relatorios por IA (proposta)

### O que mudou

- criado `docs/RELATORIOS_IA_ARQUITETURA_EXPANSAO.md` com catalogo de tipos de relatorio (R1-R5), legenda de fontes (banco/planilha/sistema), engenharia de prompt alinhada ao guia do projeto e referencias externas; atualizado `docs/INDEX.md`.

### Motivacao

- preparar validacao antes de implementar relatorios mais complexos (operacional mensal, alunos, inadimplencia) com rastreabilidade e separacao dados vs narrativa IA.

### Impacto

- nenhuma mudanca de codigo ate aprovacao do escopo; documento vira referencia para proximos PRs.

### Risco e mitigacao

- risco: escopo amplo parecer overwhelming;
- mitigacao: implementacao em fases A-D descritas no documento.

## 4. Resultado consolidado

Estado atual apos os marcos:

- backend modular e com validacao centralizada;
- regras criticas reutilizaveis e testadas;
- frontend com melhor padrao de consumo de API;
- documentacao base de arquitetura/operacao criada.

## 5. Proximas evolucoes sugeridas

- implementar fases A-D de `RELATORIOS_IA_ARQUITETURA_EXPANSAO.md` apos validacao do usuario;
- ampliar padrao de hooks com React Query para 100% das telas;
- otimizar bundle frontend (code splitting por rota);
- ampliar cobertura de testes de integracao para cenarios de 502/503.

## 6. Referencias cruzadas

- `docs/ARQUITETURA_SISTEMA_BYLA.md`
- `docs/CONTRATOS_OPERACAO_QUALIDADE_BYLA.md`
- `docs/DECISOES_ARQUITETURAIS_ADR.md`
