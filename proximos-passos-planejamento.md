# Planejamento: Próximos Passos do Sistema

## 🔗 Backend + Planilhas como complemento (novo)

- **Objetivo:** Ter Supabase (fonte atual) + 2–3 planilhas do Espaço Byla como fontes; backend lê as duas e aplica lógica “o que funciona e o que não funciona”; front consome o backend onde precisar de dados completos.
- **Documentos:** Plano completo e prompt mestre em `docs/PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md` e `docs/PROMPT_IMPLEMENTAR_BACKEND_PLANILHAS.md`. Segue `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`.
- **Fases:** (1) Backend mínimo + uma rota Supabase + uma planilha; (2) Módulo de merge e regras documentadas; (3) Front chama backend nas telas que precisam; (4) opcional: cache e performance.

---

## 🎯 Fase Atual: Captura de Dados ✅ (Em Implementação)

- [x] Estrutura do banco Supabase
- [x] Fluxo básico no n8n
- [x] Deduplicação funcionando
- [ ] **Update automático do Pluggy** ← IMPLEMENTANDO AGORA
- [ ] Validação de captura de novas transações

---

## 📊 Fase 2: Relatórios Mensais

### Objetivo
Gerar relatórios automáticos por mês com:
- Total de entradas
- Total de saídas
- Saldo do mês
- Top categorias
- Top pessoas (quem mais gastou/recebeu)

### Implementação no n8n

**Fluxo sugerido:**
```
Schedule Trigger (1º dia do mês, 00:00)
    ↓
Code - Calcular período (mês anterior)
    ↓
Supabase - Query SQL
    ↓
Code - Processar e calcular métricas
    ↓
Code - Gerar HTML/Texto do relatório
    ↓
[Futuro: Enviar por WhatsApp/Email]
```

### Query SQL para Relatório Mensal

```sql
-- Relatório mensal
SELECT 
  DATE_TRUNC('month', data) as mes,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total,
  AVG(valor) as media,
  MAX(valor) as maior,
  MIN(valor) as menor
FROM transacoes
WHERE DATE_TRUNC('month', data) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
GROUP BY mes, tipo
ORDER BY mes DESC, tipo;
```

### Query por Categoria

```sql
-- Top categorias do mês
SELECT 
  categoria,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total
FROM transacoes
WHERE DATE_TRUNC('month', data) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
GROUP BY categoria, tipo
ORDER BY total DESC
LIMIT 10;
```

### Query por Pessoa

```sql
-- Resumo por pessoa
SELECT 
  pessoa,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total
FROM transacoes
WHERE DATE_TRUNC('month', data) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND pessoa IS NOT NULL
  AND pessoa != ''
GROUP BY pessoa, tipo
ORDER BY total DESC;
```

### Template de Relatório (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #4CAF50; color: white; padding: 20px; }
    .summary { margin: 20px 0; }
    .positive { color: green; }
    .negative { color: red; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório Financeiro - {{mes}}</h1>
  </div>
  
  <div class="summary">
    <h2>Resumo Geral</h2>
    <p><strong>Total de Entradas:</strong> <span class="positive">R$ {{total_entradas}}</span></p>
    <p><strong>Total de Saídas:</strong> <span class="negative">R$ {{total_saidas}}</span></p>
    <p><strong>Saldo do Mês:</strong> <span class="{{saldo_class}}">R$ {{saldo}}</span></p>
    <p><strong>Total de Transações:</strong> {{total_transacoes}}</p>
  </div>
  
  <div>
    <h2>Top Categorias</h2>
    <table>
      <tr>
        <th>Categoria</th>
        <th>Tipo</th>
        <th>Quantidade</th>
        <th>Total</th>
      </tr>
      {{#each top_categorias}}
      <tr>
        <td>{{categoria}}</td>
        <td>{{tipo}}</td>
        <td>{{quantidade}}</td>
        <td>R$ {{total}}</td>
      </tr>
      {{/each}}
    </table>
  </div>
  
  <div>
    <h2>Resumo por Pessoa</h2>
    <table>
      <tr>
        <th>Pessoa</th>
        <th>Tipo</th>
        <th>Quantidade</th>
        <th>Total</th>
      </tr>
      {{#each por_pessoa}}
      <tr>
        <td>{{pessoa}}</td>
        <td>{{tipo}}</td>
        <td>{{quantidade}}</td>
        <td>R$ {{total}}</td>
      </tr>
      {{/each}}
    </table>
  </div>
</body>
</html>
```

---

## 👥 Fase 3: Relatórios por Pessoa

### Objetivo
Relatórios individuais mostrando:
- Histórico de transações da pessoa
- Total gasto/recebido
- Categorias mais frequentes
- Tendências mensais

### Query SQL

```sql
-- Relatório por pessoa (últimos 6 meses)
SELECT 
  pessoa,
  DATE_TRUNC('month', data) as mes,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total
FROM transacoes
WHERE pessoa = '{{nome_pessoa}}'
  AND data >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY pessoa, mes, tipo
ORDER BY mes DESC, tipo;
```

### Implementação

**Fluxo sugerido:**
```
Schedule Trigger (semanal ou mensal)
    ↓
Code - Listar pessoas únicas
    ↓
Split Out - Uma execução por pessoa
    ↓
Supabase - Query por pessoa
    ↓
Code - Gerar relatório individual
    ↓
[Futuro: Enviar por WhatsApp]
```

---

## 🤖 Fase 4: Resumos Automáticos com IA

### Objetivo
Usar IA (OpenAI, Claude, etc.) para:
- Analisar padrões de gastos
- Sugerir categorias automáticas
- Gerar insights personalizados
- Detectar anomalias

### Implementação no n8n

**Opções de IA:**
1. **OpenAI GPT** (via n8n OpenAI node)
2. **Anthropic Claude** (via HTTP Request)
3. **Google Gemini** (via HTTP Request)

### Exemplo: Categorização Automática

```javascript
// Code node antes de inserir no Supabase
const transaction = $input.item.json;

// Se categoria não estiver definida, usar IA
if (!transaction.categoria || transaction.categoria === 'Outros') {
  const prompt = `Categorize esta transação financeira:
  
Descrição: ${transaction.descricao}
Valor: R$ ${transaction.valor}
Tipo: ${transaction.tipo}

Responda APENAS com o nome da categoria (ex: Alimentação, Transporte, Saúde, etc.)`;

  // Chamar API OpenAI/Claude
  // (implementar HTTP Request node)
  
  transaction.categoria = categoriaDaIA;
}

return { json: transaction };
```

### Exemplo: Análise de Padrões

```javascript
// Após coletar transações do mês
const transactions = $input.all().map(item => item.json);

const prompt = `Analise estas transações financeiras e forneça insights:

${JSON.stringify(transactions, null, 2)}

Forneça:
1. Principais categorias de gastos
2. Tendências observadas
3. Sugestões de economia
4. Alertas sobre gastos incomuns`;

// Chamar IA e salvar resultado
```

### Exemplo: Detecção de Anomalias

```javascript
// Comparar transação atual com histórico
const currentTransaction = $input.item.json;

// Buscar histórico similar
const similarTransactions = await supabase
  .from('transacoes')
  .select('*')
  .eq('pessoa', currentTransaction.pessoa)
  .gte('data', new Date(Date.now() - 90*24*60*60*1000).toISOString());

const avgValue = similarTransactions.reduce((sum, t) => sum + t.valor, 0) / similarTransactions.length;

if (currentTransaction.valor > avgValue * 2) {
  // Possível anomalia - alertar
  console.warn(`⚠️ Transação acima da média: ${currentTransaction.descricao} - R$ ${currentTransaction.valor}`);
}
```

---

## 📱 Fase 5: Envio por WhatsApp

### Opções de Integração

#### Opção 1: WhatsApp Business API (Oficial)
- Requer conta Business verificada
- Mais complexo de configurar
- Mais confiável

#### Opção 2: WhatsApp Web API (não oficial)
- Via bibliotecas como `whatsapp-web.js`
- Mais simples
- Pode ser bloqueado

#### Opção 3: Serviços Terceiros
- **Twilio** (WhatsApp API)
- **Evolution API** (self-hosted)
- **Baileys** (biblioteca Node.js)

### Implementação com Evolution API (Recomendado)

**Fluxo no n8n:**
```
[Relatório gerado]
    ↓
HTTP Request - POST Evolution API
    ↓
Code - Verificar resposta
```

**Exemplo de código:**
```javascript
// Node HTTP Request
// POST https://evolution-api.com/message/sendText/{{instance}}
// Headers: apikey, Content-Type

const relatorio = $input.item.json.html;
const telefone = '5511999999999'; // Formato internacional

return {
  json: {
    number: telefone,
    text: relatorio, // ou converter HTML para texto
    options: {
      delay: 1200,
      presence: 'composing'
    }
  }
};
```

### Template de Mensagem WhatsApp

```
📊 *Relatório Financeiro - Janeiro 2026*

💰 *Resumo Geral*
━━━━━━━━━━━━━━━━━━━━
✅ Entradas: R$ 5.000,00
❌ Saídas: R$ 3.500,00
━━━━━━━━━━━━━━━━━━━━
💵 Saldo: R$ 1.500,00

📈 *Top Categorias*
1. Alimentação - R$ 1.200,00
2. Transporte - R$ 800,00
3. Saúde - R$ 500,00

👥 *Por Pessoa*
• José: R$ 2.000,00
• Maria: R$ 1.500,00

━━━━━━━━━━━━━━━━━━━━
Gerado automaticamente em {{data}}
```

---

## 🗓️ Cronograma Sugerido

### Semana 1-2: Captura de Dados ✅
- [x] Implementar update Pluggy
- [ ] Testar captura de novas transações
- [ ] Validar deduplicação

### Semana 3-4: Relatórios Mensais
- [ ] Criar queries SQL
- [ ] Implementar fluxo de relatório
- [ ] Gerar template HTML

### Semana 5-6: Relatórios por Pessoa
- [ ] Query por pessoa
- [ ] Fluxo de relatório individual
- [ ] Testes

### Semana 7-8: IA e Insights
- [ ] Integrar API de IA
- [ ] Categorização automática
- [ ] Análise de padrões

### Semana 9-10: WhatsApp
- [ ] Configurar Evolution API ou similar
- [ ] Implementar envio
- [ ] Testes finais

---

## 🔧 Ferramentas Adicionais Recomendadas

### Para Relatórios
- **n8n HTML/CSS nodes** - Templates visuais
- **Chart.js** - Gráficos (se gerar imagens)
- **PDF Generator** - Para relatórios em PDF

### Para IA
- **OpenAI API** - GPT-4 para análise
- **Anthropic Claude** - Alternativa ao GPT
- **Google Gemini** - Gratuito e eficiente

### Para WhatsApp
- **Evolution API** - Self-hosted, gratuito
- **Twilio** - Serviço pago, confiável
- **Baileys** - Biblioteca Node.js

---

## 📝 Notas Importantes

1. **Privacidade**: Dados financeiros são sensíveis - sempre use HTTPS e valide APIs
2. **Rate Limits**: Respeite limites das APIs (Pluggy, OpenAI, WhatsApp)
3. **Backup**: Mantenha backup do Supabase regularmente
4. **Monitoramento**: Configure alertas para falhas no fluxo
5. **Testes**: Sempre teste em ambiente de desenvolvimento primeiro
