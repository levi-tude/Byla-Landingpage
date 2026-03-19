# Planilha Byla – Entradas e Saídas (Google Sheets + Supabase)

Esta planilha é alimentada automaticamente pela tabela `transacoes` do Supabase. O n8n continua gravando os dados no Supabase; o script abaixo só **lê** do Supabase e preenche a planilha.

---

## O que você precisa

- Conta Google (para criar a planilha)
- **Chave anon** do Supabase (Settings → API → anon public). Se der erro de permissão, use a chave **service_role** e não compartilhe a planilha publicamente.

---

## Passo 1: Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) ou [sheets.new](https://sheets.new).
2. Crie uma **nova planilha** (em branco).
3. Dê um nome, por exemplo: **Byla – Entradas e Saídas**.
4. **Copie o ID da planilha** na URL. A URL é assim: `https://docs.google.com/spreadsheets/d/ID_AQUI/edit` — o trecho entre `/d/` e `/edit` é o ID (ex.: `1ABC123xyz`). Você vai colar esse ID no script.

---

## Passo 2: Abrir o Apps Script

- **Se você tem acesso pela planilha:** no Google Sheets, **Extensões** → **Apps Script**.
- **Se você só acessa o Apps Script direto:** acesse [script.google.com](https://script.google.com), crie um novo projeto ou abra o existente.

Apague todo o código que estiver no editor (ex.: `function myFunction() {}`).

---

## Passo 3: Colar o script e configurar

1. Abra no seu projeto o arquivo **`docs/planilha-byla-apps-script.js`** (ou copie o conteúdo que está nesse arquivo).
2. Cole todo o código no editor do Apps Script.
3. **Configure:**
   - **SUPABASE_KEY:** onde está `'COLE_SUA_CHAVE_ANON_AQUI'`, coloque a chave **anon** do Supabase (Settings → API → anon public → Copy).
   - **PLANILHA_ID:** onde está `'COLE_O_ID_DA_PLANILHA_AQUI'`, coloque o **ID da planilha** que você copiou no Passo 1 (obrigatório se você abriu o Apps Script direto em script.google.com; assim o script sabe em qual planilha escrever).
4. A **SUPABASE_URL** já está preenchida com o projeto Byla. Se você usar outro projeto, troque também.
5. Clique em **Salvar** (ícone de disquete) e dê um nome ao projeto, ex.: **Byla Planilha**.

---

## Passo 4: Executar uma vez (testar)

1. No Apps Script, no menu de funções (dropdown no topo), selecione **`atualizarPlanilhaTransacoes`**.
2. Clique em **Executar** (ícone de play).
3. Na primeira vez o Google pede **Autorização**:
   - Clique em **Revisar permissões** → escolha a conta Google.
   - Se aparecer "O app não foi verificado": **Avançado** → **Ir para [nome do projeto] (não seguro)** → **Permitir**.
4. Volte na **planilha**, atualize a página (F5). A primeira aba deve estar preenchida com colunas: **Data**, **Pessoa**, **Valor**, **Descrição**, **Tipo** (transações mais recentes primeiro).

Se aparecer "Nenhuma transação encontrada", é porque ainda não há dados na tabela `transacoes` do Supabase (o n8n pode não ter rodado ou a tabela está vazia).

---

## Passo 5: Atualização automática (1x por dia)

1. No Apps Script: na barra da esquerda, clique no ícone **Gatilhos** (relógio).
2. **+ Adicionar gatilho**.
3. Configure:
   - **Função:** `atualizarPlanilhaTransacoes`
   - **Tipo:** Acionador baseado em tempo
   - **Intervalo:** Diariamente
   - **Horário:** escolha (ex.: 8h–9h da manhã).
4. **Salvar**.

A partir daí a planilha será atualizada sozinha todo dia nesse horário.

---

## Se der erro de permissão (401/403)

Se a tabela `transacoes` tiver **Row Level Security (RLS)** e a chave **anon** não tiver permissão de leitura:

- Use a chave **service_role** no lugar da anon (em **SUPABASE_KEY**).
- **Atenção:** a service_role bypassa RLS. Não compartilhe a planilha publicamente nem exponha esse script; use só na conta da Byla.

---

## Resumo

| Onde        | O que fazer |
|------------|-------------|
| Google Sheets | Criar planilha, copiar ID da URL |
| Apps Script   | Colar script, configurar SUPABASE_KEY e PLANILHA_ID, salvar |
| Primeira vez  | Executar `atualizarPlanilhaTransacoes`, autorizar |
| Depois        | Gatilho diário para a mesma função |

A planilha fica sempre alinhada ao que está no Supabase; o n8n continua sendo quem grava as transações lá.
