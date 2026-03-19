# Roteiro de Apresentação - 15 minutos

**Para:** Donos da Byla  
**Objetivo:** Mostrar o sistema funcionando e o valor que ele traz

---

## Estrutura (15 minutos)

### 1. Abertura (1 min)
"Oi, vim mostrar o sistema que desenvolvi para automatizar o controle financeiro da Byla. Em 15 minutos vocês vão ver como ele funciona e como vai economizar tempo e dar mais controle."

### 2. O Problema (2 min)
**Pergunte:**
- "Quanto tempo vocês gastam por mês conferindo quem pagou?"
- "Como vocês sabem quanto entrou de Pilates vs Dança?"
- "Quando vocês descobrem que alguém não pagou?"

**Anote as respostas** (ex.: "umas 3 horas por mês", "não sabemos separado", "só quando a pessoa some").

**Conecte:** "O sistema resolve exatamente isso."

### 3. Demo: O que Já Funciona (6 min)

#### 3.1 Site (30 segundos)
- Abrir o site (localhost ou deploy)
- "Este é o site institucional. Moderno, com todas as informações. Atrai clientes."

#### 3.2 Captura Automática (2 min)
- Abrir o **n8n** → workflow **PagBank EDI para Supabase**
- "Isso aqui roda todo dia às 6h. Busca as transações do PagBank e grava no banco."
- Clicar em **Execute Workflow** (rodar na hora)
- Mostrar o fluxo: "Últimos 15 dias → chama a API → filtra só o novo → insere no banco."
- "Sem intervenção manual. Você acorda e os dados já estão atualizados."

#### 3.3 Banco de Dados (2 min)
- Abrir **Supabase** → Table Editor → **transacoes**
- "Aqui estão todas as transações. Data, pessoa, valor, se é entrada ou saída."
- Mostrar algumas linhas: "Veja: cartão, PIX, tudo junto."
- Abrir a view **v_resumo_mensal_oficial**
- "Este é o resumo por mês. Quanto entrou, quanto saiu, saldo. Calculado automaticamente."

#### 3.4 Conciliação (1.5 min)
- Abrir a view **v_reconciliacao_mensalidades**
- "Aqui a gente vê: João pagou R$ 230 no dia 20, confirmado no banco (verde). Maria está pendente (vermelho)."
- "Isso que vocês fazem na mão, o sistema faz sozinho. Compara o cadastro com o banco."

### 4. O que Vem a Seguir: BI e IA (4 min)

#### 4.1 Dashboards (2 min)
- Mostrar **imagem de exemplo** de dashboard (Metabase ou Power BI)
- "Com os dados que já temos, vamos criar painéis assim:"
  - Gráfico de receita mensal (linha no tempo)
  - Receita por atividade (barras: Pilates, Dança, etc.)
  - Lista de inadimplentes (tabela)
- "Você abre no celular ou computador e vê tudo atualizado. Sem planilha, sem conferir na mão."

#### 4.2 Relatórios Automáticos (1 min)
- Mostrar **exemplo de mensagem WhatsApp** (texto):

```
📊 Relatório Financeiro - Fevereiro 2025

💰 Resumo Geral
✅ Entradas: R$ 12.500
❌ Saídas: R$ 8.200
💵 Saldo: R$ 4.300

📈 Receita por Atividade
• Pilates: R$ 6.900 (55%)
• Dança: R$ 3.200 (26%)
• Locações: R$ 2.400 (19%)

⚠️ Inadimplentes (3)
• João Silva - R$ 230
• Maria Santos - R$ 230
• Pedro Oliveira - R$ 230
```

- "Isso chega no WhatsApp de vocês todo dia 1º do mês. Automático."

#### 4.3 Inteligência Artificial (1 min)
- "A IA vai além: ela analisa os dados e dá insights."
- Exemplo: "Dança teve 3 novos alunos em fevereiro. Considerar turma extra."
- Exemplo: "Pedro sempre paga até dia 5. Hoje é dia 10 e ele não pagou. Enviar lembrete."
- "É como ter um analista financeiro trabalhando 24/7."

### 5. Benefícios Concretos (1 min)
**Resumir em 3 pontos:**
1. **Economiza tempo:** 10-15 horas/mês que vocês gastam conferindo
2. **Reduz inadimplência:** alertas antecipados, vocês cobram mais rápido
3. **Decisões melhores:** saber onde investir, quando contratar, baseado em dados reais

### 6. Próximos Passos (1 min)
"Nas próximas 2 semanas, vou implementar os dashboards de BI. Em 1 mês vocês terão os painéis funcionando. Em 2 meses, relatórios automáticos no WhatsApp."

**Perguntar:** "Vocês têm alguma dúvida? Querem ver alguma coisa específica?"

---

## Checklist Antes da Apresentação

- [ ] Site rodando (localhost ou deploy)
- [ ] n8n aberto (workflow PagBank EDI)
- [ ] Supabase aberto (tabela transacoes + view v_resumo_mensal_oficial + v_reconciliacao_mensalidades)
- [ ] Imagem de exemplo de dashboard (salvar no computador)
- [ ] Exemplo de mensagem WhatsApp (texto preparado)
- [ ] Slides prontos (7-10 slides)
- [ ] Testar: rodar o workflow na frente deles (garantir que funciona)

---

## Materiais de Apoio

### Slides Sugeridos

1. **Capa:** "Sistema de Gestão Byla - Automatizado e Inteligente"
2. **O Problema:** "Tempo perdido, falta de visão, inadimplência"
3. **A Solução:** Diagrama (Captura → Processamento → Inteligência)
4. **Demo:** "Vamos ver funcionando"
5. **BI:** Imagens de dashboards
6. **IA:** Exemplos de insights
7. **Benefícios:** Tempo, dinheiro, decisões
8. **Roadmap:** O que vem nas próximas semanas
9. **Investimento:** R$ 0-150/mês vs R$ 500-2000/mês
10. **Próximos Passos:** "Implementar BI em 2 semanas"

### Documentos para Deixar com Eles

- Este arquivo: **APRESENTACAO_SISTEMA_BYLA_COMPLETO.md**
- Roadmap visual (pode ser um PDF com o diagrama mermaid)
- Proposta comercial (se for cobrar)

---

## Dicas de Apresentação

1. **Comece pelo problema deles** (não pela tecnologia)
2. **Mostre funcionando** (não só slides)
3. **Fale em valor** (tempo economizado, dinheiro, decisões), não em tecnologia
4. **Use linguagem simples:** "painel" em vez de "dashboard", "automação" em vez de "workflow"
5. **Deixe eles perguntarem:** reserve tempo para dúvidas
6. **Termine com próximo passo claro:** "Vou implementar o BI. Em 2 semanas mostro os painéis."

---

## Possíveis Objeções (e Como Responder)

### "Parece caro"
**R:** "O custo é R$ 0-150/mês. Vocês gastam mais em café. E economiza 10-15 horas/mês, que valem R$ 500-750."

### "E se você sair do projeto?"
**R:** "O sistema é documentado. Qualquer desenvolvedor consegue manter. E posso treinar alguém da equipe."

### "Não entendo de tecnologia"
**R:** "Não precisa. Os painéis são visuais. Você clica e vê. Como usar o Instagram, mas para finanças."

### "Vamos pensar"
**R:** "Claro. Deixo a documentação com vocês. Qualquer dúvida, me chamem. E posso implementar o BI como teste, sem compromisso, para vocês verem o resultado."

---

## Exemplo de Proposta Comercial (se for cobrar)

### Opção 1: Projeto Fechado
- **Setup inicial:** R$ X (implementar tudo: BI, relatórios, IA)
- **Prazo:** 2-3 meses
- **Entrega:** Sistema completo funcionando + treinamento

### Opção 2: Mensalidade
- **Manutenção e suporte:** R$ Y/mês
- **Inclui:** ajustes, novos relatórios, suporte técnico
- **Não inclui:** custo de hospedagem (Supabase/n8n)

### Opção 3: Equity/Participação
- **Proposta:** Implemento o sistema em troca de X% do negócio
- **Vantagem para eles:** sem custo inicial
- **Vantagem para você:** participa do crescimento

---

**Boa sorte na apresentação!**
