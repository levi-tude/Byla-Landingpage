# Backend BYLA no n8n — só pela interface (sem Docker / sem `$env`)

Os workflows usam credencial nativa **Header Auth** do n8n. O segredo **não** fica no `docker-compose` nem em variável de ambiente do servidor.

## 1. Criar a credencial (uma vez)

1. n8n → **Credentials** → **Add credential**.
2. Procure **Header Auth** (às vezes listado como autenticação HTTP genérica).
3. Preencha:
   - **Name** (nome do *header HTTP*): `X-Byla-Sync-Secret` (exatamente assim).
   - **Value**: o mesmo valor de `BYLA_SYNC_SECRET` no Render e no `backend/.env`.
4. Salve com um nome fácil, ex.: **BYLA Backend Sync**.

> No import do workflow, se pedir para mapear credencial, escolha esta ou crie outra com os mesmos campos.

## 2. URL do backend

O JSON do repositório usa a URL fixa:

`https://byla-backend.onrender.com/api/planilha-entrada-saida/montar-linhas`

Se precisar de outro host (ex.: backend só no seu PC), abra o node **HTTP POST montar-linhas (backend)** e altere o campo **URL** na interface — sem Docker.

## 3. Sobre `$vars` (Variáveis do n8n)

As **Custom variables** (`$vars`) do n8n existem em **Enterprise / Pro Cloud** em muitos planos. Por isso estes workflows usam **Header Auth**, que funciona na instalação **self-hosted comunitária** comum.

## 4. Testar do seu PC (opcional)

Com `BYLA_SYNC_SECRET` no `backend/.env`:

```bash
cd backend
npm run n8n:verify-montar-linhas
```

Confere se o Render aceita o mesmo valor que você colou na credencial.
