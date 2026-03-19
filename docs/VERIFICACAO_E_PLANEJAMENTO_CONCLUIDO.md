# Verificação e planejamento concluído – Byla

**Data:** Março 2026  
**Status:** Verificação feita; planejamento concluído. Metabase roda com Java 17/20 (sem necessidade de Java 21).

---

## 1. Verificação da instalação

### Java
- **Status:** **Suficiente** — o sistema com Java 17, 18, 19 ou 20 já atende.
- **Metabase JAR:** Foi trocado para **v0.47.8**, compatível com Java 17+. Não é necessário instalar Java 21.

### Metabase (BI)
- **Status:** **Pronto para rodar** (JAR na pasta do projeto).
- **Onde:** `metabase\metabase.jar` (Metabase v0.47.8, ~310 MB).
- **Requisito:** Java 17 ou superior (o JAR atual roda com Java 17/18/19/20).
- **Como subir:** Executar **`metabase\iniciar-metabase.bat`** ou `java -Xmx1g -jar metabase.jar` na pasta `metabase`. Acessar **http://localhost:3000**.

### Docker
- **Status:** Instalado, porém o daemon retorna erro 500 (incompatibilidade/engine). Opcional; o uso do JAR dispensa Docker.

### Supabase e n8n
- **Status:** Em uso (transações, planilha → Supabase, views). Sem alteração necessária para o BI.

---

## 2. Planejamento concluído – checklist

### Já feito (entregue no projeto)
| Item | Arquivo / local | Observação |
|------|------------------|------------|
| Guia engenharia de prompt + SW | `docs/ENGENHARIA_DE_PROMPT_E_SW_BYLA.md` | Referência para IA e arquitetura |
| BI – Setup Metabase | `docs/BI_METABASE_SETUP_BYLA.md` | Conexão Supabase + 3 dashboards (SQL e passos) |
| Passo 1 BI (resumo) | `docs/PASSO_1_BI_FAZER_AGORA.md` | Subir Metabase e conectar ao banco |
| Relatório mensal com IA | `n8n-workflows/workflow-relatorio-mensal-ia.json` | Agendado 1º do mês; prompt estruturado (role, contexto, saída) |
| Design do prompt do relatório | `docs/PROMPT_RELATORIO_IA_BYLA.md` | Role, contexto, instrução, output, CoT |
| README relatório IA | `n8n-workflows/README-RELATORIO-MENSAL-IA.md` | Como importar e configurar OpenAI no n8n |
| Metabase JAR | `metabase/metabase.jar` | v0.47.8; roda com Java 17+ (não exige Java 21) |
| Script Metabase | `metabase/iniciar-metabase.bat` | .bat para subir com o Java do sistema |

### Pendente (ação sua)
| Item | Ação |
|------|------|
| **Subir o Metabase** | Executar `metabase\iniciar-metabase.bat`. Aguardar 1–2 min e abrir http://localhost:3000. |
| **Conectar Metabase ao Supabase** | No Metabase: Settings → Databases → Add database (PostgreSQL). Dados em `PASSO_1_BI_FAZER_AGORA.md` seção C. |
| **Criar os 3 dashboards** | Seguir `docs/BI_METABASE_SETUP_BYLA.md` (queries e visualizações para Visão Geral, Conciliação, Entradas). |
| **Configurar relatório IA no n8n** | Importar `workflow-relatorio-mensal-ia.json`; criar credencial Header Auth (OpenAI); testar pelo gatilho manual. |

---

## 3. Ordem recomendada (próximos passos)

1. **Rodar o Metabase** com `metabase\iniciar-metabase.bat` e acessar http://localhost:3000 (Java 17+ já instalado no sistema).
2. **Conectar o Supabase** no Metabase (seção C do Passo 1).
3. **Montar os dashboards** usando o guia BI (queries prontas).
4. **Ativar o relatório com IA** no n8n (importar workflow, configurar OpenAI, testar).

---

## 4. Resumo

- **Java:** Metabase v0.47.8 roda com Java 17, 18, 19 ou 20; não é necessário Java 21.
- **Metabase:** JAR e script prontos; use `iniciar-metabase.bat` para subir.
- **BI:** Documentação e SQL dos 3 dashboards prontos; falta executar no Metabase após subir e conectar.
- **Relatório IA:** Workflow e documentação de prompt prontos; falta importar no n8n e configurar a chave da OpenAI.

Com isso, o planejamento do BI e do relatório com IA está concluído; você pode subir o Metabase com o Java que já tem.
