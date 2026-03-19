# Automatizar: exportar extrato no fim do mês e inserir na tabela

Você exporta o extrato (todo fim do mês ou quando quiser) e o **n8n faz as inserções automaticamente** na tabela **transacoes** do Supabase. Só uma ação sua: colar o extrato na planilha.

---

## Fluxo (o que você faz vs o que é automático)

| Você faz | Automático |
|----------|------------|
| 1. No fim do mês (ou quando quiser): exporta o extrato do PagBank (CSV/Excel). | — |
| 2. Abre a planilha Google, aba **Importar**, e **cola** os dados (ou usa Arquivo → Importar e envia o CSV). | — |
| 3. (Opcional) Ajusta a **primeira linha** para ter: **Data**, **Pessoa**, **Valor**, **Descrição**, **Tipo** (veja abaixo). | — |
| — | 4. O **n8n** roda todo dia às **6h** (ou você dispara manual) e **insere só as linhas novas** na tabela transacoes. |

Ou seja: você só exporta e cola na planilha; quem grava no Supabase e evita duplicata é o n8n.

---

## Passo a passo

### 1. Configurar o workflow no n8n (uma vez)

1. Importe o workflow **`n8n-workflows/workflow-planilha-para-supabase.json`** no n8n (Workflows → Import from File).
2. No nó **Ler aba Importar**, configure a credencial **Google Sheets** e escolha a **planilha** (e a aba **Importar**).
3. Nos nós do Supabase, configure a credencial **Supabase** (mesma do workflow EDI).
4. **Ative o workflow** (toggle **Active**). Assim o agendamento “todo dia 6h” passa a rodar sozinho.

### 2. Formato da aba Importar

Na **primeira linha** da aba **Importar**, use exatamente estas colunas (pode ser na ordem abaixo):

| A – Data | B – Pessoa | C – Valor | D – Descrição | E – Tipo |
|----------|------------|-----------|---------------|----------|
| 2025-02-20 | MARIA SILVA | 150 | PIX | entrada |
| 2025-02-19 | JOÃO SANTOS | 95.50 | Débito | saida |

- **Data:** formato `AAAA-MM-DD`. Se o export vier em DD/MM/AAAA, o workflow converte.
- **Pessoa:** nome de quem aparece na transação (ex.: quem enviou o PIX).
- **Valor:** número (use ponto para centavos). Sem R$.
- **Descrição:** texto livre (ex.: PIX, Débito, Crédito).
- **Tipo:** só `entrada` ou `saida`.

Da **linha 2** em diante vêm os dados (uma linha por transação).

**Se o export do banco tiver outros nomes de coluna**, o workflow tenta usar: **Data** (ou Data Lancamento), **Pessoa** (ou Histórico, Pagador, Nome, Descrição), **Valor** (ou "Valor Crédito" / "Valor Débito"). Basta que a **primeira linha** da planilha tenha um desses nomes (ou renomeie para Data, Pessoa, Valor, Descrição, Tipo).

### 3. Todo fim do mês (ou quando quiser)

1. No **app ou site do PagBank**: Extrato / Movimentações → exporte em **CSV** ou **Excel** (período do mês).
2. Abra o arquivo no Excel ou Google Sheets.
3. Se as colunas do export forem diferentes (ex.: Data, Histórico, Valor Débito, Valor Crédito):
   - Copie as colunas e **monte** na planilha de importação com **Data | Pessoa | Valor | Descrição | Tipo**.
   - Para **Pessoa**: use a coluna que tiver nome/origem (ex.: “Histórico” ou “Descrição” do banco).
   - Para **Valor**: use o valor positivo; em **Tipo** use `entrada` para recebimentos e `saida` para pagamentos.
4. **Cole** tudo na aba **Importar** da planilha Google (substituindo ou acrescentando às linhas já existentes).
5. Pronto. Na **próxima execução** do n8n (às 6h ou quando você rodar manual), as **linhas novas** serão inseridas na tabela **transacoes**. Nenhuma linha que já existir (mesmo data + pessoa + valor) será duplicada.

### 4. Rodar na hora (opcional)

Se não quiser esperar até as 6h:

- Abra o workflow no n8n e clique em **Execute Workflow** (disparo manual). O n8n lê a planilha, compara com o Supabase e insere só o que ainda não existe.

---

## Resumo

- **Automatizado:** leitura da planilha, comparação com o Supabase e inserção das linhas novas (agendado todo dia às 6h ou manual).
- **Seu passo:** exportar o extrato do PagBank e colar (ou importar) na aba **Importar** da planilha, no formato **Data | Pessoa | Valor | Descrição | Tipo**.

Assim você concentra o trabalho em “exportar e colar” uma vez por mês (ou com a frequência que quiser); o resto das inserções na tabela fica automático.
