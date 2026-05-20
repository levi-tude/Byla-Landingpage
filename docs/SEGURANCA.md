# Segurança BYLA — guia simples

> Versão ainda mais simples: [SEGURANCA_SIMPLES.md](./SEGURANCA_SIMPLES.md)

## O que estava em risco

1. **Tabela de mapeamento aberta** — Quem tivesse a chave pública (anon) do Supabase podia ler e alterar regras de categorização.
2. **Views “elevadas”** — Algumas views ignoravam as regras por usuário e viam tudo como administrador do banco.
3. **Deploy errado** — Já corrigido: Vercel publicava a landing em vez do painel.
4. **Senhas vazadas** — Proteção contra senhas já vazadas na internet desligada no Supabase Auth (configuração manual).

## O que foi feito automaticamente

- Script SQL `scripts/supabase-security-hardening.sql` (RLS, revoga anon, funções, views).
- Headers de segurança no `vercel.json`.
- `npm run verify:security` e integração em `npm run verify:push`.
- Backend continua com `BYLA_AUTH_ENFORCE=true` e rotas sensíveis só para admin.

## O que você deve fazer no painel (uma vez)

### Supabase → Authentication

1. **URL Configuration** — Site URL e Redirect URLs com a URL do painel (`https://frontend-levi-tudes-projects.vercel.app` e `/redefinir-senha`).
2. **Password security** — Ativar **Leaked password protection** (Have I Been Pwned).

### Vercel → Environment Variables

Nunca coloque `service_role` no frontend. Apenas:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_URL`
- `VITE_SITE_URL`

### Render → Environment

- `SUPABASE_SERVICE_ROLE_KEY` só no backend.
- `BYLA_SYNC_SECRET` forte (n8n + rotas de planilha).
- `CORS_ORIGIN` com URLs reais do painel.

## Antes de cada push

```bash
npm run verify:push
```

## n8n

Fluxos que leem `mapeamento_pessoa_categoria` ou `v_transacoes_export` devem usar credencial **service_role** (não anon).
