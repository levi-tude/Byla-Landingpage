# Fazer agora no n8n (copiar e colar)

Tudo que você precisa está no arquivo **`n8n-credenciais.local`** na raiz do projeto. Abra esse arquivo e use os valores abaixo. O workflow para importar é **`n8n-workflows/workflow-pagbank-edi-para-supabase.json`**.

---

## 1. Importar o workflow

- No n8n: **Workflows** → **Import from File**.
- Selecione: **`n8n-workflows/workflow-pagbank-edi-para-supabase.json`**.

---

## 2. Criar credencial PagBank EDI

- **Settings** (engrenagem) → **Credentials** → **Add Credential** → **HTTP Basic Auth**.
- **Name:** `PagBank EDI`
- **User:** copie do `n8n-credenciais.local` a linha **User (Usuário)** → cole aqui.
- **Password:** copie do `n8n-credenciais.local` a linha **Password (Token)** → cole aqui.
- Salve.

---

## 3. Criar credencial Supabase

- **Add Credential** → **Supabase**.
- **Host:** copie do `n8n-credenciais.local` a linha **Host** → cole aqui (tudo, sem barra no final).
- **Service Role Key** ou **anon:** copie do `n8n-credenciais.local` a linha **Key (anon)** → cole aqui.
- Salve.

---

## 4. Ligar ao workflow

- Volte ao workflow **"BYLA - PagBank EDI para Supabase"**.
- Clique no nó **"PagBank EDI (transactional)"** → **Credentials** → selecione **PagBank EDI**.
- Clique no nó **"Id_unicos no Supabase"** → **Credentials** → selecione a credencial **Supabase**.
- Clique no nó **"Inserir Supabase"** → **Credentials** → selecione a mesma **Supabase**.
- **Save** (Ctrl+S).

---

## 5. Testar

- Clique em **Execute Workflow** (▶).
- Confira a tabela **transacoes** no Supabase. Se a API EDI ainda estiver no prazo de 1 dia, pode não vir dados; teste de novo depois.

---

## 6. Ativar

- Clique no nó **"Agendar (ex.: 1x/dia)"** → defina o horário (ex.: 8h).
- Ative o workflow (**Active** = ligado).

Pronto.
