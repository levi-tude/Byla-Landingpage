# Indice de Documentacao Byla

Este arquivo organiza quais documentos estao ativos e qual usar primeiro.

## Leitura inicial recomendada (trilha principal)

1. `ARQUITETURA_SISTEMA_BYLA.md` - Visao completa de engenharia, modulos e fluxo de dados.
2. `CONTRATOS_OPERACAO_QUALIDADE_BYLA.md` - Contratos HTTP, validacao, operacao e checklist de release.
3. `API_CONTRATOS.md` - Contratos dos endpoints principais.
4. `REGRAS_FONTES_SUPABASE_PLANILHAS.md` - Fonte de verdade por dominio de dados.
5. `DECISOES_ARQUITETURAIS_ADR.md` - Registro das principais decisoes de arquitetura.
6. `EVOLUCAO_E_MUDANCAS_BYLA.md` - Historico de evolucao do projeto.

## Relatorios e IA (ativos)

- `RELATORIOS_IA_OBJETIVOS.md` - Formatos JSON e prompt base dos relatorios atuais.
- `RELATORIOS_ENTRADAS_SAIDAS_PROPOSTA_APROVACAO.md` - Diario, mensal, trimestral (entradas/saidas).
- `RELATORIOS_IA_ARQUITETURA_EXPANSAO.md` - **Proposta** de catalogo expandido (R1-R5), fontes, engenharia de prompt e fases de implementacao (validacao antes do codigo).
- `PROMPT_RELATORIO_IA_BYLA.md` - Prompts versionados.
- `ENGENHARIA_DE_PROMPT_E_SW_BYLA.md` - Principios de prompt e software do projeto.

## Guias de negocio (ativos)

- `CONCILIACAO_VENCIMENTOS.md` - Regras de conciliacao por vencimento.
- `CALENDARIO_BANCO_PLANILHA.md` - Regras do calendario financeiro.
- `HARMONIA_FONTES_DADOS.md` - Contexto de convivencia entre fontes.

## Operacao e setup (ativos)

- `SUPABASE_PROJETO_BYLA.md`
- `DUAS_PLANILHAS_CONFIG.md`
- `PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md`
- `N8N_PLANO_IMPLEMENTACAO_VERIFICACAO.md` - Plano e checklist de implementacao/verificacao do export Supabase → Google Sheets (n8n)
- `N8N_STATUS_VERIFICACAO.md` - Status verificado (Supabase/repo) e itens que dependem do n8n na sua instancia

## Historico e estudos (referencia)

Os documentos abaixo continuam uteis como historico, mas nao sao fonte primaria de regra:

- `BACKEND_PLANILHAS_IMPLEMENTADO.md`
- `VERIFICACAO_E_PLANEJAMENTO_CONCLUIDO.md`
- `ANALISE_REGRAS_E_MELHORIAS.md`
- `APRESENTACAO_SISTEMA_BYLA_COMPLETO.md`
- Documentos de workflows Pluggy/n8n e investigacoes pontuais

## Politica de manutencao dos docs

- Ao mudar regra de negocio: atualizar o doc de regra e este indice.
- Ao mudar payload de endpoint: atualizar `API_CONTRATOS.md` e `CONTRATOS_OPERACAO_QUALIDADE_BYLA.md`.
- Ao mudar arquitetura/modulos: atualizar `ARQUITETURA_SISTEMA_BYLA.md` e ADR relacionado.
- Ao concluir marco tecnico relevante: atualizar `EVOLUCAO_E_MUDANCAS_BYLA.md`.
- Evitar criar documento novo sem vincular no indice.
