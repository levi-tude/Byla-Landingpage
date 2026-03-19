-- =============================================================================
-- BYLA - Exemplo de seeds para tabela despesas
-- 
-- ATENÇÃO:
-- - Esses INSERTs são apenas EXEMPLOS baseados na estrutura atual (categorias, funcionários).
-- - Ajuste datas, valores e descrições antes de rodar no Supabase.
-- - Rode no SQL Editor do Supabase: app.supabase.com -> seu projeto -> SQL Editor.
-- =============================================================================

insert into public.despesas (data, valor, descricao, categoria, subcategoria, centro_custo, funcionario, origem)
values
  -- Salários / pró-labore (ajuste valores reais)
  ('2026-03-05', 3500.00, 'Salário José Nilson', 'Salários', 'Salário mensal', 'Administração', 'José Nilson', 'manual'),
  ('2026-03-05', 2800.00, 'Salário Andréa', 'Salários', 'Salário mensal', 'Administração', 'Andréa', 'manual'),
  ('2026-03-05', 2500.00, 'Salário Maria Eduarda', 'Salários', 'Salário mensal', 'Comunicação', 'Maria Eduarda', 'manual'),
  ('2026-03-05', 3000.00, 'Pró-labore Samuel', 'Salários', 'Pró-labore', 'Financeiro', 'Samuel', 'manual'),
  ('2026-03-05', 2200.00, 'Serviços de TI Levi', 'TI', 'Serviços', 'TI', 'Levi', 'manual'),
  ('2026-03-05', 4000.00, 'Pró-labore Luciana', 'Salários', 'Pró-labore', 'Diretoria', 'Luciana', 'manual'),

  -- Gastos fixos (valores aproximados, ajuste conforme planilha)
  ('2026-03-04', 220.00, 'Energia elétrica', 'Gastos Fixos', 'Energia', 'Operações', null, 'manual'),
  ('2026-03-04', 150.00, 'Água', 'Gastos Fixos', 'Água', 'Operações', null, 'manual'),
  ('2026-03-04', 200.00, 'Internet / Net', 'Gastos Fixos', 'Internet', 'Operações', null, 'manual'),
  ('2026-03-04', 160.00, 'Materiais de limpeza', 'Gastos Fixos', 'Materiais', 'Operações', null, 'manual'),

  -- Aluguel / Coworking
  ('2026-03-01', 4000.00, 'Aluguel sala principal', 'Aluguel', 'Sala', 'Operações', null, 'manual'),
  ('2026-03-01', 1223.40, 'Aluguel coworking', 'Aluguel', 'Coworking', 'Operações', null, 'manual'),

  -- Impostos / contabilidade (exemplo)
  ('2026-03-10', 735.96, 'IPTU', 'Impostos', 'IPTU', 'Financeiro', null, 'manual'),
  ('2026-03-10', 750.00, 'Contadora', 'Impostos', 'Contabilidade', 'Financeiro', null, 'manual');

