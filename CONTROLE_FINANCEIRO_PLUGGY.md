# Sistema Automático de Controle Financeiro Pessoal

## 🎯 Objetivo do Projeto

Sistema automatizado que:
- Busca transações bancárias via Pluggy API
- Salva no Supabase
- Evita duplicações
- Mantém o banco sempre atualizado

**Futuro:**
- Relatórios por mês
- Relatórios por pessoa
- Resumos automáticos (IA)
- Envio de relatório por WhatsApp

## 🧱 Stack / Ferramentas

- **n8n** (self-hosted Docker)
- **Pluggy API** (Open Finance)
- **Supabase** (Postgres)
- **JavaScript** (nodes Code no n8n)
- **Schedule Trigger** (execução automática)

## 🗄️ Banco de Dados (Supabase)

### Tabela: `transacoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Primary Key |
| `data` | date/timestamp | Data da transação |
| `pessoa` | text | Nome da pessoa |
| `descricao` | text | Descrição da transação |
| `categoria` | text | Categoria |
| `valor` | numeric | Valor da transação |
| `tipo` | string | `entrada` ou `saida` |
| `id_unico` | string | UNIQUE - Chave para deduplicação |

### Estratégia de Deduplicação

O `id_unico` é gerado concatenando:
```
data + descricao + valor
```

**Exemplo:**
```
2026-01-30T10:44:04.000Z-JOSE NILSON ALVES DE OLIVEIRA--133.36
```

✅ **Funcionando corretamente** - evita duplicações

## 🔁 Fluxo Atual no n8n

### Ordem dos Nodes:

1. **Schedule Trigger** - Execução automática
2. **HTTP Request** - Autenticação Pluggy / Criação de sessão
3. **HTTP Request** - Buscar Extrato (transações)
4. **Code (JavaScript)** - Normaliza os dados
5. **Aggregate** - Agrupa dados
6. **Split Out** - Separa item por item
7. **Edit Fields** - Mapeia campos:
   - `tipo` (entrada/saida baseado no valor)
   - `pessoa`
   - `data`
   - `valor`
   - `id_unico`
8. **Supabase** - Create Row
   - ✅ Continue on fail ativado
   - ✅ Erros de duplicação são ignorados

## ⚠️ Problemas Resolvidos

- ✅ Linhas duplicadas no Supabase → resolvido com `id_unico`
- ✅ Erro de duplicate key → esperado e OK
- ✅ Confusão entre `id` e `id_unico` → resolvido
- ✅ Mapeamento de campos → funcionando

## ❌ Problema Atual (CRÍTICO)

### Sintomas:
- API Pluggy retorna apenas transações até janeiro
- Já existem transações em fevereiro no banco real
- Mesmo alterando `page`, `pageSize`, não atualiza
- Às vezes retorna `{ "total": 0, "results": [] }`

### Causa Raiz:
O Pluggy não atualiza a conta automaticamente. Retorna apenas o último snapshot salvo.

### Solução Identificada:
Antes de buscar o extrato, é necessário:
1. Fazer `POST /items/{itemId}/update`
2. Aguardar alguns minutos (processamento assíncrono)
3. Verificar status do update
4. Buscar extrato atualizado

**⚠️ Este passo AINDA NÃO ESTÁ IMPLEMENTADO**

## 🚀 Próximos Passos

1. ✅ Implementar update da conta Pluggy
2. ✅ Garantir captura de novas transações
3. ✅ Validar estratégia de deduplicação
4. ⏳ Planejar relatórios mensais
5. ⏳ Planejar relatórios por pessoa
6. ⏳ Planejar automação com IA
7. ⏳ Planejar envio por WhatsApp
