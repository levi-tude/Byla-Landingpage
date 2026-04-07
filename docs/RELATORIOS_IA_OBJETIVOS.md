# Relatórios com IA – Objetivos e formato dos dados

Este documento define o **formato JSON** retornado pelos endpoints de relatórios e o **prompt base** para geração de texto com IA. A integração com modelo de linguagem (ex.: OpenAI) será feita em etapa posterior; primeiro os endpoints devolvem apenas os dados estruturados.

Referência de prompt existente: `docs/PROMPT_RELATORIO_IA_BYLA.md`.

---

## Tipos de relatório

| Tipo       | Endpoint                         | Parâmetros        | Descrição                          |
|-----------|-----------------------------------|-------------------|------------------------------------|
| **Mensal**   | `GET /api/relatorios/mensal`      | `mes`, `ano`      | Um mês: Supabase + planilha        |
| **Trimestral** | `GET /api/relatorios/trimestral` | `trimestre`, `ano` | 3 meses agregados (T1=jan-mar, …)  |
| **Anual**    | `GET /api/relatorios/anual`      | `ano`             | 12 meses agregados do ano          |

---

## Formato JSON – Relatório mensal

`GET /api/relatorios/mensal?mes=3&ano=2026`

```json
{
  "tipo": "mensal",
  "mes": 3,
  "ano": 2026,
  "periodo_label": "Março de 2026",
  "entradas": {
    "total_oficial": 45000,
    "total_planilha": 44800,
    "por_fonte_planilha": [
      { "label": "Entradas Parceiros", "valor": 12000 },
      { "label": "Entradas Aluguel", "valor": 8000 }
    ],
    "comparacao_mes_anterior": { "total_anterior": 42000, "delta_absoluto": 3000, "delta_percentual": 7.14 }
  },
  "saidas": {
    "total_oficial": 38000,
    "total_planilha": 37500,
    "por_bloco_planilha": [
      { "nome": "Gastos Fixos", "total": 15000 },
      { "nome": "Saídas Aluguel", "total": 5000 }
    ],
    "comparacao_mes_anterior": { "total_anterior": 36000, "delta_absoluto": 2000, "delta_percentual": 5.56 }
  },
  "lucro": {
    "valor": 7000,
    "valor_planilha": 7300,
    "lucro_mes_anterior": 6000,
    "delta_absoluto": 1000,
    "delta_percentual": 16.67
  },
  "destaques": {
    "categorias_maior_despesa": [
      { "nome": "Gastos Fixos", "valor": 15000 },
      { "nome": "Saídas Aluguel", "valor": 5000 }
    ],
    "gastos_fixos_itens": [
      { "label": "Energia", "valor": 800 },
      { "label": "Internet", "valor": 200 }
    ]
  },
  "fontes": {
    "resumo_oficial_origem": "v_resumo_mensal_oficial",
    "planilha_origem": "CONTROLE DE CAIXA",
    "aba_planilha": "ABRIL 26"
  }
}
```

Campos opcionais: se não houver mês anterior ou planilha indisponível, `comparacao_mes_anterior` ou totais da planilha podem ser `null`.

---

## Formato JSON – Relatório trimestral

`GET /api/relatorios/trimestral?trimestre=1&ano=2026`

- `trimestre`: 1 (jan–mar), 2 (abr–jun), 3 (jul–set), 4 (out–dez).
- Resposta agrega os 3 meses do trimestre (soma de entradas, saídas, e médias ou totais conforme o caso).

```json
{
  "tipo": "trimestral",
  "trimestre": 1,
  "ano": 2026,
  "periodo_label": "1º trimestre de 2026 (Jan–Mar)",
  "meses": [1, 2, 3],
  "entradas": {
    "total_oficial": 132000,
    "total_planilha": 131500,
    "media_mensal_oficial": 44000,
    "comparacao_trimestre_anterior": { "total_anterior": 125000, "delta_absoluto": 7000, "delta_percentual": 5.6 }
  },
  "saidas": {
    "total_oficial": 110000,
    "total_planilha": 109000,
    "media_mensal_oficial": 36666.67,
    "comparacao_trimestre_anterior": { "total_anterior": 105000, "delta_absoluto": 5000, "delta_percentual": 4.76 }
  },
  "lucro": {
    "total_oficial": 22000,
    "total_planilha": 22500,
    "media_mensal": 7333.33,
    "comparacao_trimestre_anterior": { "total_anterior": 20000, "delta_absoluto": 2000, "delta_percentual": 10 }
  },
  "por_mes": [
    { "mes": 1, "ano": 2026, "total_entradas": 42000, "total_saidas": 35000, "saldo": 7000 },
    { "mes": 2, "ano": 2026, "total_entradas": 43000, "total_saidas": 36000, "saldo": 7000 },
    { "mes": 3, "ano": 2026, "total_entradas": 47000, "total_saidas": 39000, "saldo": 8000 }
  ],
  "fontes": {
    "resumo_oficial_origem": "v_resumo_mensal_oficial",
    "planilha_origem": "CONTROLE DE CAIXA"
  }
}
```

---

## Formato JSON – Relatório anual

`GET /api/relatorios/anual?ano=2026`

- Agrega os 12 meses do ano a partir de `v_resumo_mensal_oficial` e, quando disponível, da planilha CONTROLE DE CAIXA (média ou soma por mês).

```json
{
  "tipo": "anual",
  "ano": 2026,
  "periodo_label": "Ano 2026",
  "entradas": {
    "total_oficial": 520000,
    "total_planilha": 518000,
    "media_mensal_oficial": 43333.33,
    "comparacao_ano_anterior": { "total_anterior": 480000, "delta_absoluto": 40000, "delta_percentual": 8.33 }
  },
  "saidas": {
    "total_oficial": 440000,
    "total_planilha": 436000,
    "media_mensal_oficial": 36666.67,
    "comparacao_ano_anterior": { "total_anterior": 410000, "delta_absoluto": 30000, "delta_percentual": 7.32 }
  },
  "lucro": {
    "total_oficial": 80000,
    "total_planilha": 82000,
    "media_mensal": 6666.67,
    "comparacao_ano_anterior": { "total_anterior": 70000, "delta_absoluto": 10000, "delta_percentual": 14.29 }
  },
  "por_mes": [
    { "mes": 1, "ano": 2026, "total_entradas": 42000, "total_saidas": 35000, "saldo": 7000 },
    "..."
  ],
  "fontes": {
    "resumo_oficial_origem": "v_resumo_mensal_oficial",
    "planilha_origem": "CONTROLE DE CAIXA"
  }
}
```

---

## Prompt base para IA (qualquer tipo)

O texto gerado pela IA deve usar **apenas** os números e rótulos presentes no JSON. Nada inventado.

### System (fixo)

```
Você é um analista financeiro experiente do Espaço Byla. Sua tarefa é gerar relatórios executivos objetivos a partir dos dados fornecidos em JSON. Regras: (1) Responda sempre em português brasileiro. (2) Use apenas os números e categorias presentes nos dados; não invente valores. (3) Estruture o texto em seções claras (Resumo, Entradas, Saídas, Lucro, Destaques ou Comparativo). (4) Seja conciso; evite jargão desnecessário. (5) Para relatórios trimestrais/anuais, comente tendências e comparações quando os dados incluírem período anterior.
```

### User (template)

```
Analise os dados abaixo e produza o relatório executivo [mensal|trimestral|anual] conforme o tipo indicado.

[DADOS]
{{ JSON do relatório }}
[/DADOS]

Gere o texto nas seções definidas nas regras, em até 600 palavras para mensal e até 800 para trimestral/anual.
```

- `{{ JSON do relatório }}` será substituído pela resposta do endpoint (`/api/relatorios/mensal`, `trimestral` ou `anual`).

---

## IA: opção gratuita (Google Gemini)

O endpoint `POST /api/relatorios/gerar-texto-ia` usa **Google Gemini** (grátis) quando a variável `GEMINI_API_KEY` está definida no `backend/.env`. Caso contrário, usa OpenAI se `OPENAI_API_KEY` estiver definida.

**Como usar a opção gratuita:**

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey) e faça login com sua conta Google.
2. Clique em **Create API key** e copie a chave.
3. No arquivo **`backend/.env`**, adicione:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
4. Reinicie o backend. Ao clicar em **Gerar texto com IA** na página Relatórios, o backend chamará a API do Gemini (cota gratuita generosa; não exige cartão de crédito).

Modelo usado: `gemini-1.5-flash`. Se quiser usar OpenAI em vez disso, defina apenas `OPENAI_API_KEY` no `.env` (o backend prioriza Gemini quando ambas estão definidas).

---

## Implementação

- **Backend:** `backend/src/routes/relatorios.ts` (montado em `api.ts`) — rotas `GET /api/relatorios/*` (diário, mensal, trimestral, anual), `GET /api/relatorios/ia-status`, `POST /api/relatorios/gerar-texto-ia`. Leitura de `v_resumo_mensal_oficial` (Supabase) e de `GetFluxoCompletoUseCase` (planilha CONTROLE DE CAIXA) por mês.
- **Frontend:** Página ou seção "Relatórios" que permite escolher tipo (mensal/trimestral/anual), parâmetros (mês/ano, trimestre/ano, ano) e exibe o JSON e, futuramente, o texto gerado pela IA.
- **IA:** Em etapa posterior, chamada ao modelo (ex.: OpenAI) com o system/user acima e o JSON do endpoint; exibição do resultado na mesma tela.

Referências: `docs/PROMPT_RELATORIO_IA_BYLA.md`, `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md`.
