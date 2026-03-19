# Como ter transações novas sem usar o Update via API (plano Sandbox)

O seu plano Pluggy não permite chamar `PATCH /items/{id}` em itens de **produção** (só Sandbox). Sem esse update, a API devolve sempre o último snapshot que ela tem — por isso as transações “novas” não aparecem quando você roda o workflow.

Há **duas formas** de conseguir transações atualizadas mesmo assim.

---

## 1. Aproveitar o sync automático da Pluggy (recomendado)

A Pluggy faz **sync automático** do item em produção (geralmente a cada **24h, 12h ou 8h**, conforme o plano). Ou seja, mesmo sem chamar o Update na API, os dados do item são atualizados de tempos em tempos no servidor deles.

**O que fazer:** fazer o **workflow rodar depois** que esse sync já tiver acontecido.

- **Agendar o workflow** no n8n para rodar **mais de uma vez por dia**, por exemplo:
  - **A cada 12 horas:** 0 0,12 * * * (meia-noite e meio-dia)
  - **A cada 8 horas:** 0 0,8,16 * * *
- Assim, em pelo menos uma das execuções você pega o período já sincronizado pela Pluggy e as transações novas aparecem no Supabase.

**No n8n:** abra o node **Schedule Trigger** do workflow “BYLA - Pluggy para Supabase”, mude o intervalo para **Every 12 hours** (ou Every 8 hours) e salve. Não precisa mudar mais nada no fluxo.

Se você souber com a Pluggy em qual horário roda o sync (ex.: “todo dia às 6h”), pode deixar o workflow só **1x por dia** nesse horário (ex.: 7h), que já ajuda.

---

## 2. Atualizar na hora, manualmente (Pluggy Connect)

Quando você precisar de transações **na hora** (antes do próximo sync automático), dá para **atualizar o item manualmente** pelo **Pluggy Connect** (modo “update”). Depois disso, na próxima vez que o workflow rodar (ou quando você executar manualmente), ele já vai buscar os dados novos.

### Passo a passo resumido

1. **Gerar um token de update**  
   Rode no n8n o workflow **“Gerar token update Pluggy”** (veja o JSON em `n8n-workflows/workflow-gerar-token-update-pluggy.json`).  
   Na saída do node que chama a API de connect token, você verá algo como:
   - `accessToken`: token para abrir o Connect
   - `itemId`: id do item (já usado no workflow principal)

2. **Abrir o Connect em modo update**  
   Abra no navegador o arquivo **`docs/pluggy-connect-update.html`** (pode ser por “abrir arquivo” ou por um servidor local).  
   Na página:
   - Cole o **accessToken** (e o **itemId** se a página pedir).
   - Clique no botão para abrir o Pluggy Connect.  
   O widget abre em **modo update** (atualiza o item sem criar outro).

3. **Concluir o fluxo no Connect**  
   Se o banco pedir (MFA, nova senha, etc.), faça no widget. Quando terminar, o item fica atualizado no servidor da Pluggy.

4. **Buscar as transações no seu sistema**  
   Rode de novo o workflow **“BYLA - Pluggy para Supabase”** (manual ou aguarde o agendamento). A API de transações já vai devolver o snapshot novo e o workflow vai gravar as transações novas no Supabase.

---

## 3. Resumo

| Situação | O que fazer |
|----------|-------------|
| Quero que todo dia (ou a cada 12h/8h) as transações novas caiam no Supabase | Agendar o workflow principal a cada **12h** ou **8h** (e, se possível, alinhar com o horário de sync da Pluggy). |
| Preciso atualizar **agora** (antes do próximo sync) | Usar o workflow **“Gerar token update Pluggy”** → abrir **pluggy-connect-update.html** com o token → concluir o update no Connect → rodar o workflow principal. |
| Quero poder usar Update via API em produção no futuro | Falar com a **Pluggy** para ver plano que permita update em itens de produção ou ajuste de contrato. |

Arquivos relacionados no projeto:

- **Workflow principal (já com Update desativado):** usar o JSON da pasta Downloads ou o que estiver em `n8n-workflows/`.
- **Workflow “Gerar token update Pluggy”:** `n8n-workflows/workflow-gerar-token-update-pluggy.json`.
- **Página para abrir Connect em modo update:** `docs/pluggy-connect-update.html`.
