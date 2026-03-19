# Passo a passo – Opção B: PagBank EDI → Supabase

Você já tem o banco no Supabase com a tabela **transacoes**. Siga estes passos para alimentá-la automaticamente com a **API PagBank EDI**.

---

## Chaves do Supabase (n8n e Apps Script)

Os arquivos **n8n** (workflow JSON) **não guardam** a URL nem a chave do Supabase; eles só referenciam uma credencial pelo nome/ID. As chaves foram obtidas pelo **plugin Supabase** do Cursor e estão no arquivo **`supabase-keys.local`** na raiz do projeto (não é versionado no git):

- **SUPABASE_URL** – use no n8n (Host) e no Apps Script.
- **SUPABASE_ANON_KEY** – use no n8n (anon key) e no Apps Script (SUPABASE_KEY).

Se não tiver esse arquivo, use: Supabase → **Project Settings** → **API** → Project URL e anon public.

---

## O que você vai precisar

1. **Conta PagBank Empresas** (estabelecimento/vendedor).
2. **USER** = número do estabelecimento (você vê no painel PagBank).
3. **TOKEN** = enviado por e-mail após solicitar no portal (passo 1).
4. **n8n** rodando (local ou n8n cloud).
5. **Credencial Supabase** no n8n (URL do projeto + chave API).

---

## Passo 1: Pedir o token EDI ao PagBank (uma vez)

1. Acesse: **[Token API EDI – PagBank](https://developer.pagbank.com.br/devpagbank/docs/edi#token-api-edi)**.
2. Abra o **portal de solicitação** (link do Pipefy na página).
3. **Quem é você?** → **Cliente PagBank**.
4. **Descrição:** peça **1 token para 1 estabelecimento** e informe o **número do estabelecimento** (USER).
5. Informe o e-mail para receber o **TOKEN**. Pode levar alguns dias úteis.
6. Guarde: **USER** (número do estabelecimento) e **TOKEN** (o que vier no e-mail).

---

## Passo 2: Importar o workflow no n8n

1. Abra o **n8n** (sua instância).
2. Menu **Workflows** → **Import from File** (ou **Add workflow** → **Import from File**).
3. Selecione o arquivo do projeto:
   ```
   n8n-workflows/workflow-pagbank-edi-para-supabase.json
   ```
4. O workflow **"BYLA - PagBank EDI para Supabase"** será criado. Deixe a tela do workflow aberta.

---

## Passo 3: Configurar credenciais no n8n

Você precisa de **duas** credenciais.

### 3.1 – Credencial PagBank EDI (HTTP Basic Auth)

1. No n8n: **Settings** (engrenagem) → **Credentials** (ou pelo menu).
2. **Add Credential** → procure **HTTP Basic Auth** (ou **Generic Credential Type** → **Basic Auth**).
3. Preencha:
   - **Name:** `PagBank EDI USER:TOKEN` (ou outro nome que você lembrar).
   - **User:** número do **estabelecimento** (USER).
   - **Password:** o **TOKEN** que você recebeu por e-mail (cole exatamente).
4. Salve.

### 3.2 – Credencial Supabase (se ainda não tiver)

1. **Add Credential** → **Supabase**.
2. Preencha:
   - **Host:** `https://flbimmwxxsvixhghmmfu.supabase.co` (sem barra no final). Também no arquivo **`supabase-keys.local`** do projeto.
   - **Service Role Key** ou **anon key:** use **SUPABASE_ANON_KEY** do arquivo **`supabase-keys.local`** na raiz do projeto (ou Supabase → **Project Settings** → **API** → anon public).
3. Salve.

### 3.3 – Ligar as credenciais aos nós do workflow

1. No workflow, clique no nó **"PagBank EDI (transactional)"**.
2. Em **Credentials**, selecione a credencial **PagBank EDI** (HTTP Basic Auth) que você criou.
3. Clique no nó **"Id_unicos no Supabase"** → em **Credentials**, selecione a credencial **Supabase**.
4. Clique no nó **"Inserir Supabase"** → em **Credentials**, selecione a mesma credencial **Supabase**.

Os dois nós Supabase usam a tabela **transacoes** (já está definida no workflow). Não é preciso mudar o nome da tabela se for esse mesmo no seu projeto.

---

## Passo 4: Testar (execução manual)

1. No workflow, **desative** o agendamento por enquanto (no nó **"Agendar (ex.: 1x/dia)"** você pode deixar como está; no teste vamos rodar manual).
2. Clique em **Execute Workflow** (botão de play) para rodar **uma vez**.
3. Confira cada nó:
   - **Últimos 7 dias:** deve sair 7 itens (7 datas).
   - **PagBank EDI (transactional):** 7 requisições. Se der **401** = USER ou TOKEN errado. Se der **200** mas corpo vazio ou estrutura diferente, anote para ajustar o "Mapear" (passo 5).
   - **Mapear para transacoes:** várias linhas (uma por movimento).
   - **Id_unicos no Supabase:** linhas da sua tabela **transacoes** (ou vazio se ainda não tiver nada).
   - **Só novos:** só transações cujo `id_unico` ainda não está no Supabase.
   - **Inserir Supabase:** insere só essas novas.
4. No **Supabase**, abra a tabela **transacoes** e confira se as novas linhas apareceram.

Se der erro em algum nó, anote a mensagem. Os mais comuns: credencial PagBank errada (401), credencial Supabase errada ou tabela com nome/colunas diferentes.

---

## Passo 5: Ajustar o mapeamento (só se a API retornar outro formato)

A API EDI do PagBank pode devolver campos com nomes diferentes. Se o nó **"Mapear para transacoes"** sair vazio ou com dados estranhos:

1. Rode o workflow e abra a **saída** do nó **"PagBank EDI (transactional)"** (uma das 7 execuções).
2. Veja o **JSON** da resposta (ex.: lista dentro de `detalhes`, `movimentos`, `data`, ou outro nome; datas em `dataLancamento`, `date`; valor em `valor`, `amount`; etc.).
3. Abra o nó **"Mapear para transacoes"** (Code) no workflow. O código já tenta vários nomes (`detalhes`, `movimentos`, `data`; `dataLancamento`, `date`; `valor`, `amount`; `descricao`, `payerName`). Se a API usar outro nome, adicione nesse código (ex.: `item.outroNome || item.detalhes`).
4. Salve e teste de novo.

Documentação da API: [API do extrato EDI – PagBank](https://developer.pagbank.com.br/docs/api-do-extrato-edi) (confira os nomes dos campos na resposta).

---

## Passo 6: Agendar e ativar

1. Clique no nó **"Agendar (ex.: 1x/dia)"**.
2. Defina o intervalo (ex.: **Every day** às 8:00).
3. **Save** no workflow.
4. Ative o workflow (**Active** = On no canto superior).

A partir daí o n8n vai rodar no horário definido: buscar os últimos 7 dias na API PagBank, comparar com a tabela **transacoes** no Supabase e inserir só as transações novas. Sua tabela e views de conciliação continuam iguais; só passam a ser alimentadas pelo PagBank EDI em vez da Pluggy.

---

## Resumo rápido

| # | O que fazer |
|---|-------------|
| 1 | Pedir token EDI no portal PagBank (USER + TOKEN por e-mail). |
| 2 | Importar **workflow-pagbank-edi-para-supabase.json** no n8n. |
| 3 | Criar credencial **HTTP Basic Auth** (User = USER, Password = TOKEN) e associar ao nó "PagBank EDI (transactional)". |
| 4 | Criar/associar credencial **Supabase** aos nós "Id_unicos no Supabase" e "Inserir Supabase". |
| 5 | Rodar **Execute Workflow** uma vez e conferir a tabela **transacoes** no Supabase. |
| 6 | Se a API tiver formato diferente, ajustar o código do nó "Mapear para transacoes". |
| 7 | Definir horário no "Agendar (ex.: 1x/dia)" e **ativar** o workflow. |

Se aparecer algum erro em um passo específico, diga qual passo e a mensagem que aparece (ou print) que ajustamos.
