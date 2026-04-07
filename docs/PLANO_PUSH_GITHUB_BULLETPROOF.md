# Plano “bulletproof” — push para o GitHub (BYLA)

Objetivo: subir o código **sem vazar segredos**, com **testes e build ok**, e com **revisão consciente** do que entra no histórico público (repo **público**).

---

## Princípios de segurança

| Regra | Por quê |
|--------|---------|
| **Nunca** commitar `.env`, chaves API, JSON de service account, `.pem` | Repo público = qualquer um lê o histórico. |
| Manter **`.env.example`** sem valores reais | Só nomes de variáveis e exemplos fictícios. |
| **Chaves que já apareceram** em commit ou em chat devem ser **rotacionadas** (GitHub, Render, Supabase, Google, n8n). | Histórico do Git não some com `git rm`. |
| **`mcp.json` com Bearer** fica no **Cursor do usuário** (`%USERPROFILE%\.cursor\`), não no repo. | Já ignoramos `.cursor/mcp.json` **no projeto** por precaução. |

---

## Fase 0 — Antes de qualquer coisa

1. **Confirme** que não há cópia de `backend/.env` com outro nome **dentro** do repo (ex.: `env.backup`).
2. **Não** adicione `service-account*.json` na pasta do projeto sem estar no `.gitignore`.

---

## Fase 1 — Verificação automática (obrigatória)

Na **raiz** do repositório:

```bash
npm run verify:push
```

Isso executa `scripts/verify-git-push-safety.mjs`, que:

- Lista `git ls-files` e **bloqueia** se houver `.env` (exceto padrão de exemplo), `.pem`, JSON de service account, etc.
- Roda `git grep` por **chaves privadas** (`BEGIN RSA PRIVATE KEY`, OpenSSH).
- Confere se `.gitignore` menciona `.env`.
- Em `backend/`: `npm ci`, `npm run build`, `npm test`.
- Roda `npm audit --audit-level=critical` em `backend` e `frontend` (avisos se houver algo a olhar).

**Versão rápida** (só segredos + grep, sem build):

```bash
npm run verify:push:quick
```

**Gate:** o comando termina com código **0**. Se **BLOQUEADO**, corrija antes de continuar.

---

## Fase 2 — Revisão humana (não automatizável)

Execute e leia a saída:

```bash
git status
git diff --stat
git log origin/main..HEAD --oneline
```

| Pergunta | Ação se “não” |
|----------|----------------|
| Só entram arquivos **pretendidos** (código, docs, `render.yaml`)? | Remova do stage: `git restore --staged <arquivo>` |
| Algum arquivo grande binário por engano? | Use Git LFS ou não commite. |
| Mensagens de commit fazem sentido e **não** contêm tokens? | `git commit --amend` se necessário |

---

## Fase 3 — O que pode ir no commit (lista segura)

- Código `backend/`, `frontend/`, `scripts/`, `docs/`, `n8n-workflows/`, `render.yaml`, `package.json`, etc.
- **`.env.example`** (sem segredos).
- **Nunca:** `backend/.env`, `node_modules/`, `dist/`, chaves, tokens em código.

---

## Fase 4 — Commit (se ainda houver alterações)

Agrupe por tema, por exemplo:

```bash
git add -A
git status
git commit -m "feat: sincroniza backend, frontend e deploy Render"
```

(Use mensagem clara; evite colar URLs com tokens.)

---

## Fase 5 — Push

```bash
git push origin main
```

**Gate:** comando conclui sem erro. Depois confira no GitHub se os arquivos aparecem.

---

## Fase 6 — Depois do push (higiene)

1. No GitHub: **Settings → Secrets and variables** não substitui `.env` local — só use para CI se configurar Actions.
2. **Render / n8n / Supabase:** segredos ficam nos **painéis** de cada serviço, não no repositório.
3. Se em algum momento um segredo foi commitado por engano: **rotacione a chave** no provedor e use a nova só em `.env` / painel.

---

## Riscos residuais (honestidade)

| Risco | Mitigação |
|-------|-----------|
| Dependência com CVE não crítica | `npm audit` regular; atualizar pacotes com calma. |
| Repo público | Não coloque dados pessoais de clientes em arquivos versionados. |
| Histórico antigo com segredo | `git filter-repo` / suporte GitHub — processo avançado; melhor rotacionar chaves. |

---

## Ordem resumida (checklist)

1. `npm run verify:push` → **OK**  
2. `git status` / `git diff` → **OK**  
3. `git add` / `git commit` → **OK**  
4. `git push origin main` → **OK**  
5. Abrir o repo no GitHub e conferir arquivos sensíveis **não** aparecem  

---

## Referências internas

- Deploy Render: `docs/PLANO_DEPLOY_RENDER_BYLA.md`
- `.gitignore` na raiz (env, credenciais)

---

## GitHub: limite de 100 MB por arquivo

Se o `git push` for recusado com **large files** (ex.: JARs em `metabase/`), o GitHub não aceita. Solução aplicada neste repo:

- Incluir a pasta em **`.gitignore`** (ex.: `metabase/`).
- Remover do **histórico** com `git filter-branch` ou `git filter-repo` e depois `git push --force` (só com equipe alinhada — reescreve histórico).

Nunca versionar instaladores locais pesados; use release oficial ou download separado.
