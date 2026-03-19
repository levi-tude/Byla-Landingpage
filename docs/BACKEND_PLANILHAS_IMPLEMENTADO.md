# Backend + Planilhas – O que foi implementado

Implementação conforme `docs/PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md` e `docs/PROMPT_IMPLEMENTAR_BACKEND_PLANILHAS.md`.

## Entregue

### Fase 1 – Backend mínimo
- **Pasta `backend/`** com Node.js + Express + TypeScript.
- **Variáveis de ambiente:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_ANON_KEY`); `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_CREDENTIALS_JSON` ou `GOOGLE_APPLICATION_CREDENTIALS`; `CORS_ORIGIN`, `PORT`.
- **GET /health** – saúde do serviço.
- **GET /api/dados-completos** – lê Supabase (tabela `atividades`) + planilha (range em `GOOGLE_SHEETS_RANGE`); retorna `supabase`, `planilha`, `combinado`, `regra_usada`, `origem`.
- **CORS** configurado para origem do front (ex.: `http://localhost:5173`).
- **README** em `backend/README.md`: objetivo, variáveis de ambiente, como rodar, rotas, link para regras.

### Fase 2 – Lógica de merge e rotas por domínio
- **Módulo `backend/src/logic/merge.ts`** – `mergePriorizarPlanilha`: se a planilha tiver linhas, prevalece; senão usa Supabase.
- **GET /api/alunos-completo** – alunos (Supabase + planilha; planilha prevalece).
- **GET /api/modalidades-completo** – modalidades/atividades (Supabase + planilha; planilha prevalece).
- **GET /api/pendencias-completo** – pendências (view `v_reconciliacao_mensalidades` + planilha; planilha prevalece).
- Regras documentadas em `docs/REGRAS_FONTES_SUPABASE_PLANILHAS.md`; nenhuma rota de extrato/saldo no backend (front continua no Supabase direto).

### Fase 3 – Frontend
- **`frontend/src/services/backendApi.ts`** – cliente que chama o backend: `healthCheck`, `getDadosCompletos`, `getAlunosCompleto`, `getModalidadesCompleto`, `getPendenciasCompleto`. Base URL em `VITE_BACKEND_URL`.
- **`frontend/.env.example`** – adicionado `VITE_BACKEND_URL` (opcional).
- Telas de extrato, saldo, entradas **não foram alteradas** (continuam usando Supabase direto). As telas que precisarem de dados completos (alunos, modalidades, pendências) podem passar a usar `backendApi` quando desejar.

### Documentação e segurança
- **`.gitignore`** atualizado: `.env`, `backend/.env`, `**/service-account*.json`, `**/*.credentials.json`.
- Nenhuma credencial no código; tudo via `process.env` no backend e `import.meta.env` no front.

## Próximas iterações (sugestão)

- Configurar IDs das planilhas e abas (Alunos, Modalidades, Pendencias) no `.env` do backend e testar com dados reais.
- Alterar as telas do painel que listam alunos, modalidades ou pendências para consumir `backendApi` quando `VITE_BACKEND_URL` estiver definido, com fallback para Supabase.
- Cache (em memória ou Redis) para leitura das planilhas (TTL configurável).
- Ajustar merge (ex.: enriquecer por chave nome) usando `mergeEnriquecerPorChave` em `backend/src/logic/merge.ts` se necessário.
