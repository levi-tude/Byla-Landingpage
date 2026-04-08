# Variáveis no servidor n8n (BYLA)

Os workflows usam `$env.BYLA_SYNC_SECRET` no header **`X-Byla-Sync-Secret`**. Sem essa variável no **processo** do n8n, o backend responde **401**.

A URL do backend já tem **fallback** nos JSON para `https://byla-backend.onrender.com`. Só precisa de env no host se usar outro endereço.

## Valores

| Variável | Obrigatório | Valor |
|----------|-------------|--------|
| `BYLA_SYNC_SECRET` | **Sim** | Igual a `BYLA_SYNC_SECRET` no Render e no `backend/.env`. |
| `BYLA_BACKEND_URL` | Não | Só se não for usar o Render (ex.: `http://host.docker.internal:3001`). Sem barra no fim. |

## Onde configurar

- **Docker Compose** (exemplo):

```yaml
services:
  n8n:
    environment:
      - BYLA_SYNC_SECRET=${BYLA_SYNC_SECRET}
      # - BYLA_BACKEND_URL=https://outro-backend.com   # opcional
```

Carregue `BYLA_SYNC_SECRET` de um `.env` ao lado do compose **que não vá para o Git**.

- **n8n Cloud:** Settings → Environment variables (ou equivalente na sua edição).

- **Systemd / bare metal:** exporte no unit file ou no shell que inicia o n8n.

Depois de alterar, **reinicie** o n8n para o processo ler as variáveis.

## Verificar do seu PC (não configura o n8n)

Na pasta `backend`, com `BYLA_SYNC_SECRET` no `.env`:

```bash
npm run n8n:verify-montar-linhas
```

Confirma que o **Render** aceita o mesmo segredo que você vai colocar no n8n.

## Reimportar workflow

Se o fluxo já estava importado antes desta mudança, **importe de novo** o JSON do repo ou edite o node HTTP Request para usar a mesma URL padrão.
