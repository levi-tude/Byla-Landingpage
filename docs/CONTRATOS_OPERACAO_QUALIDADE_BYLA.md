# Contratos, Operacao e Qualidade

Este documento consolida convencoes de contrato HTTP, validacao, observabilidade e operacao.

## 1. Convencoes de API

- `200`: sucesso.
- `400`: erro de validacao de entrada (`query` ou `body`).
- `502`: falha de integracao externa (ex.: Sheets/Supabase em chamadas especificas).
- `503`: dependencia nao configurada (ex.: Supabase indisponivel por config).
- `500`: erro interno inesperado.

### 1.1 Formato de erro

Formato padrao:

```json
{ "error": "mensagem descritiva" }
```

Alguns endpoints retornam campos adicionais para preservar contrato da tela (ex.: `itens: []`, `resumo: {}`).

## 2. Validacao centralizada (Zod)

Arquivo: `backend/src/validation/apiQuery.ts`

Schemas principais:

- `mesAnoQuerySchema`
- `dataIsoQuerySchema`
- `trimestreAnoQuerySchema`
- `anoQuerySchema`
- `transacoesQuerySchema`
- `fluxoCompletoQuerySchema`
- `validacaoPagamentosDiariaQuerySchema`
- `gerarTextoIaBodySchema`

Objetivo:

- reduzir validacoes duplicadas;
- padronizar erros 400;
- tornar contratos testaveis.

## 3. Observabilidade

### 3.1 Request id

- backend gera e devolve `x-request-id` nas respostas;
- frontend inclui essa referencia nas mensagens de erro (quando presente), facilitando suporte.

### 3.2 Logs estruturados

Arquivo: `backend/src/services/logger.ts`

- logs em JSON com timestamp e nivel (`info`, `warn`, `error`);
- permitem busca e correlacao por `requestId`.

## 4. Testes e garantia de qualidade

### 4.1 Backend

- unitarios:
  - `merge.test.ts`
  - `transacoesFiltro.test.ts`
  - `conciliacaoPagamentoMatch.test.ts`
  - `apiQuery.test.ts`
- integracao HTTP:
  - `routes.integration.test.ts` (validacao de contratos 400 em rotas criticas)

Comando:

```bash
cd backend
npm test
```

### 4.2 Frontend

- typecheck e build como validacao de integridade:

```bash
cd frontend
npx tsc --noEmit
npm run build
```

## 5. Operacao local

## 5.1 Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## 5.2 Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 5.3 Verificacao completa (recomendada)

```bash
cd backend && npx tsc --noEmit && npm test
cd ../frontend && npx tsc --noEmit && npm run build
```

## 6. Checklist de release

- [ ] Typecheck backend sem erro.
- [ ] Testes backend passando.
- [ ] Typecheck frontend sem erro.
- [ ] Build frontend concluido.
- [ ] Endpoints criticos verificados manualmente:
  - [ ] `/api/conciliacao-vencimentos`
  - [ ] `/api/validacao-pagamentos-diaria`
  - [ ] `/api/calendario-financeiro`
  - [ ] `/api/relatorios/mensal`
- [ ] Validar conectividade de fontes (`/api/fontes`).
- [ ] Revisar erros recentes por `requestId` e logs JSON.

## 7. Smoke test funcional

1. Abrir painel.
2. Confirmar carregamento de overview e fontes.
3. Validar tela de conciliacao com mes/ano validos.
4. Validar rota de relatorio mensal e geracao de texto (quando chave IA estiver configurada).
5. Forcar erro de parametro em uma rota e conferir retorno 400 padronizado.

## 8. Riscos operacionais e mitigacoes

- Dependencia externa instavel (Sheets/Supabase):
  - mitigacao: status de fonte, mensagens de erro claras, fallbacks.
- Regras de negocio mudando sem atualizacao de contrato:
  - mitigacao: atualizar `apiQuery.ts`, `API_CONTRATOS.md` e testes de integracao.
- Divergencia entre UI e backend:
  - mitigacao: usar cliente unico (`backendApi.ts`) e hooks com React Query.

## 9. Referencias

- `docs/API_CONTRATOS.md`
- `docs/ARQUITETURA_SISTEMA_BYLA.md`
- `backend/src/validation/apiQuery.ts`
- `backend/src/services/logger.ts`
