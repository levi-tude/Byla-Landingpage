# Solução gratuita: conectar o banco e manter o projeto funcionando

Tudo **sem custo**: você consegue continuar trazendo transações para o Supabase e usando as views de conciliação. Escolha uma das opções abaixo.

**→ Para implementar passo a passo, use o guia:** [**IMPLEMENTAR_NOVO_SISTEMA.md**](./IMPLEMENTAR_NOVO_SISTEMA.md)

---

## Opção 1 – Planilha Google (funciona **agora**, qualquer banco) ★ recomendado para começar

**Ideia:** Você exporta o extrato do banco em CSV (ou copia e cola). Cola numa planilha Google. Um script ou o n8n envia só as linhas novas para o Supabase. As views e a conciliação continuam iguais.

**Vantagens:** Grátis, funciona com **qualquer banco** (PagBank, Nubank, BB, etc.), não depende de API nem de aprovação. Você faz em 5 minutos.

**Como usar (caminho A – só Google + Apps Script):**

1. Crie uma planilha no Google Sheets.
2. Na **primeira aba**, nomeie como **Importar** e coloque na primeira linha os títulos:  
   `Data` | `Pessoa` | `Valor` | `Descrição` | `Tipo`
3. Configure o script que envia da planilha para o Supabase (veja **docs/planilha-importar-extrato-para-supabase.md** e o código em **docs/planilha-importar-extrato-apps-script.js**).
4. Quando tiver extrato novo: exporte CSV do banco (ou copie do app), cole nas linhas abaixo dos títulos na aba **Importar**. Ajuste se precisar: **Tipo** = `entrada` ou `saida`, **Data** no formato `AAAA-MM-DD`.
5. No Apps Script, execute a função **EnviarExtratoParaSupabase** (ou use um botão na planilha). As linhas novas vão para a tabela **transacoes** do Supabase, sem duplicar.

**Como usar (caminho B – n8n lê a planilha):**

1. Crie uma planilha com uma aba **Extrato** com as colunas: Data, Pessoa, Valor, Descrição, Tipo.
2. Importe no n8n o workflow **n8n-workflows/workflow-planilha-para-supabase.json** e configure a conexão com o Google Sheets e com o Supabase.
3. Agende o workflow (ex.: a cada 12h) ou rode manualmente. O n8n lê a planilha, filtra o que ainda não está no Supabase, e insere na tabela **transacoes**.

**Arquivos:**  
- **docs/planilha-importar-extrato-para-supabase.md** – passo a passo da planilha.  
- **docs/planilha-importar-extrato-apps-script.js** – código Apps Script (planilha → Supabase).  
- **n8n-workflows/workflow-planilha-para-supabase.json** – workflow n8n (planilha → Supabase).

---

## Opção 2 – API PagBank EDI (só PagBank Empresas, grátis depois do token)

**Ideia:** Sua conta é **PagBank Empresas** (como no Pluggy). O PagBank tem uma **API de extrato EDI** que você usa **de graça**. Precisa só **pedir um token uma vez** pelo portal deles. Depois, um workflow no n8n chama essa API todo dia e grava as transações no Supabase.

**Vantagens:** Grátis, automático (n8n agenda), sem colar planilha. Dados em D+1 (dia seguinte).

**Desvantagens:** Só vale para conta **PagBank** (vendedor/empresas). O token é obtido abrindo um chamado no portal do desenvolvedor PagBank (pode levar alguns dias).

**Como usar:**

1. Solicite o token da API EDI no portal PagBank:  
   [Token API EDI](https://developer.pagbank.com.br/devpagbank/docs/edi#token-api-edi) – abra um chamado, informe que é “Cliente PagBank”, peça 1 token para seu número de estabelecimento (USER). O token chega por e-mail.
2. No n8n, importe o workflow **n8n-workflows/workflow-pagbank-edi-para-supabase.json**.
3. Configure as credenciais: **USER** (número do estabelecimento) e **TOKEN** (o que você recebeu). A autenticação na API EDI é Basic (USER:TOKEN em Base64).
4. Agende o workflow (ex.: 1x por dia de manhã, para pegar o dia anterior). O workflow chama a API EDI, monta as linhas no formato da tabela **transacoes** e insere no Supabase.

**Arquivos:**  
- **docs/PAGBANK_EDI_SUPABASE.md** – passo a passo e estrutura da API.  
- **n8n-workflows/workflow-pagbank-edi-para-supabase.json** – workflow n8n (PagBank EDI → Supabase).

---

## O que não muda no seu projeto

- Tabela **transacoes** no Supabase: mesma estrutura (data, pessoa, valor, descricao, tipo, id_unico).
- Views **v_entradas_oficial**, **v_reconciliacao_mensalidades**, **v_resumo_mensal_oficial**, etc.: continuam sendo usadas do mesmo jeito.
- Conciliação com **aluno_planos** (nome do pagador, PIX em grupo): mesma lógica.

A única coisa que muda é **de onde** vêm as linhas de **transacoes**: em vez da Pluggy, entram pela **planilha** (Opção 1) ou pela **API PagBank EDI** (Opção 2).

---

## Qual escolher?

| Se você… | Use |
|----------|-----|
| Quer algo que funcione **hoje** com qualquer banco | **Opção 1** (planilha + Apps Script ou n8n). |
| Usa **só PagBank Empresas** e pode esperar o token | **Opção 2** (PagBank EDI + n8n); depois fica automático. |
| Quer o máximo de automação e tem PagBank | **Opção 2**; pode ainda usar a planilha como backup ou para outro banco. |

Recomendação: comece pela **Opção 1** (planilha) para não parar o projeto. Se for PagBank Empresas, peça o token da **Opção 2** e, quando chegar, ative o workflow EDI para ficar tudo automático.
