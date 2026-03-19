# API EDI do PagBank não traz PIX (com nome do pagador)

## O que a API EDI oferece

A API EDI do PagBank (que você já usa com o token) expõe **movimentos do estabelecimento**:

| Endpoint      | Conteúdo típico |
|---------------|------------------|
| **transactional** | Vendas na **maquininha** (cartão débito/crédito): valor, data, instituição (VISA, ELO, etc.), NSU, código da venda. **Não traz nome de pessoa** – só dados do cartão. |
| **financial**     | Liquidações, pagamentos, cashouts, transferências entre contas PagBank. Estrutura focada em fluxo financeiro, não em “quem pagou” por PIX. |
| **cashouts**      | Saques/cashouts. |
| **balances**      | Saldos. |

Ou seja: a EDI é voltada para **transações de maquininha e liquidações**, não para o **extrato da conta** (conta corrente) onde aparecem os **PIX recebidos com nome do pagador**.

## Onde o PIX “com nome” aparece

Os **PIX recebidos** (e o nome de quem pagou) aparecem no **extrato da conta** no app ou no site do PagBank (“Extrato da conta”). Esse extrato **não é o mesmo** que os relatórios EDI do estabelecimento. Hoje a API EDI que você usa **não** entrega esse extrato de conta com PIX e nome do pagador.

## Como resolver: ter cartão (EDI) + PIX (planilha)

Para ficar com **tudo** na tabela **transacoes** do Supabase (vendas em cartão **e** PIX com nome), use as duas fontes:

### 1. Manter o workflow EDI (cartão/maquininha)

- Continua rodando 1x por dia.
- Preenche **transacoes** com as vendas da **maquininha** (transactional).
- Em **pessoa**/descrição: usamos o que a EDI manda (ex.: “Cartão VISA …”, “Cartão ELO …”), pois não há nome de pessoa nessa API.

### 2. Incluir PIX via planilha (recomendado)

- No **app PagBank** (ou no site): **Extrato da conta** → filtro por PIX (ou exportar/baixar extrato).
- Copie ou exporte as linhas dos **PIX recebidos** (com nome de quem pagou).
- Na **planilha Google** (aba **Importar**), preencha:
  - **Data** (AAAA-MM-DD)
  - **Pessoa** = nome do pagador (como aparece no extrato)
  - **Valor**
  - **Descrição** = ex. “PIX”
  - **Tipo** = “entrada”
- Use o **Apps Script** ou o **workflow n8n “Planilha → Supabase”** para enviar só as linhas novas para a tabela **transacoes**.

Assim:

- **EDI** → entram automaticamente as vendas em **cartão**.
- **Planilha** → você adiciona manualmente (ou semiautomático) os **PIX com nome** que vê no extrato do app.

## Resumo

| Pergunta | Resposta |
|----------|----------|
| A API EDI pega PIX? | **Não** da forma que você precisa: não traz o extrato de conta com PIX e nome do pagador. |
| O que a EDI traz? | Vendas na maquininha (cartão) e, conforme o endpoint, liquidações/financeiro – sem “nome da pessoa” no sentido de PIX. |
| Como ter PIX com nome no Supabase? | Exportar/copiar do **extrato da conta** no app/site e usar a **planilha** (Importar) + Apps Script ou workflow planilha → Supabase. |
| Preciso desligar o workflow EDI? | Não. Mantenha o EDI para cartão e use a planilha em paralelo para PIX. |

Se no futuro o PagBank disponibilizar um endpoint de “extrato de conta” ou “PIX” com nome do pagador na documentação pública, dá para criar um segundo workflow que chame esse endpoint e envie para a mesma tabela **transacoes**.

---

## Existe outra API para pegar PIX?

### O que existe (e as limitações)

| Opção | O que é | Limitação |
|-------|---------|-----------|
| **Stone OpenBank** | API que lista PIX recebidos (período, pagador, valor). Doc: docs.openbank.stone.com.br. | Voltada para **parceiros** (Open Banking). Exige aplicação, permissionamento. Não é só um token no n8n. |
| **PagBank – PIX recebidos** | O ecossistema menciona consulta a PIX recebidos. | Costuma exigir **ativação com executivo comercial**. Não é endpoint público como o EDI. |
| **PagBank Connect** | API para atuar em nome do vendedor (pagamentos, checkout). | Não é extrato da conta nem listar PIX para conciliação. |
| **Pluggy** | Open Banking: trazia transações e PIX com nome. | Seu plano acabou; sem renovação não dá para usar. |

### Conclusão

- **Sim, existem outras APIs** (ex.: Stone OpenBank, possíveis APIs PagBank de PIX), mas são para parceiros ou exigem ativação comercial. Não há hoje um token EDI para PIX simples.
- **Não precisa ser só planilha** no longo prazo: se você conseguir acesso a alguma API de PIX, dá para criar um workflow que leia essa API e grave na mesma tabela **transacoes**.
- **Hoje, na prática**, para ter PIX com nome no Supabase sem depender de aprovação comercial, a **planilha** (exportar extrato do app + Apps Script ou workflow planilha → Supabase) é o caminho que **funciona de imediato**. Vale **perguntar ao PagBank** (suporte ou executivo) se existe API de extrato de conta ou API de PIX recebidos para o seu tipo de conta.
