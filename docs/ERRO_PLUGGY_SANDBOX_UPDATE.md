# Erro: "Current client subscription level can only update Sandbox (Pluggy Bank) items"

## O que significa

O plano da sua conta na **Pluggy** permite atualizar (sync) apenas itens do **Sandbox** (ambiente de testes “Pluggy Bank”). A sua conexão é de **produção** (banco real), então a API bloqueia o `PATCH /items/{id}` e retorna:

- **Código:** `SANDBOX_CLIENT_ITEM_UPDATE_NOT_ALLOWED`
- **Mensagem:** "Current client subscription level can only update Sandbox (Pluggy Bank) items"

Ou seja: no plano atual você **não pode** disparar update manual em item de produção; a Pluggy faz o sync automático (diário, conforme o plano).

---

## Solução imediata no workflow

Para o fluxo voltar a rodar sem erro:

1. **Desative** o node **"Update Pluggy"** (clique no node → no painel, marque "Disabled" ou equivalente).
2. **Conecte** a saída de **"Edit Fields1"** diretamente à entrada 1 do **"Merge"** (a que hoje vem do "Wait for sync").
3. Opcional: desative também **"Repor apiKey itemId"** e **"Wait for sync"**, já que não serão usados.

Com isso o fluxo fica: **Edit Fields1 → Merge → Code in JavaScript1 → Buscar Extrato → …**  
O Update deixa de ser chamado e o erro some.

---

## O que você continua tendo

- **Sort by data** – transações do Supabase ordenadas pela mais recente (cálculo de `fromDate`/`toDate` correto).
- **pageSize 500** – mais transações por request na Pluggy.
- **Deduplicação** por `id_unico` e filtro de duplicatas.

A única coisa que **não** acontece é o sync manual antes de buscar: o workflow usa o último snapshot que a Pluggy já tiver (incluindo o sync automático diário deles).

---

## Se quiser update manual no futuro

- **Opção 1:** Falar com a Pluggy e **melhorar o plano** para permitir update de itens de produção via API.
- **Opção 2:** Em ambiente de teste, usar um **item Sandbox (Pluggy Bank)**; aí o node "Update Pluggy" pode ficar ativo.

Enquanto o plano não permitir update em produção, mantenha o node **Update Pluggy** desativado e **Edit Fields1** ligado direto ao **Merge**.
