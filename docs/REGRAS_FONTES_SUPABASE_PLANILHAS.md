# Regras: Supabase vs planilhas (Byla)

Este documento define **quem é a fonte principal** em cada domínio e **como o backend deve combinar** Supabase e planilhas. Segue o plano em `docs/PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md`.

---

## 1. Princípio geral

- **Supabase** = verdade para **fluxo de caixa** (o que entrou e saiu do banco; extrato; saldo).
- **Planilhas** = complemento para **cadastro e operação** (alunos, matrículas, modalidades, pendências), com informações a mais e mais verificadas pela secretária e pelo financeiro.

---

## 2. Por domínio

| Domínio | Fonte principal | Regra para o backend |
|---------|------------------|------------------------|
| **Extrato geral** | Supabase | Não usar planilhas. Dados vêm só do Supabase (views/tabelas de transações). |
| **Saldo, totais por período** | Supabase | Não usar planilhas. Calcular a partir das transações/views do Supabase. |
| **Entradas / saídas (lista e totais)** | Supabase | Não usar planilhas. Front pode continuar chamando Supabase direto. |
| **Alunos** | Planilhas (complemento) | Para lista de alunos e dados cadastrais: priorizar ou enriquecer com dados das planilhas (informações a mais e mais verificadas). Supabase pode ser usado para cruzar com pagamentos se necessário. |
| **Alunos matriculados** | Planilhas (complemento) | Matrículas por atividade/modalidade: usar planilhas como fonte principal para “quem está matriculado”; combinar com Supabase quando for preciso mostrar valor pago ou status no banco. |
| **Modalidades (atividades)** | Planilhas (complemento) | Lista de modalidades/atividades: priorizar ou enriquecer com planilhas. Supabase pode ter tabela de atividades; o backend decide se funde ou se a planilha prevalece onde houver divergência. |
| **Pendências de pagamento** | Planilhas (complemento) | Quem está em aberto / pendente: usar informações das planilhas (mais verificadas). Opcionalmente cruzar com Supabase (conciliação) para mostrar “já caiu no banco” ou “ainda não caiu”. |

---

## 3. Resumo para implementação

- **Rotas que só precisam de extrato, saldo, entradas, visão geral:** front continua chamando **Supabase direto**; backend não precisa expor essas coisas com planilhas.
- **Rotas que precisam de alunos, matriculados, modalidades ou pendências:** backend lê **Supabase + planilhas**, aplica a regra (planilhas prevalecem ou enriquecem nesses domínios) e devolve um único payload (ex.: `GET /api/alunos-completo`, `GET /api/modalidades-completo`, `GET /api/pendencias-completo`).

---

## 4. Manutenção

- Ao mudar qual fonte prevalece em algum domínio, atualizar este arquivo e o módulo de merge no backend.
- Referência: `docs/PLANO_BACKEND_E_PLANILHAS_COMPLEMENTO.md` (seção 4 – Divisão de responsabilidade).
