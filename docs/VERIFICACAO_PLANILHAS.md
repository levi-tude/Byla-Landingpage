# Verificação da conexão com as planilhas

Foi feita uma checagem automática do backend contra o Google Sheets. Resultado:

---

## O que está OK

- **Credencial:** o arquivo `n8n-byla-14b9ea6e929d.json` existe em `backend/` e é lido.
- **Variáveis:** `GOOGLE_SHEETS_SPREADSHEET_ID` e `GOOGLE_SHEETS_FLUXO_ID` estão definidas no `backend/.env`.
- **Backend:** sobe em `http://localhost:3001` e responde em `/health`.
- **Google API:** o backend consegue falar com a API do Google (não deu erro de autenticação).

---

## Ajustes necessários

### 1. Planilha com aba ATENDIMENTOS (alunos)

Os dados de **alunos/matrículas** vêm da planilha **FLUXO DE CAIXA BYLA** (ID `1sAgjRIWTjxowFR9CYYWM-CtkWgq8LNH2`), aba **ATENDIMENTOS**. No `backend/.env`:

- `GOOGLE_SHEETS_SPREADSHEET_ID=1sAgjRIWTjxowFR9CYYWM-CtkWgq8LNH2`
- `GOOGLE_SHEETS_ALUNOS_RANGE=ATENDIMENTOS!A:Z`

Se der erro "Unable to parse range: ATENDIMENTOS!A:Z", confira se o nome da aba é **exatamente** `ATENDIMENTOS` (incluindo maiúsculas e acentos). Reinicie o backend após alterar.

---

### 2. Planilha com totais do mês (Entrada Total, Saída Total, LUCRO TOTAL)

Os totais do mês vêm da planilha **CONTROLE DE CAIXA** (ID `11q_K4HkuEchkvdev-UscQYtLJLGtNBcMp8ijOJLRr6M`), aba **MARÇO 26** (ou JANEIRO 26, FEVEREIRO 26, etc.). No `backend/.env`: `GOOGLE_SHEETS_FLUXO_ID` e `GOOGLE_SHEETS_FLUXO_RANGE=MARÇO 26!A:Z`. Se der "This operation is not supported for this document", o arquivo pode ser Excel e não Google Sheets nativo: abra no Drive com **Google Planilhas** e salve como planilha Google. Se a aba tiver outro nome (ex.: "Março 26"), use o nome exato em `GOOGLE_SHEETS_FLUXO_RANGE`.

- “Planilha do Google”, 
---

## Supabase

A **SUPABASE_ANON_KEY** no `backend/.env` deve ser a mesma do frontend (`VITE_SUPABASE_ANON_KEY`). Com ela, o backend lê tabelas do mesmo projeto e une com os dados das planilhas.

---

## Como testar de novo

1. Subir o backend: em `backend/`, `npm run dev`.
2. No navegador ou em um script, chamar:
   - `http://localhost:3001/health` → deve retornar `{"status":"ok",...}`.
   - `http://localhost:3001/api/alunos-completo` → deve retornar `combinado` com linhas e sem `sheet_error`.
   - `http://localhost:3001/api/fluxo-completo` → deve retornar `entradaTotal`, `saidaTotal`, `lucroTotal` preenchidos e sem `sheet_error`.

Quando os nomes das abas e o tipo de arquivo (Google Sheets nativo) estiverem corretos, a leitura das duas planilhas pela Cloud (Google Sheets API) passa a funcionar.
