# Deploy Vercel — Painel Financeiro Byla

## Problema comum

O repositório tem **dois frontends**:

| Pasta | O que é |
|-------|---------|
| **Raiz do repo** (`/`) | Landing page marketing “Espaço Byla – Salas para locação” (site antigo) |
| **`frontend/`** | **Painel financeiro** (login, Fluxo, Visão geral, etc.) |

Se a Vercel buildar a **raiz**, o link de produção mostra a landing errada.

## Configuração correta

O arquivo **`vercel.json` na raiz do repositório** já aponta o build para `frontend/`:

- `installCommand`: `npm install --prefix frontend`
- `buildCommand`: `npm run build --prefix frontend`
- `outputDirectory`: `frontend/dist`

**Alternativa no painel Vercel:** Project Settings → General → **Root Directory** = `frontend` (e manter `frontend/vercel.json`).

Use **uma** das duas abordagens, não ambas conflitantes.

## Variáveis de ambiente (obrigatórias no projeto Vercel)

Defina em **Settings → Environment Variables** (Production + Preview):

| Variável | Exemplo |
|----------|---------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | chave anon do Supabase |
| `VITE_BACKEND_URL` | `https://byla-backend.onrender.com` (sem `/` no fim) |
| `VITE_SITE_URL` | URL do painel em produção (ex. `https://frontend-levi-tudes-projects.vercel.app`) |

Sem `VITE_BACKEND_URL`, parte das telas não carrega dados do backend.

## Conferir após o deploy

1. Abrir a URL de produção → deve aparecer **tela de login** do painel (não “Salas para locação”).
2. Título da aba do navegador: **Byla – Painel Financeiro**.
3. Após login (admin): menu com Visão geral, Transações, Fluxo de caixa, etc.

## CORS no backend (Render)

Em `CORS_ORIGIN` no backend, inclua a URL exata do painel na Vercel, por exemplo:

`https://frontend-levi-tudes-projects.vercel.app` (o backend já aceita qualquer `*.vercel.app` no código)

## Redeploy

Após alterar `vercel.json` ou variáveis: **Deployments → Redeploy** (ou push na branch `main`).
