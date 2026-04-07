# Decisoes Arquiteturais (ADR Leve)

Este registro resume decisoes importantes com formato: Contexto, Decisao, Consequencias.

## ADR-001 — Backend modular por dominio

### Contexto
`api.ts` estava concentrando muitas responsabilidades e dificultava manutencao.

### Decisao
Transformar `api.ts` em agregador e mover endpoints para modulos por dominio.

### Consequencias
- positivo: menor acoplamento e leitura mais simples;
- atencao: necessidade de disciplina para manter fronteiras dos modulos.

## ADR-002 — Regras criticas em modulo de logica

### Contexto
Regra de match planilha x banco aparecia em trechos acoplados a rota.

### Decisao
Extrair para `logic/conciliacaoPagamentoMatch.ts` com tipos e teste proprio.

### Consequencias
- positivo: reuso e testabilidade;
- atencao: qualquer mudanca exige alinhamento com regra de negocio.

## ADR-003 — Validacao de contrato com Zod

### Contexto
Parsing manual de query/body gerava comportamento inconsistente entre endpoints.

### Decisao
Centralizar schemas e parser em `validation/apiQuery.ts`.

### Consequencias
- positivo: erro 400 padronizado e menor chance de bug de entrada;
- atencao: endpoints ficam mais estritos (consumidores precisam enviar parametros corretos).

## ADR-004 — Logs estruturados e rastreio por request id

### Contexto
Diagnostico de erro sem correlacao unica entre frontend e backend era lento.

### Decisao
Padronizar logs JSON e incluir `x-request-id` nas respostas.

### Consequencias
- positivo: suporte mais rapido e investigacao objetiva;
- atencao: equipe deve incluir request id em evidencias de incidente.

## ADR-005 — TanStack Query para estado assíncrono no frontend

### Contexto
Muitos hooks com `useEffect` e estado manual de loading/erro.

### Decisao
Adotar TanStack Query em hooks de backend e padronizar cache/refetch.

### Consequencias
- positivo: menos boilerplate e UX de dados mais consistente;
- atencao: invalidação de cache deve ser planejada em futuras mutacoes.

## ADR-006 — Contrato de erro amigavel ao suporte

### Contexto
Mensagens de erro HTTP no frontend nem sempre eram acionaveis.

### Decisao
No cliente backend (`backendApi.ts`), priorizar `error` JSON e anexar `x-request-id` quando presente.

### Consequencias
- positivo: usuario consegue reportar erro com referencia;
- atencao: manter padrao de erro no backend para nao degradar mensagem.

## ADR-007 — Testes de integracao de rotas criticas

### Contexto
Somente testes unitarios nao garantiam contrato HTTP de validacao.

### Decisao
Adicionar `supertest` para validar 400 em endpoints principais.

### Consequencias
- positivo: maior confianca em refactor de rotas/validacao;
- atencao: manter testes atualizados ao evoluir contratos.

## ADR-008 — Separacao de fontes oficiais e complementares

### Contexto
Sistema utiliza Supabase e Sheets com papeis diferentes.

### Decisao
Formalizar regra: Supabase como financeiro oficial; planilhas como complemento operacional.

### Consequencias
- positivo: decisao de origem de dado fica clara;
- atencao: conflitos devem seguir regra documentada em docs de fontes.

## ADR-009 — Fluxo de caixa com adapter de cache

### Contexto
Leitura de planilha pode ser custosa e sujeita a falhas momentaneas.

### Decisao
Manter `CacheFluxoPlanilhaAdapter` entre use case e fonte de planilha.

### Consequencias
- positivo: melhora de resiliencia/performance;
- atencao: TTL e invalidação precisam ser revisados conforme uso real.

## ADR-010 — Documentacao orientada por operacao

### Contexto
Muitos docs historicos sem trilha priorizada de leitura.

### Decisao
Criar eixo principal de docs: arquitetura, contratos/operacao, evolucao, ADR.

### Consequencias
- positivo: onboarding e manutencao documental mais eficientes;
- atencao: requer disciplina de atualizar indice e docs de contrato a cada mudanca.
