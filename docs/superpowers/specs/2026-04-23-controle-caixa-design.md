# Design - Controle de Caixa Profissional

Data: 2026-04-23  
Status: Aprovado para planejamento de implementacao  
Escopo: `backend/src/routes/controleCaixa.ts`, `frontend/src/pages/ControleCaixaPage.tsx`, contrato em `frontend/src/services/backendApi.ts`, SQL de schema/migracao de apoio.

## Objetivo

Padronizar o `Controle de Caixa` com estrutura fixa mensal (blocos e linhas predefinidos), sem perder flexibilidade operacional para ajustes locais (adicionar, alterar, remover).  
Quando abrir um mes sem dados, o sistema deve auto-criar a estrutura base.  
Tambem devemos elevar o visual da tela para um dashboard mais profissional, com KPIs e status operacionais.

## Decisoes validadas com o usuario

1. Novo mes sem dados: auto-criar template padrao sem perguntar.
2. Itens padrao: protegidos visualmente e com confirmacao para exclusao.
3. Edicao de item padrao: abrir escolha no momento da alteracao:
   - manter como padrao naquele mes, ou
   - converter para customizado naquele mes.
4. Mesmo com padrao: usuario continua podendo editar campos, incluir blocos/linhas e adaptar o mes.

## Requisitos funcionais

### 1) Estrutura mensal predefinida

- `GET /controle-caixa` deve devolver estrutura base quando nao existir periodo no banco.
- Template contem blocos e linhas fixos, com ordem estavel e chaves tecnicas.
- Campos monetarios continuam nulos inicialmente; somente valores mudam no mes.

### 2) Metadados de governanca por bloco/linha

Cada bloco e linha deve carregar metadados:

- `templateKey`: identificador estavel da estrutura padrao.
- `isDefault`: item padrao ativo no mes.
- `isCustom`: item customizado do mes.
- `lockedLevel`: nivel de protecao para UX (exclusao com confirmacao, badge, alerta).

Regras:

- Itens vindos do template nascem com `isDefault=true`, `isCustom=false`.
- Itens criados manualmente nascem com `isDefault=false`, `isCustom=true`.
- Conversao de padrao para customizado muda os metadados localmente no mes.

### 3) Fluxo de edicao protegida

- Ao editar nome/estrutura de item padrao, abrir modal de decisao:
  - "Manter padrao no mes"
  - "Converter para customizado"
- Exclusao de item padrao sempre pede confirmacao explicita.
- Exclusao de item customizado segue confirmacao leve.

### 4) Dashboard profissional no topo da pagina

- Cards KPI: Entradas, Saidas, Resultado, variacao vs mes anterior.
- Cards de saude: estrutura padrao carregada, percentual preservado, qtd customizada, ultima atualizacao.
- Header premium: competencia, status rascunho/salvo, acao principal de salvar.
- Barra de acao fixa para telas longas: Salvar, Descartar, Restaurar estrutura padrao.

### 5) Flexibilidade operacional garantida

- Permitir adicionar blocos e linhas extras.
- Permitir reordenar blocos/linhas.
- Permitir renomear e remover, com regras de protecao conforme metadado.

## Requisitos nao funcionais

- Compatibilidade com dark mode existente.
- UX responsiva (desktop e tablet; mobile com degradacao aceitavel).
- Salvamento consistente (sem corromper ordem ou metadados).
- Sem regressao para rotas que consomem `controle-caixa`.

## Arquitetura proposta

## Backend

1. Introduzir gerador de template padrao (modulo dedicado):
   - ex.: `backend/src/domain/controleCaixa/template.ts`
   - exporta estrutura base com chaves estaveis e ordem definida.

2. Ajustar `GET /controle-caixa`:
   - Se periodo nao existe, retornar payload base com `origem='template_auto'`.
   - Opcao de criar persistencia imediata no primeiro save (estrategia principal).

3. Ajustar `PUT /controle-caixa`:
   - Persistir metadados novos por bloco/linha.
   - Manter comportamento idempotente do mes.

4. Banco:
   - adicionar colunas de metadados em `controle_caixa_blocos` e `controle_caixa_linhas`.
   - migracao retrocompativel com defaults.

## Frontend

1. Refatorar `ControleCaixaPage` em secoes:
   - `ControleCaixaHeader`
   - `ControleCaixaKpis`
   - `ControleCaixaHealth`
   - `ControleCaixaEditorBlocos`
   - `ControleCaixaActionBar`
   - `ControleCaixaDecisionModal`

2. Estado:
   - manter `draft` atual, com comparacao `isDirty`.
   - adicionar rastreamento da ultima acao (undo rapido local por bloco).

3. UX:
   - badges `Padrao`/`Customizado`.
   - estilos profissionais por tipo (`entrada`/`saida`).
   - confirmacoes diferenciadas por nivel de protecao.

## Fluxo de dados

1. Usuario troca mes -> tela chama `GET /controle-caixa`.
2. Backend retorna:
   - dados persistidos do mes, ou
   - template auto para mes novo.
3. Front renderiza dashboard + editor.
4. Usuario altera item padrao -> modal decide manter padrao vs customizar.
5. Usuario salva -> `PUT /controle-caixa` persiste totais, blocos, linhas e metadados.
6. Query invalida cache de `controle-caixa` e `fluxo-completo`.

## Tratamento de erros e bordas

- Falha de rede: painel de erro com retry.
- Falha de validacao payload: mensagem orientada ao usuario.
- Conflito de ordem/duplicidade: normalizar ordem antes do submit.
- Template invalido por regressao de codigo: fallback para estrutura minima e alerta no log backend.

## Plano de testes

### Backend

- GET mes inexistente retorna template auto valido.
- PUT mes novo persiste estrutura completa com metadados.
- PUT mes existente atualiza sem duplicar blocos/linhas.
- Validar regras de schema para campos nulos e ordens.

### Frontend

- Abrir mes novo mostra estrutura pronta.
- Editar item padrao abre modal com 2 escolhas.
- Escolha "customizar" atualiza badge e payload.
- Excluir item padrao exige confirmacao.
- Add bloco/linha continua funcionando normalmente.
- KPI e cards de saude renderizam no dark/light.

### Integracao

- Fluxo completo: mes novo -> editar -> salvar -> recarregar -> manter estrutura e metadados.
- Sem regressao em `fluxo-completo` que depende dos dados do controle.

## Rollout

1. Entregar backend + migracao + frontend em branch unica.
2. Validar em ambiente de preview.
3. Deploy em producao com monitoramento de erros de API e feedback da secretaria.

## Fora de escopo (neste ciclo)

- Engine avancada de formulas dinamicas por linha.
- Versionamento historico de alteracoes por usuario (auditoria detalhada).
- Importacao/exportacao CSV especifica do editor de controle.

## Criterios de aceite

1. Mes novo abre com estrutura fixa automaticamente.
2. Usuario consegue manter padrao e tambem customizar/expandir.
3. Edicao de item padrao segue prompt de decisao no momento da alteracao.
4. Dashboard da pagina fica visualmente profissional e legivel.
5. Salvamento e recarga preservam ordem, valores e metadados.
