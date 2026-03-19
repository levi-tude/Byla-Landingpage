# Proposta: Relatórios de Entradas e Saídas (Diário, Mensal, Trimestral)

**Status:** Aprovado e implementado (relatório diário, mensal, trimestral, fluxo Aprovar, botão Enviar por WhatsApp).

Este documento descreve a especificação dos três relatórios principais (**diário**, **mensal** e **trimestral**) de entradas e saídas, alinhada às diretrizes de **engenharia de prompt** e **engenharia de software** do projeto. Nada será implementado até que você aprove este plano.

Referências: `ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`, `PROMPT_RELATORIO_IA_BYLA.md`, `RELATORIOS_IA_OBJETIVOS.md`, `CONCEITOS_ARQUITETURA_E_PLANO_MELHORIAS.md`.

---

## 1. Visão geral e fluxo de aprovação

### 1.1 Tipos de relatório

| Relatório   | Foco                | Granularidade dos dados | Fonte principal        |
|------------|---------------------|--------------------------|------------------------|
| **Diário** | Entradas e saídas do dia | Uma data (YYYY-MM-DD)   | Supabase (`transacoes`) |
| **Mensal** | Entradas e saídas do mês | Um mês (mes/ano)        | Supabase + planilha CONTROLE DE CAIXA |
| **Trimestral** | Entradas e saídas do trimestre | Três meses              | Supabase + planilha CONTROLE DE CAIXA |

### 1.2 Aprovação em duas etapas

1. **Aprovação desta proposta:** Você revisa este documento (objetivos, dados, formato, prompts e fluxo de uso). Se estiver de acordo, aprova e aí implementamos.
2. **Aprovação do relatório gerado (opcional no produto):** Cada texto gerado pela IA pode ficar como **rascunho** até você clicar em **Aprovar**. Só então o relatório é considerado “oficial” ou disponível para exportar/compartilhar. (Se preferir não ter esse passo no sistema, podemos deixar apenas “gerar e exibir”.)

---

## 2. Relatório diário (entradas e saídas do dia)

### 2.1 Objetivo

Fornecer um resumo **do dia** com total de entradas, total de saídas, saldo do dia e lista (ou resumo) das transações daquela data, em texto curto para leitura rápida.

### 2.2 Fonte de dados (single source of truth)

- **Supabase:** tabela `transacoes`, filtrada por `data = YYYY-MM-DD`.
- Mesmas regras de exclusão já usadas no sistema: entradas EA/Blead ignoradas; saídas para Samuel que casam com entrada externa no mesmo dia (tolerância R$ 300) também ignoradas.
- **Planilha:** não usada no diário (CONTROLE DE CAIXA é mensal).

### 2.3 Estrutura dos dados (JSON para a IA)

```json
{
  "tipo": "diario",
  "data": "2026-03-10",
  "periodo_label": "10/03/2026",
  "entradas": {
    "total": 12500,
    "quantidade": 8,
    "itens_resumo": [
      { "pessoa": "Nome", "valor": 1500, "descricao": "PIX mensalidade" }
    ]
  },
  "saidas": {
    "total": 3200,
    "quantidade": 3,
    "itens_resumo": [
      { "pessoa": "Fornecedor", "valor": 1200, "descricao": "Compra" }
    ]
  },
  "saldo_dia": 9300,
  "fontes": { "origem": "transacoes (Supabase)" }
}
```

- `itens_resumo`: até 15 itens por tipo (entrada/saída), para não estourar o prompt; se houver mais, indicar “e mais N transações”.

### 2.4 Design do prompt (engenharia de prompt)

| Elemento | Conteúdo |
|----------|----------|
| **Role** | “Você é um analista financeiro do Espaço Byla. Gere um resumo objetivo do dia com base nos dados fornecidos.” |
| **Context** | Dados reais no bloco `[DADOS] ... [/DADOS]` (JSON acima). Nenhum número inventado. |
| **Instruction** | “Com base nos dados do dia, produza um resumo em português com: total de entradas, total de saídas, saldo do dia e até 3 destaques (maior entrada, maior saída, observação se houver).” |
| **Output constraint** | Seções: ## Resumo do dia; ## Entradas; ## Saídas; ## Saldo e destaques. Máximo 250 palavras. |
| **CoT (opcional)** | “Antes de escrever: 1) Confira totais; 2) Identifique o maior movimento de entrada e de saída; 3) Redija o texto.” |

---

## 3. Relatório mensal (entradas e saídas do mês)

### 3.1 Objetivo

Resumo executivo **do mês** com totais oficiais (Supabase) e da planilha CONTROLE DE CAIXA, comparação com o mês anterior, destaque de categorias (entradas por fonte, saídas por bloco) e lucro. Já existe endpoint e tela; este documento **formaliza e padroniza** o desenho para aprovação.

### 3.2 Fonte de dados

- **Supabase:** view `v_resumo_mensal_oficial` (mes/ano e mês anterior).
- **Planilha:** CONTROLE DE CAIXA (aba do mês seguinte ao referido; ex.: março ref. → aba “ABRIL 26”) via `GetFluxoCompletoUseCase` (entradas/saídas/lucro e blocos por coluna).

### 3.3 Estrutura dos dados

Já definida em `RELATORIOS_IA_OBJETIVOS.md` (formato JSON do relatório mensal). Manter: `tipo`, `mes`, `ano`, `periodo_label`, `entradas` (total_oficial, total_planilha, por_fonte_planilha, comparacao_mes_anterior), `saidas` (idem), `lucro`, `destaques`, `fontes`.

### 3.4 Design do prompt

| Elemento | Conteúdo |
|----------|----------|
| **Role** | “Você é um analista financeiro experiente do Espaço Byla. Gere relatórios executivos objetivos a partir dos dados em JSON.” |
| **Context** | JSON do relatório no bloco `[DADOS] ... [/DADOS]`. Usar apenas números e categorias presentes nos dados. |
| **Instruction** | “Analise os dados do mês e produza o relatório executivo mensal: resumo, entradas, saídas, lucro, comparação com mês anterior e destaques (maiores despesas, gastos fixos).” |
| **Output constraint** | Seções: ## Resumo; ## Entradas; ## Saídas; ## Lucro; ## Comparativo; ## Destaques. Máximo 600 palavras. |
| **CoT** | “Passos: 1) Totais e tendência vs mês anterior; 2) Principais categorias de entrada e saída; 3) Lucro e recomendações breves.” |

---

## 4. Relatório trimestral (entradas e saídas do trimestre)

### 4.1 Objetivo

Visão **do trimestre** (3 meses) com totais e médias mensais de entradas e saídas, comparação com o trimestre anterior, evolução mês a mês e texto executivo.

### 4.2 Fonte de dados

- **Supabase:** `v_resumo_mensal_oficial` para os 3 meses do trimestre e para o trimestre anterior (T1 ant = out–dez do ano anterior; T2/T3/T4 ant = 3 meses anteriores).
- **Planilha:** CONTROLE DE CAIXA, um mês por vez (GetFluxoCompletoUseCase), agregando totais no backend.

### 4.3 Estrutura dos dados

Já definida em `RELATORIOS_IA_OBJETIVOS.md` (relatório trimestral). Manter: `tipo`, `trimestre`, `ano`, `periodo_label`, `meses`, `entradas`/`saidas`/`lucro` (totais, médias, comparacao_trimestre_anterior), `por_mes`, `fontes`.

### 4.4 Design do prompt

| Elemento | Conteúdo |
|----------|----------|
| **Role** | Igual ao mensal (analista financeiro do Espaço Byla). |
| **Context** | JSON do relatório trimestral em `[DADOS] ... [/DADOS]`. |
| **Instruction** | “Analise os dados do trimestre e produza o relatório executivo trimestral: resumo, totais e médias de entradas e saídas, lucro, comparação com trimestre anterior e tendência mês a mês.” |
| **Output constraint** | Seções: ## Resumo; ## Entradas e saídas do trimestre; ## Lucro e comparativo; ## Tendência por mês; ## Destaques. Máximo 800 palavras. |
| **CoT** | “Passos: 1) Totais e médias; 2) Comparação com trimestre anterior; 3) Evolução mês a mês; 4) Conclusões e recomendações.” |

---

## 5. Fluxo de aprovação no produto (sugestão)

- **Gerar relatório:** usuário escolhe tipo (diário/mensal/trimestral), parâmetros (data; mês/ano; trimestre/ano) e clica em “Gerar relatório”. O sistema busca os dados, monta o JSON e opcionalmente chama a IA para gerar o texto.
- **Rascunho:** o texto gerado é exibido com o rótulo **Rascunho** e um botão **Aprovar**.
- **Aprovar:** ao clicar em **Aprovar**, o relatório passa a constar como “Aprovado” (podemos guardar apenas um estado por relatório na sessão ou em tabela simples no Supabase, conforme você preferir). Relatórios aprovados podem ser listados ou exportados (ex.: PDF) em etapa posterior.

Se você **não** quiser o passo “Aprovar” no sistema, podemos deixar apenas “Gerar e exibir”; a aprovação fica só sobre **esta proposta** antes de implementar.

---

## 6. Princípios de engenharia de software aplicados

- **Single source of truth:** entradas/saídas oficiais vêm de `transacoes` e views; planilha complementa apenas onde definido (mensal/trimestral).
- **Modularidade:** um endpoint por tipo de relatório (diário, mensal, trimestral); prompts versionados em documento e, se desejado, em constantes no código.
- **Configuração externa:** chaves de IA (Gemini/OpenAI) no `.env`; sem valores sensíveis no código.
- **Documentação:** esta proposta e os arquivos em `docs/` (RELATORIOS_IA_OBJETIVOS.md, PROMPT_RELATORIO_IA_BYLA.md) como referência para manutenção.

---

## 7. Resumo do que será implementado após sua aprovação

| Item | Descrição |
|------|------------|
| **Backend** | Novo endpoint `GET /api/relatorios/diario?data=YYYY-MM-DD` retornando JSON do dia; reuso dos endpoints mensal e trimestral já existentes. Ajuste fino dos prompts (diário, mensal, trimestral) conforme esta proposta. |
| **Frontend** | Página Relatórios: opção **Diário** (seletor de data), além de Mensal e Trimestral. Exibição do relatório gerado; opcionalmente botão **Aprovar** e estado “Rascunho” / “Aprovado”. |
| **IA** | Um prompt system/user por tipo (diário, mensal, trimestral), seguindo Role, Context, Instruction, Output constraint e CoT desta proposta; uso da API já configurada (Gemini/OpenAI). |

---

## 8. Como aprovar

- **Aprovar tudo:** responda “Aprovado” ou “Pode implementar” e seguimos com backend (diário + ajustes), frontend e prompts conforme acima.
- **Ajustes:** indique o que deseja mudar (ex.: mais/menos seções no texto, inclusão de inadimplência no mensal, não quer fluxo de Aprovar no produto, etc.). Atualizamos esta proposta e reenviamos para nova aprovação.
- **Dúvidas:** pergunte o que quiser sobre dados, formato ou fluxo; respondo e, se necessário, atualizo o documento.

Documento criado para alinhamento com as diretrizes do projeto e para sua aprovação antes de qualquer implementação.
