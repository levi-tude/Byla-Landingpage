# Plano de melhorias — UX e design (administrativo × secretaria)

Objetivo: alinhar o painel às tarefas reais de quem opera o dia a dia (secretaria) e de quem audita e fecha o mês (admin), com foco em clareza, previsibilidade e menos carga cognitiva — sem sacrificar poder de consulta.

---

## 1. Personas e jornadas

### Secretaria

- **Tarefas típicas:** cadastro e ajuste de alunos, conferência de pagamentos, fluxo operacional (valores, vencimentos, responsáveis), validação diária, atividades.
- **Necessidades:** edição rápida e óbvia (“onde estou editando?”), valores e origens compreensíveis, poucos passos para corrigir um campo, feedback imediato ao salvar.
- **Riscos de UX:** formulários longe da linha editada, colunas financeiras sem legenda, filtros que “somem” contexto.

### Administrativo (admin)

- **Tarefas típicas:** visão geral, conciliação, entradas/saídas, relatórios IA, controle de caixa, calendário financeiro.
- **Necessidades:** rastreabilidade (de onde veio o número), comparar períodos, detectar divergências, exportar ou copiar para análise externa.
- **Riscos de UX:** telas densas sem hierarquia visual, estados de carregamento/erro genéricos, ações destrutivas sem confirmação clara.

---

## 2. Mapa do sistema (telas atuais)

| Rota | Público | Foco de melhoria sugerido |
|------|---------|---------------------------|
| `/` (overview) | Admin | Cards-resumo acionáveis; links diretos para pendências. |
| `/alunos` | Ambos | Paridade com fluxo (campos e rótulos); busca e colunas configuráveis. |
| `/atividades` | Ambos | Filtros por data/unidade; estados vazios orientadores. |
| `/fluxo-caixa` | Ambos | **Valores com origem explícita**; edição contextual (modal mantido; ver §3). |
| `/pagamentos-planilha` | Ambos | Colunas alinhadas ao vocabulário da planilha; drill-down para aluno. |
| `/validacao-pagamentos-diaria` | Ambos | Checklist visual; “o que falta validar hoje?”. |
| `/conciliacao` | Admin | Diff visual banco × planilha; resumo de itens não casados. |
| `/entradas`, `/saidas` | Admin | Agrupamentos e totais por categoria; período sempre visível. |
| `/relatorios-ia` | Admin | Histórico de prompts; cópia/export; aviso de dados usados. |
| `/controle-caixa` | Admin | Linha do tempo ou grade mensal consistente com fluxo. |
| `/calendario-financeiro` | Admin | Legendas e tooltips de eventos; zoom sem perder mês. |
| `/login`, `/redefinir-senha` | Ambos | Mensagens de erro específicas; recuperação de senha clara. |

---

## 3. Fluxo de caixa operacional (prioridade alta — secretaria)

**Já alinhado com o pedido anterior**

- Modal de edição centralizado com contexto (aba · modalidade · linha).
- Destaque da linha em edição.
- Valor exibido com indicação de origem (cadastro / planilha bruta / último pagamento).

**Próximas melhorias (sem voltar ao “mini-scroll” interno que confundiu)**

- **Legenda fixa e curta** no topo da seção de alunos: “◆ = valor calculado ou lido da planilha; clique para ver origem.”
- **Após salvar:** toast “Salvo — valor de referência atualizado” e atualização da linha sem recarregar a página inteira.
- **Opcional futuro:** edição inline em célula (duplo clique) *só* para 2–3 campos críticos (valor, vencimento), com mesma API do modal — evita dois modelos mentais.

---

## 4. Design system e consistência

- **Tipografia:** um único scale (ex.: título de página, subtítulo de seção, corpo de tabela, legenda).
- **Cores semânticas:** sucesso / aviso / erro / informação reutilizados em todas as telas (ex.: pendência = âmbar, erro = vermelho calmo).
- **Botões:** primário (ação principal), secundário (cancelar/fechar), texto (ações destrutivas com confirmação).
- **Tabelas:** rolagem **da página** (como antes), não “caixas” com altura máxima arbitrária — a menos que a secretaria peça explicitamente painel tipo Excel.
- **Filtros:** bloco único “Filtros” com rótulos; chips mostrando filtros ativos + “Limpar tudo”.

---

## 5. Padrões transversais

| Área | Melhoria |
|------|----------|
| **Carregamento** | Skeleton nas tabelas; evitar página em branco com só “Carregando…”. |
| **Erro de API** | Mensagem humana + código técnico colapsável; botão “Tentar de novo”. |
| **Estado vazio** | Uma frase do que fazer (“Nenhum aluno nesta aba — ajuste o filtro ou cadastre”). |
| **Confirmação** | Excluir aluno/pagamento: modal de confirmação com nome/resumo. |
| **Acessibilidade** | Foco visível, `aria-label` em ícones, contraste WCAG AA nas tabelas. |
| **Mobile** | Sidebar colapsável; tabelas com scroll horizontal explícito (hint visual). |

---

## 6. Admin: foco em auditoria

- **Overview:** widget “Pendências do mês” com link para a tela certa.
- **Conciliação / entradas / saídas:** totais no rodapé da tabela; export CSV onde fizer sentido.
- **Relatórios IA:** indicar data de corte dos dados e versão do modelo (transparência).

---

## 7. Secretaria: foco em operação

- **Home:** secretaria já cai em `/alunos` — considerar um **mini-dashboard** (ex.: “validações pendentes hoje”, “últimos pagamentos”) opcional na mesma página ou banner.
- **Alunos × Fluxo:** mesmos nomes de campo nos formulários (evitar “valor referência” num lugar e “mensalidade” noutro sem explicação).
- **Atalhos:** tecla `?` abre lista de atalhos (quando houver).

---

## 8. Fases sugeridas (implementação)

1. **Fase A — Clareza imediata (baixo risco)**  
   Legendas, toasts de sucesso/erro, estados vazios, confirmações de exclusão, alinhamento de labels entre Alunos e Fluxo.

2. **Fase B — Densidade administrativa**  
   Totais, export, melhor hierarquia em conciliação e saídas.

3. **Fase C — Experiência “planilha” opcional**  
   Edição inline pilotada em 1–2 campos; avaliar com a secretaria antes de expandir.

4. **Fase D — Polish visual**  
   Unificar espaçamentos, componentes de filtro, dark mode só se houver demanda real.

---

## 9. Como validar com usuários

- **Teste de 15 minutos** com 1 secretaria: tarefa “corrigir valor e vencimento de um aluno na segunda página da lista”.
- **Teste de 15 minutos** com 1 admin: tarefa “encontrar divergência entre entrada e planilha no mês X”.
- Critério de sucesso: concluir sem perguntar “onde clico?” ou “de onde veio esse número?”.

---

*Documento vivo — atualizar conforme telas novas forem adicionadas ou perfis RBAC mudarem.*
