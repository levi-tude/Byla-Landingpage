# Update automático no workflow – por que não dá (e quando daria)

## Por que não dá hoje, dentro do mesmo workflow

O **update** que a gente desativou era um node que chama a **API da Pluggy** (algo como “atualize esse item agora”). A própria Pluggy responde assim:

- **“Current client subscription level can only update Sandbox (Pluggy Bank) items”**

Ou seja: no **seu plano atual**, a API **só** deixa fazer esse update em conta **Sandbox** (teste). Na sua **conta real**, ela **bloqueia** essa chamada. Por isso:

- Não adianta “colocar o update de volta” no workflow: toda vez que rodar, a API vai dar erro e o fluxo quebra.
- Não existe truque no n8n para contornar isso: a limitação é do **contrato/plano** com a Pluggy.

O **update manual** que você faz pelo navegador (página HTML + Pluggy Connect) é outro tipo de fluxo: a Pluggy permite que o **usuário** atualize a conta real pela tela deles; o que não pode é o **sistema** (n8n) chamar a API de update em conta real com o plano atual.

Por isso: **não tem como** deixar esse update “escondido” e automático dentro do outro workflow com o plano que você tem hoje. Ou o plano muda, ou a gente segue com as duas opções que já montamos (agendamento 12h + update manual quando precisar).

---

## Quando o update ficaria 100% automático no workflow

Só fica **totalmente automático dentro do workflow** se a Pluggy **permitir** update em item de produção pela API. Aí sim:

1. Você (ou o suporte da Pluggy) ajusta o plano/contrato para permitir update em produção.
2. A gente **reativa** o node “Update Pluggy” no workflow e **reconecta** a sequência: antes de buscar transações, o workflow chama o update, espera uns minutos e depois busca. Tudo no mesmo fluxo, sem nada manual.

Enquanto a Pluggy não liberar isso no seu plano, o máximo que dá é:

- **Automático no tempo:** workflow rodando a cada 12h (ou 8h), pegando o que a Pluggy já atualizou sozinha. Você não faz nada manual.
- **Update “na hora”:** manual (gerar token → abrir o HTML → rodar o workflow), quando você precisar dos dados na hora.

---

## O que fazer na prática

1. **Deixar o workflow principal** agendado a cada **12 horas** e ativo → isso já é “automático” no sentido de você não precisar fazer nada; as transações novas vão entrando conforme a Pluggy for atualizando.
2. Se um dia a **Pluggy liberar** update em produção no seu plano, aí sim dá para colocar o update de volta no workflow e aí fica **tudo automático** dentro do mesmo fluxo, sem passo manual.

Resumo: **hoje não tem como ficar automático o update dentro do outro workflow** por causa do plano; **não é falta de implementação**, é limite da Pluggy. O que está feito é o que dá: automático por agendamento (12h) + opção manual quando precisar “agora”.
