# Implementar o novo sistema (sem Pluggy)

Este guia coloca o sistema novo em funcionamento: **transações** entram na tabela **transacoes** do Supabase pela **planilha** ou pela **API PagBank EDI**. Views e conciliação continuam iguais.

---

## Escolha uma opção (ou use as duas)

| Opção | Quando usar | Tempo para funcionar |
|-------|-------------|------------------------|
| **A – Planilha Google** | Qualquer banco; quer usar já | ~10 min |
| **B – PagBank EDI** | Conta PagBank Empresas; pode esperar token | Após receber token (dias) |

Recomendação: **comece pela Opção A** (planilha) para não parar. Se tiver PagBank Empresas, peça o token da Opção B e ative depois.

---

## Pré-requisito: tabela no Supabase

1. Abra o [Supabase](https://supabase.com) → seu projeto → **SQL Editor**.
2. Se a tabela **transacoes** ainda não existir, execute o conteúdo de **`scripts/schema-transacoes.sql`** (Run).
3. Se já tiver as views de conciliação, não é preciso rodar de novo **`scripts/views-transacoes-oficial-e-reconciliacao.sql`** (só se ainda não rodou).

---

# Opção A – Planilha Google (funciona com qualquer banco)

## Passo 1: Criar a planilha

1. Crie uma planilha no [Google Sheets](https://sheets.google.com).
2. Renomeie a **primeira aba** para **Importar**.
3. Na **linha 1**, coloque os títulos (exatamente):

   | A (Data) | B (Pessoa) | C (Valor) | D (Descrição) | E (Tipo) |

4. Opcional: importe o template para não errar as colunas:
   - Abra **`docs/template-importar-transacoes.csv`** (deste projeto) no Excel/Sheets.
   - Copie a linha de título e, se quiser, as linhas de exemplo, e cole na aba **Importar**.

**Regras das colunas:**
- **Data:** `AAAA-MM-DD` (ex.: 2026-02-23).
- **Pessoa:** nome de quem aparece na transação (quem pagou ou descrição).
- **Valor:** número, sem R$ (ex.: 230 ou 95.50).
- **Descrição:** método (PIX, Débito, etc.) ou texto livre.
- **Tipo:** só `entrada` ou `saida`.

Da **linha 2** em diante: uma linha por transação.

---

## Passo 2: Enviar da planilha para o Supabase

Você pode usar **Apps Script** (direto na planilha) ou **n8n** (automático/agendado).

### Caminho A1 – Apps Script (rápido, sem n8n)

1. Na planilha: **Extensões** → **Apps Script**.
2. Apague o conteúdo e cole **todo** o código de **`docs/planilha-importar-extrato-apps-script.js`**.
3. No topo do script, configure:
   - **SUPABASE_URL:** `https://flbimmwxxsvixhghmmfu.supabase.co` (ou a URL do seu projeto).
   - **SUPABASE_KEY:** chave **anon public** do Supabase (Settings → API → anon public).
4. Salve (Ctrl+S). Na primeira execução, autorize o app quando o Google pedir.
5. Para enviar: no editor do Apps Script, selecione a função **enviarExtratoParaSupabase** e clique em **Executar** (▶).
6. Ou crie um botão na planilha: **Inserir** → **Desenho** → desenhe um botão → botão direito → **Atribuir script** → `enviarExtratoParaSupabase`.

Sempre que colar linhas novas na aba **Importar**, rode de novo o script (ou o botão). Só as linhas **novas** (por data + pessoa + valor) serão enviadas; duplicatas são evitadas.

### Caminho A2 – n8n (agendar ou rodar manual)

1. Abra o **n8n**.
2. **Import from File** e selecione **`n8n-workflows/workflow-planilha-para-supabase.json`**.
3. Configure:
   - **Ler aba Importar:** escolha a credencial **Google Sheets** (OAuth2) e preencha o **ID da planilha** (é o que aparece na URL: `https://docs.google.com/spreadsheets/d/ESTE_E_O_ID/edit`). Nome da aba: **Importar**.
   - **Transações já no Supabase** e **Inserir no Supabase:** credencial **Supabase** (URL + Service Role ou anon key, conforme sua tabela/RLS).
4. Rode **uma vez** com **Execute Workflow** (trigger manual) e confira na tabela **transacoes** do Supabase.
5. Para agendar (ex.: a cada 12h): adicione um nó **Schedule Trigger**, conecte a saída dele aos mesmos nós que o "Manual ou agende" (Ler aba Importar e Transações já no Supabase), desative o trigger manual e ative o workflow.

---

## De onde pegar os dados (extrato do banco)

- Exporte o extrato do seu banco em **CSV** ou copie do app.
- Ajuste as colunas para bater com **Data | Pessoa | Valor | Descrição | Tipo** (e formato da data `AAAA-MM-DD`, tipo `entrada`/`saida`).
- Cole na aba **Importar** e rode o Apps Script ou o workflow n8n.

---

# Opção B – API PagBank EDI (só PagBank Empresas)

**→ Guia completo só da Opção B:** [**PASSO_A_PASSO_OPCAO_B_PAGBANK_EDI.md**](./PASSO_A_PASSO_OPCAO_B_PAGBANK_EDI.md) (use esse arquivo para implementar o PagBank EDI).

Resumo abaixo.

## Passo 1: Pedir o token EDI (uma vez)

1. Acesse: [Token API EDI – PagBank](https://developer.pagbank.com.br/devpagbank/docs/edi#token-api-edi).
2. Abra o portal de solicitação (link do Pipefy na página).
3. Escolha **Cliente PagBank**, peça **1 token para 1 estabelecimento** e informe o **número do estabelecimento** (USER).
4. O **TOKEN** será enviado por e-mail (pode levar alguns dias úteis). Você vai usar **USER** + **TOKEN**.

## Passo 2: Importar e configurar o workflow no n8n

1. No n8n: **Import from File** → **`n8n-workflows/workflow-pagbank-edi-para-supabase.json`**.
2. Crie a credencial **HTTP Basic Auth**:
   - **User:** número do estabelecimento (USER).
   - **Password:** TOKEN recebido por e-mail.
   - Associe ao nó **"PagBank EDI (transactional)"**.
3. Nos nós **"Id_unicos no Supabase"** e **"Inserir Supabase"**, configure a credencial **Supabase** (URL + chave).
4. Teste: **Execute Workflow** (manual). Confira cada nó e a tabela **transacoes**.
5. Se a API retornar campos com nomes diferentes, abra a saída do nó **"PagBank EDI (transactional)"** e ajuste o código do nó **"Mapear para transacoes"** (nomes como `detalhes`, `dataLancamento`, `valor`, etc.). Ver **docs/PAGBANK_EDI_SUPABASE.md**.
6. Ative o workflow e configure o **Agendar (ex.: 1x/dia)** no horário desejado.

---

# Depois de implementar

- A tabela **transacoes** passa a ser alimentada pela **planilha** (Opção A) e/ou pelo **PagBank EDI** (Opção B).
- As **views** (**v_entradas_oficial**, **v_reconciliacao_mensalidades**, **v_resumo_mensal_oficial**, etc.) e a **conciliação** continuam iguais; não é preciso mudar nada nelas.
- Você **não** está mais usando a API da Pluggy; a origem dos dados é só planilha e/ou PagBank EDI.

Se tiver dúvida em algum passo, diga em qual opção (A ou B) e em qual número do passo.
