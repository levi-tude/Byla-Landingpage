# Próximos passos – planilhas e teste

## 1. Compartilhar as duas planilhas com a Service Account

Use **este e-mail** como visualizador nas duas planilhas:

```
byla-planilha@n8n-byla.iam.gserviceaccount.com
```

**Como fazer:**

- Abra a planilha **FLUXO DE CAIXA BYLA** no Google Sheets → Compartilhar → cole o e-mail acima → permissão **Visualizador** → Enviar.
- Abra a planilha **CONTROLE DE CAIXA** no Google Sheets → Compartilhar → mesmo e-mail → **Visualizador** → Enviar.

---

## 2. Garantir que as duas sejam “Planilha Google”

Se algum arquivo for só um Excel (.xlsx) no Drive:

- Clique com o botão direito no arquivo no Drive → **Abrir com** → **Google Planilhas**.
- Ou abra o .xlsx e use **Arquivo** → **Salvar como** → **Documento do Google Sheets** (e use o ID da nova planilha no `.env`).

---

## 3. Testar o backend

Com as planilhas compartilhadas e no formato Google Sheets:

1. No terminal: `cd backend` e depois `npm run dev`.
2. Em outro terminal ou no navegador:
   - `http://localhost:3001/health` → deve retornar `{"status":"ok"}`
   - `http://localhost:3001/api/alunos-completo` → deve retornar `combinado` com dados e **sem** `sheet_error`
   - `http://localhost:3001/api/fluxo-completo` → deve retornar `entradaTotal`, `saidaTotal`, `lucroTotal` e **sem** `sheet_error`

Se aparecer `sheet_error`, confira o nome exato da aba (ATENDIMENTOS, MARÇO 26) e o compartilhamento com o e-mail acima.
