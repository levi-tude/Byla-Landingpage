# Estrutura das abas – Planilha FLUXO DE CAIXA BYLA

Documentação da estrutura real da planilha, com base nas informações e imagens fornecidas.

---

## Regra geral

- **Primeira parte de cada aba:** modalidades destacadas (cabeçalho colorido) com as respectivas alunas abaixo e as colunas de informação (ALUNO, WPP, RESPONSÁVEIS, PLANO, MATRICULA, FIM, VENC, VALOR, PRÓ, OBS.).
- **Segunda parte:** calendário e verificação de datas/meses, matrículas e valores (se pagou, como pagou ou não).
- **Linha limite:** até uma certa linha há **alunos ativos**; a partir daí só **alunos inativos**. O sistema usa esse limite para marcar `_ativo` e exibir Ativos / Inativos separados.

---

## Abas com estrutura em blocos (modalidade → cabeçalhos → dados)

Estas abas têm **blocos repetidos**: uma linha com o nome da modalidade (ex.: "DANÇA CONTEMPORÂNEA AVANÇADO TERÇA E QUINTA 17:00"), depois uma linha de cabeçalhos (ALUNO, WPP, RESPONSÁVEIS, …), depois as linhas de alunos. O backend usa parser por blocos e aplica o **limite de linha** abaixo.

| Aba              | Linha limite (ativos) | Observação                          |
|------------------|------------------------|-------------------------------------|
| **BYLA DANÇA**   | 81                     | Após linha 81 = só inativos         |
| **PILATES MARINA** | 32                   | Após linha 32 = só inativos         |
| **TEATRO**       | 14                     | Ativos até linha 14                  |
| **YOGA**         | 7                      | Ativos até linha 7                   |
| **G.R.**         | 21                     | Ativos até linha 21                  |
| **TEATRO INFANTIL** | 7                   | Ativos até linha 7                   |

Colunas do bloco: leitura **A:Z** (todas as colunas). Cabeçalhos reconhecidos: **ALUNO** ou **CLIENTE**, **WPP**, **RESPONSÁVEIS**, **PLANO**, **MATRICULA**, **FIM**, **VENC**, **VALOR**, **PRÓ**, **OBS.** / **OBSERVAÇÕES**, e quaisquer outras presentes na planilha.

---

## Outras abas

- **ATENDIMENTOS / ATENDI:** leitura com primeira linha como cabeçalho (sem parser em blocos). Sem limite de linha definido; todos tratados como ativos.
- **CÁLCULOS:** ignorada (não é lista de alunos).
- **FORRÓ:** pode usar leitura padrão (primeira linha = cabeçalho) até haver mapeamento específico.

---

## Implementação no backend

- **`logic/parsePlanilhaPorBlocos.ts`:** parser que detecta linhas de cabeçalho (ALUNO, WPP…), extrai o nome da modalidade da linha anterior e aplica o limite por aba. Cada linha ganha `_aba`, `_modalidade`, `_linha`, `_ativo`.
- **`adapters/PlanilhaAlunosAdapter.ts`:** para abas em `CONFIG_ABAS_BLOCOS` usa `readSheetValues` + `parsearAbaEmBlocos`; para as demais usa `readSheetRange` (primeira linha = cabeçalho).

---

## Frontend

- Seções **por aba** (BYLA DANÇA, PILATES MARINA, etc.) com cards expansíveis.
- Dentro de cada aba, **por modalidade** (nome extraído do cabeçalho do bloco).
- Dentro de cada modalidade: **Ativos (N)** e **Inativos (N)** em blocos separados, com tabelas com as colunas corretas (ALUNO, WPP, RESPONSÁVEIS, PLANO, VENC, VALOR, PRÓ, OBS., etc.) e badge de status (Ativo / Inativo).
