# Passo a passo: ter transações novas (Pluggy → Supabase)

## Uso normal (automático, sem fazer nada manual)

1. No **n8n**, abra o workflow **"BYLA - Pluggy para Supabase"**.
2. Clique no node **"Schedule Trigger"** (o primeiro do fluxo).
3. No painel da direita, em **"Trigger Interval"** (ou equivalente), escolha **"Every 12 hours"** (ou "Every 8 hours").
4. Salve o workflow e deixe-o **ativo** (toggle "Active" ligado).
5. Pronto. O workflow vai rodar sozinho a cada 12h e trazer as transações que a Pluggy já tiver atualizado. Você não precisa fazer mais nada no dia a dia.

---

## Quando precisar das transações “na hora”

Só use isso quando você não quiser esperar as próximas 12h e precisar dos dados já.

### Passo 1 – Gerar o token no n8n

1. No n8n, no menu: **Workflows** → **Import from File**.
2. Escolha o arquivo: **`n8n-workflows/workflow-gerar-token-update-pluggy.json`** (dentro da pasta do projeto Byla).
3. Abra o workflow importado (**"Gerar token update Pluggy"**).
4. Clique em **"Execute Workflow"** (ou no botão de play).
5. Quando terminar, clique no último node (**"Saída token e itemId"**) e veja o resultado:
   - Copie o valor de **accessToken** (texto longo).
   - Copie o valor de **itemId** (um UUID).

### Passo 2 – Abrir a tela da Pluggy no navegador

1. Abra a pasta do projeto no seu computador e vá em **docs**.
2. Dê dois cliques no arquivo **`pluggy-connect-update.html`** (ele abre no navegador).
3. Na página:
   - Cole o **accessToken** no primeiro campo.
   - Cole o **itemId** no segundo campo.
4. Clique no botão **"Abrir Pluggy Connect"**.
5. Se o banco pedir, faça login ou confirme no pop-up da Pluggy. Quando a tela fechar, a atualização já foi feita.

### Passo 3 – Buscar as transações no Supabase

1. No n8n, abra de novo o workflow **"BYLA - Pluggy para Supabase"**.
2. Clique em **"Execute Workflow"** (execução manual).
3. Quando terminar, as transações novas já estarão na tabela **transacoes** do Supabase.

---

## Resumo

| Situação | O que fazer |
|----------|-------------|
| Uso normal | Só deixar o workflow principal agendado a cada 12h e ativo. Nada manual. |
| Preciso dos dados agora | Passo 1 (gerar token) → Passo 2 (abrir o HTML e concluir o update) → Passo 3 (rodar o workflow principal). |

---

**Quer saber por que o update não pode ficar automático dentro do mesmo workflow?**  
Veja **`docs/UPDATE_AUTOMATICO_PLUGGY.md`**.
