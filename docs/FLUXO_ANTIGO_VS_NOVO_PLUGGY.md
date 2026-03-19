# Entendendo o fluxo antigo (Pluggy) e o fluxo novo

Resumo: **você não está mais usando a API da Pluggy.** O que mudou foi **só de onde vêm as transações**. O destino (Supabase, tabela, views, conciliação) é o mesmo.

---

## 1. Você ainda usa a Pluggy?

**Não.** A Pluggy parou de ser a fonte dos dados porque:

- O plano da Pluggy acabou / não está mais ativo.
- A última sincronização já faz tempo (ex.: 10 dias).
- Sem plano ativo, a Pluggy não conecta mais ao banco e não traz transações novas.

Por isso montamos um **sistema novo** que **não depende da Pluggy**: as transações passam a vir de outra fonte (planilha ou API do PagBank), mas **caem no mesmo lugar** (tabela **transacoes** no Supabase). O resto do projeto (views, conciliação, landing) continua igual.

---

## 2. Fluxo ANTIGO (com Pluggy) – como era na sua cabeça

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   BANCO     │ ──►  │   PLUGGY    │ ──►  │    n8n      │ ──►  Supabase (transacoes)
│ (PagBank)   │      │ (conecta e  │      │ (workflow   │
│             │      │  sincroniza)│      │  Pluggy)    │
└─────────────┘      └─────────────┘      └─────────────┘
```

- **Pluggy** era o meio: você conectava a conta no site da Pluggy, ela lia o banco e disponibilizava as transações via **API da Pluggy**.
- O **n8n** chamava a **API da Pluggy** (get transactions, etc.) e mandava para o Supabase.
- Ou seja: **origem dos dados = API da Pluggy**.

Esse é o “fluxo antigo” que ainda está na sua cabeça: **Banco → Pluggy → n8n → Supabase.**

---

## 3. Fluxo NOVO (sem Pluggy) – como é hoje

A Pluggy **sai** do desenho. Em vez dela, a **origem** dos dados é uma destas duas:

### Opção A – Planilha Google

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│   BANCO     │ ──►  │  PLANILHA       │ ──►  │    n8n      │ ──►  Supabase (transacoes)
│ (qualquer)  │      │  (você cola      │      │ (workflow   │
│             │      │   o extrato)     │      │  planilha)  │
└─────────────┘      └─────────────────┘      └─────────────┘
                            ou
                     Apps Script envia direto para o Supabase
```

- Você exporta o extrato do banco (CSV ou copia/cola), cola na planilha.
- O **n8n** (workflow planilha) ou o **Apps Script** lê a planilha, filtra o que já está no Supabase, e **insere na mesma tabela transacoes**.
- **Origem dos dados = Planilha** (que você alimenta com o extrato do banco).

### Opção B – API PagBank EDI (só se for conta PagBank Empresas)

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│  PAGBANK    │ ──►  │  API EDI        │ ──►  │    n8n      │ ──►  Supabase (transacoes)
│ (sua conta  │      │  (PagBank,       │      │ (workflow   │
│  empresarial)      │   grátis, token) │      │  PagBank)   │
└─────────────┘      └─────────────────┘      └─────────────┘
```

- O **n8n** chama direto a **API de extrato EDI do PagBank** (não a Pluggy).
- O workflow busca os últimos 7 dias, monta as linhas no formato da tabela e insere no Supabase (só as novas).
- **Origem dos dados = API PagBank EDI.**

---

## 4. O que não mudou (por que o “sistema” é o mesmo)

| Parte do sistema | Com Pluggy (antigo) | Sem Pluggy (novo) |
|------------------|---------------------|-------------------|
| Onde as transações ficam | Tabela **transacoes** no Supabase | **Mesma** tabela **transacoes** |
| Formato dos dados | data, pessoa, valor, descricao, tipo, id_unico | **Mesmo** formato |
| Views (entradas, resumo, etc.) | Supabase | **Mesmas** views |
| Conciliação (mensalidades, pagador) | Supabase (transacoes + aluno_planos) | **Mesma** lógica |
| Landing / projeto Byla | Supabase | **Mesmo** projeto |

Ou seja: **o “sistema” que você usa (Supabase, conciliação, relatórios) é o mesmo.**  
O que mudou é **só o cano que enche a tabela transacoes**:

- **Antes:** cano = Pluggy (API Pluggy → n8n → Supabase).
- **Agora:** cano = Planilha (ou Apps Script) **ou** API PagBank EDI (n8n → Supabase).

---

## 5. Tabela resumida: antigo x novo

| | Fluxo antigo (Pluggy) | Fluxo novo |
|---|------------------------|------------|
| **Origem dos dados** | API da **Pluggy** (conectada ao banco) | **Planilha** (você cola extrato) **ou** **API PagBank EDI** |
| **Você usa API Pluggy?** | Sim | **Não** |
| **n8n chama quem?** | API da Pluggy | Google Sheets **ou** API PagBank EDI |
| **Destino** | Supabase, tabela **transacoes** | **Mesmo** Supabase, **mesma** tabela |
| **Views / conciliação** | Supabase | **Iguais** |

---

## 6. Por que a cabeça fica no fluxo antigo

É natural: você passou um tempo com **Banco → Pluggy → n8n → Supabase**.  
Agora é:

- **Banco → Planilha → n8n → Supabase**, ou  
- **PagBank → API EDI → n8n → Supabase**.

Ou seja: **troca só o primeiro “bloco” (Pluggy por Planilha ou por PagBank EDI).** O resto (n8n tratando dados, evitando duplicata, inserindo na **transacoes**) é a mesma ideia; só a **fonte** da lista de transações é que mudou.

---

## 7. Em uma frase

**Antes:** transações vinham da **API da Pluggy** (que conectava ao banco).  
**Agora:** você **não usa mais a Pluggy**; as transações vêm da **planilha** (que você alimenta) ou da **API do PagBank EDI**. O destino (Supabase, tabela **transacoes**, views, conciliação) continua igual.

Se quiser, no próximo passo podemos desenhar só o fluxo que você escolheu (planilha ou PagBank) com os nomes exatos dos workflows no n8n.
