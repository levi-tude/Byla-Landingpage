# Configurar as duas planilhas no backend

O painel passa a ler **duas planilhas**:

1. **FLUXO DE CAIXA BYLA** – abas BYLA DANÇA, PILATES MARINA, TEATRO, YOGA, G.R., **ATENDIMENTOS**, GYMPASS, etc. A aba **ATENDIMENTOS** é usada para alunos/matrículas.
2. **CONTROLE DE CAIXA** – abas por mês (JULHO 25, AGOSTO 25, … **MARÇO 26**) com Entrada Total, Saída Total, LUCRO TOTAL.

## O que você precisa fazer

### 1. Subir as planilhas para o Google Sheets

- Crie **duas** planilhas no Google Sheets (ou use as que você já tem).
- **Planilha FLUXO DE CAIXA BYLA:** aba **ATENDIMENTOS** com colunas como CLIENTE, MODALIDADE, PLANO, VALOR, PARCEIRO, OBSERVAÇÕES.
- **Planilha CONTROLE DE CAIXA:** aba do mês (ex.: **MARÇO 26**) com "Entrada Total", "Saída Total", "LUCRO TOTAL" e valores (rótulos e valores em colunas ou em pares).

### 2. Service Account e compartilhamento

- No [Google Cloud Console](https://console.cloud.google.com/), crie um **Service Account** e baixe o JSON.
- **Compartilhe as duas planilhas** com o **e-mail do Service Account** (ex.: `xxx@yyy.iam.gserviceaccount.com`) como **Visualizador**.

### 3. Variáveis de ambiente no backend

No `.env` do **backend** (pasta `backend/`):

```env
# Planilha FLUXO DE CAIXA BYLA (aba ATENDIMENTOS = alunos/matrículas)
GOOGLE_SHEETS_SPREADSHEET_ID=1sAgjRIWTjxowFR9CYYWM-CtkWgq8LNH2
GOOGLE_SHEETS_ALUNOS_RANGE=ATENDIMENTOS!A:Z

# Planilha CONTROLE DE CAIXA (aba do mês = totais Entrada/Saída/Lucro)
GOOGLE_SHEETS_FLUXO_ID=11q_K4HkuEchkvdev-UscQYtLJLGtNBcMp8ijOJLRr6M
GOOGLE_SHEETS_FLUXO_RANGE=MARÇO 26!A:Z

# Credenciais (vale para as duas)
GOOGLE_SHEETS_CREDENTIALS_JSON={"type":"service_account",...}
# ou
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

O **ID** de cada planilha está na URL:  
`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

- **GOOGLE_SHEETS_SPREADSHEET_ID** = ID da planilha **FLUXO DE CAIXA BYLA** (tem a aba ATENDIMENTOS).
- **GOOGLE_SHEETS_ALUNOS_RANGE** = aba de alunos (ex.: `ATENDIMENTOS!A:Z`).
- **GOOGLE_SHEETS_FLUXO_ID** = ID da planilha **CONTROLE DE CAIXA** (tem abas por mês).
- **GOOGLE_SHEETS_FLUXO_RANGE** = aba do mês (ex.: `MARÇO 26!A:Z` ou `JANEIRO 26!A:Z`).

### 4. Frontend

No `.env` do **frontend**, defina a URL do backend para as duas planilhas serem usadas:

```env
VITE_BACKEND_URL=http://localhost:3001
```

## Onde os dados aparecem no painel

- **Alunos e matrículas** (tela **Alunos**): vêm da planilha **FLUXO DE CAIXA BYLA** (aba ATENDIMENTOS). Se o backend não estiver configurado, usa só o Supabase.
- **Fluxo de caixa (totais do mês)** (bloco na tela **Alunos**): Entrada total, Saída total e Lucro total vêm da planilha **CONTROLE DE CAIXA** (aba em `GOOGLE_SHEETS_FLUXO_RANGE`, ex.: MARÇO 26).

Resumo: **uma** Service Account, **duas** planilhas compartilhadas com ela, **dois** IDs no `.env` do backend.
