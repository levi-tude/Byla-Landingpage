# Importar workflows BYLA (export → planilha)

## Nomes das credenciais (recomendado)

Para o n8n **associar sozinho** ao importar, crie **antes** com estes nomes **exatos**:

| Tipo no n8n | Nome da credencial |
|-------------|-------------------|
| Header Auth | **BYLA Backend Sync** — campo *Name* do header: `X-Byla-Sync-Secret`, *Value*: igual ao `BYLA_SYNC_SECRET` do Render |
| Supabase API | **Supabase account** |
| Google Sheets OAuth2 | **Google Sheets account** |

Se seus nomes forem outros, ao importar o n8n pede para **escolher** a credencial em cada node com aviso.

## Passos

1. **Credentials** → crie **BYLA Backend Sync** (Header Auth) como acima.
2. Confirme que já existem credenciais **Supabase** e **Google Sheets** (podem ter outros nomes; você mapeia no passo 4).
3. **Workflows** → **⋯** → **Import from File**.
4. Escolha um dos arquivos:
   - `workflow-supabase-webhook-google-sheets-export.json` — cada INSERT em `transacoes`
   - `workflow-supabase-bulk-export-google-sheets-once.json` — carga manual única
5. Se aparecer **Connect credentials**, ligue cada node à credencial certa (Header Auth no node **HTTP POST montar-linhas (backend)**).
6. Abra o node **HTTP POST montar-linhas (backend)**:
   - **Authentication** = Header Auth → **BYLA Backend Sync**
   - **URL** = `https://byla-backend.onrender.com/api/planilha-entrada-saida/montar-linhas`
   - Não deixe header manual `X-Byla-Sync-Secret` (só a credencial manda esse header).
7. **Save** o workflow.
8. Só então ligue **Active** no fluxo do **webhook** (evita URL duplicada enquanto testa).

## Teste rápido

No node **HTTP POST montar-linhas**, use **Execute previous nodes** / **Test workflow** com um item que tenha `{ "rows": [ { ... uma linha da view ... } ] }` ou dispare um INSERT de teste no Supabase.

Mais detalhes: `HOST_ENV_BYLA.md` e `docs/N8N_WEBHOOK_EXPORT_PLANILHA.md`.
