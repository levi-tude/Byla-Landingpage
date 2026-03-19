# Solução: PIX quando o EDI não retorna

A API EDI do PagBank **não está retornando PIX** para o seu estabelecimento (testamos datas e os endpoints vêm vazios ou só com cartão). Esta é a solução para ter **PIX na tabela transacoes** do Supabase.

---

## Em uma frase

**Cartão** continua entrando pelo **workflow EDI** (n8n). **PIX** entra pela **planilha Google** (você cola o extrato do app e envia para o Supabase).

---

## Passo a passo – PIX pela planilha

### 1. Onde pegar os dados do PIX

- Abra o **app PagBank** (ou o site).
- Vá em **Extrato** / **Movimentações** / **Extrato da conta**.
- Filtre ou identifique os **PIX recebidos** (data, nome de quem enviou, valor).
- Exporte em CSV/Excel (se o app tiver) **ou** copie na mão as linhas.

### 2. Colar na planilha “Importar”

- Abra a **planilha Google** que você usa para importar (aba **Importar**).
- Na **primeira linha** deve ter: **Data** | **Pessoa** | **Valor** | **Descrição** | **Tipo**.
- Da **linha 2** em diante, **cole uma linha por PIX**, por exemplo:

  | Data       | Pessoa        | Valor | Descrição | Tipo    |
  |------------|----------------|-------|-----------|---------|
  | 2025-02-20 | MARIA SILVA    | 150   | PIX       | entrada |
  | 2025-02-19 | JOÃO SANTOS    | 95.50 | PIX       | entrada |

- **Data:** formato `AAAA-MM-DD` (ex.: 2025-02-20).
- **Pessoa:** nome de quem enviou o PIX (como aparece no extrato).
- **Valor:** número, sem R$ (use ponto para centavos).
- **Descrição:** coloque **PIX**.
- **Tipo:** **entrada** para PIX recebido.

### 3. Enviar para o Supabase

**Opção A – Apps Script (recomendado)**

1. Na planilha: **Extensões** → **Apps Script**.
2. Use o código do arquivo **docs/planilha-importar-extrato-apps-script.js** (configure SUPABASE_URL e SUPABASE_KEY no topo).
3. Execute a função que envia o extrato (ex.: `enviarExtratoParaSupabase`).
4. Só as **linhas novas** (id_unico que ainda não existe) são inseridas na tabela **transacoes**.

**Opção B – n8n (workflow Planilha → Supabase)**

1. Importe o workflow **n8n-workflows/workflow-planilha-para-supabase.json** no n8n.
2. Configure a credencial **Google Sheets** e a **Supabase**.
3. O workflow lê a aba **Importar**, normaliza as linhas, filtra as que já existem no Supabase e insere as novas na tabela **transacoes**.

Detalhes completos: **docs/planilha-importar-extrato-para-supabase.md**.

---

## Resumo do fluxo

| Origem        | O que entra        | Como |
|---------------|--------------------|------|
| **EDI (n8n)** | Vendas em cartão   | Workflow “PagBank EDI para Supabase” (automático 1x/dia). |
| **Planilha**  | **PIX recebidos**  | Você cola o extrato na aba Importar e roda Apps Script ou workflow “Planilha → Supabase”. |

Tudo cai na **mesma tabela transacoes** (mesmos campos: data, pessoa, valor, descricao, tipo, id_unico). As views e a conciliação continuam iguais.

---

## Template rápido (copiar e colar)

Arquivo **docs/template-importar-transacoes.csv** – pode abrir no Excel/Sheets e usar como modelo. Para PIX, preencha:

- Data (AAAA-MM-DD)
- Pessoa (nome de quem enviou)
- Valor (número)
- Descrição: **PIX**
- Tipo: **entrada**

---

## E no futuro?

- Se o PagBank passar a oferecer **API de extrato de conta** ou **PIX recebidos** para o seu tipo de conta, dá para criar um workflow que chame essa API e grave na mesma tabela **transacoes**.
- Enquanto isso, a **planilha + Apps Script ou n8n** é a solução que **funciona hoje** e não depende da EDI retornar PIX.
