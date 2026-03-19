# Como conseguir usar o Update de novo (Pluggy)

Sim, dá para mudar plano ou configuração e voltar a usar o update automático no workflow. As opções são estas:

---

## 1. Verificar se você está em **produção** (não em Sandbox)

A restrição que você viu (“só pode atualizar itens Sandbox”) às vezes aparece quando a **aplicação** ainda está em ambiente de teste.

**O que fazer:**

1. Acesse o **Dashboard da Pluggy**: [https://dashboard.pluggy.ai/](https://dashboard.pluggy.ai/)
2. Vá em **Aplicações** (ou equivalente).
3. Veja se existe uma **aplicação de produção** e se você está usando ela no n8n (clientId/clientSecret dessa app).
4. Se só tiver app de teste/trial, crie ou ative a opção **“Ir para produção”** (conforme o dashboard). Na produção, a Pluggy libera atualização automática de itens.

Depois disso, **conecte de novo** a conta bancária (se for preciso) pela aplicação de **produção**, para o item ser de produção e não Sandbox. Aí teste de novo o update no workflow.

---

## 2. **Mudar de plano** (Trial → Básico ou Personalizado)

No **Trial gratuito**, a API costuma permitir update **só em itens Sandbox**. Nos planos pagos (Básico ou Personalizado), o update em itens de **produção** costuma ser permitido.

**Planos (site Pluggy):**

- **Trial:** 14 dias, até 20 contas – em geral **só update em Sandbox**.
- **Básico:** a partir de R$ 2.500/mês – inclui uso em produção e atualização de itens.
- **Personalizado:** volume e preço sob medida – “Fale com um Especialista”.

**O que fazer:** se você ainda está no Trial, **assinar o plano Básico** (ou falar com eles para um plano personalizado) deve liberar o update em produção. Aí você reativa o node “Update Pluggy” no workflow e o fluxo fica automático de novo.

---

## 3. **Falar com a Pluggy** e pedir liberação

Vale a pena **perguntar direto** se o seu contrato pode permitir update em produção (ou em que plano isso está incluso).

**Onde falar:**

- No site: [https://www.pluggy.ai/pricing](https://www.pluggy.ai/pricing) – há o link **“Tem alguma dúvida? fale com a gente!”** e **“Fale com um Especialista”** (plano personalizado).
- Pelo **Dashboard**: [https://dashboard.pluggy.ai/](https://dashboard.pluggy.ai/) – costuma ter suporte/contato.
- **Docs/FAQ**: [https://docs.pluggy.ai/page/faq](https://docs.pluggy.ai/page/faq) – para contexto antes de falar com eles.

**Sugestão de mensagem (pode copiar e colar):**

> “Estou integrando a API da Pluggy com n8n para buscar transações e salvar no Supabase. Ao chamar PATCH /items/{id} para atualizar um item de **produção**, recebo o erro: ‘Current client subscription level can only update Sandbox (Pluggy Bank) items’.  
>  
> Preciso poder disparar o update em itens de produção via API para ter transações atualizadas no meu fluxo.  
>  
> Pode me informar: (1) no meu plano atual isso está incluso ou não? (2) Se não, qual plano ou alteração de contrato permite update de itens de produção via API?”

Assim eles conseguem dizer exatamente o que mudar (plano, app de produção, etc.) para você usar o update de novo.

---

## Resumo

| O que fazer | Ação |
|-------------|------|
| Estar em produção | No dashboard, criar/ativar aplicação de **produção** e usar essas credenciais no n8n; reconectar a conta se necessário. |
| Sair do Trial | Assinar **plano Básico** (ou Personalizado) para liberar update em produção. |
| Ter certeza do que seu plano permite | **Falar com a Pluggy** (site/dashboard) e perguntar se o seu plano permite update em itens de produção via API. |

Quando a Pluggy liberar o update em produção no seu caso, é só **reativar o node “Update Pluggy”** no workflow e **reconectar** “Edit Fields1” → “Update Pluggy” → “Repor apiKey itemId” → “Wait for sync” → “Merge”, como estava antes. O fluxo volta a ficar 100% automático.
