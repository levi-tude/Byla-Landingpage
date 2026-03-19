-- =============================================================================
-- BYLA - Seed: modalidades e alunos (fev/2026)
-- Execute no SQL Editor do Supabase. Requer tabelas atividades, planos, alunos, aluno_planos.
-- Schema do aluno_planos no DB: valor, data_referencia, forma_pagamento, nome_pagador_pix.
-- Use WHERE NOT EXISTS para evitar duplicatas ao reexecutar.
-- =============================================================================

-- 1) ATIVIDADES (modalidades)
INSERT INTO public.atividades (nome)
SELECT x FROM (VALUES
  ('Pilates'),
  ('Contemporânea avançado'),
  ('Dança contemporânea infantil terça e quinta 16:00hs'),
  ('Ballet iniciantes terça e quinta 19:30'),
  ('Ballet intermediário sexta 14:00hs'),
  ('Jazz iniciante terça e quinta'),
  ('Teatro'),
  ('GR')
) AS t(x)
WHERE NOT EXISTS (SELECT 1 FROM public.atividades a WHERE a.nome = t.x);

-- 2) PLANOS – um "Mensalidade" por atividade (valor_mensal 0; valor real em aluno_planos.valor)
INSERT INTO public.planos (atividade_id, nome, valor_mensal)
SELECT a.id, 'Mensalidade', 0
FROM public.atividades a
WHERE a.nome IN (
  'Pilates', 'Contemporânea avançado',
  'Dança contemporânea infantil terça e quinta 16:00hs',
  'Ballet iniciantes terça e quinta 19:30',
  'Ballet intermediário sexta 14:00hs',
  'Jazz iniciante terça e quinta', 'Teatro', 'GR'
)
AND NOT EXISTS (SELECT 1 FROM public.planos p WHERE p.atividade_id = a.id);

-- 3) ALUNOS
INSERT INTO public.alunos (nome)
SELECT n FROM (VALUES
  ('Nilza Adelaide da Silva Faria'),
  ('Tatiana Silveira Robadey'),
  ('Samila Araújo da Silva'),
  ('Maria Flor Villar Pitanga'),
  ('Mila Ramos'),
  ('Maria Liz Silva Reis'),
  ('Giovanna Maria Ferreira Bezerra'),
  ('Aylla Rabelo Souza'),
  ('Taiane Bastos dos Santos Maciel'),
  ('Sofia Bastos'),
  ('Samile Araújo'),
  ('Karine Felix Lima'),
  ('Sara Falcão Gomes Alves'),
  ('Ana Beatriz Bastos Santana Chaves'),
  ('Lara Falcão Alves Andrade'),
  ('Maria Clara Galvão'),
  ('Roberta Nico'),
  ('Cauan Matos'),
  ('Joana Borges Fernandes'),
  ('Melissa de Oliveira Santana'),
  ('Sophia Santos Escoredo Fernandes'),
  ('Melissa Siqueira Ribeiro')
) AS t(n)
WHERE NOT EXISTS (SELECT 1 FROM public.alunos a WHERE a.nome = t.n);

-- 4) ALUNO_PLANOS (valor, data_referencia, forma_pagamento, nome_pagador_pix)
-- Pilates
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Pilates' LIMIT 1), 230.00, '2026-02-05'::date, 'pix', 'Nilza Adelaide da Silva Faria'
FROM public.alunos al WHERE al.nome = 'Nilza Adelaide da Silva Faria'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Pilates' AND ap.data_referencia = '2026-02-05');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Pilates' LIMIT 1), 340.00, '2026-02-10'::date, 'pix', 'Tatiana Silveira Robadey'
FROM public.alunos al WHERE al.nome = 'Tatiana Silveira Robadey'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Pilates' AND ap.data_referencia = '2026-02-10');

-- Contemporânea avançado
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Contemporânea avançado' LIMIT 1), 100.00, '2026-02-19'::date, 'pix', 'Samila Araújo da Silva'
FROM public.alunos al WHERE al.nome = 'Samila Araújo da Silva'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Contemporânea avançado' AND ap.data_referencia = '2026-02-19');

-- Dança contemporânea infantil
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' LIMIT 1), 80.00, '2026-02-05'::date, 'pix', 'Robson Souza Pitanga'
FROM public.alunos al WHERE al.nome = 'Maria Flor Villar Pitanga'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' AND ap.data_referencia = '2026-02-05');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' LIMIT 1), 170.00, '2026-02-05'::date, 'pix', 'Jacyra Lago Ramos'
FROM public.alunos al WHERE al.nome = 'Mila Ramos'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' AND ap.data_referencia = '2026-02-05');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' LIMIT 1), 210.00, '2026-02-03'::date, 'pix', 'Humberto Almeida Rais Mercadinho'
FROM public.alunos al WHERE al.nome = 'Maria Liz Silva Reis'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' AND ap.data_referencia = '2026-02-03');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' LIMIT 1), 240.00, '2026-02-05'::date, 'débito', 'Giovanna Maria Ferreira Bezerra'
FROM public.alunos al WHERE al.nome = 'Giovanna Maria Ferreira Bezerra'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' AND ap.data_referencia = '2026-02-05');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' LIMIT 1), 210.00, '2026-02-03'::date, 'pix', 'Taiane dos Anjos Rabelo'
FROM public.alunos al WHERE al.nome = 'Aylla Rabelo Souza'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs' AND ap.data_referencia = '2026-02-03');

-- Ballet iniciantes
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Ballet iniciantes terça e quinta 19:30' LIMIT 1), 210.00, '2026-02-03'::date, 'pix', 'Taiane Bastos dos Santos Maciel'
FROM public.alunos al WHERE al.nome = 'Taiane Bastos dos Santos Maciel'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Ballet iniciantes terça e quinta 19:30' AND ap.data_referencia = '2026-02-03');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Ballet iniciantes terça e quinta 19:30' LIMIT 1), 210.00, '2026-02-03'::date, 'pix', 'Taiane Bastos dos Santos Maciel'
FROM public.alunos al WHERE al.nome = 'Sofia Bastos'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Ballet iniciantes terça e quinta 19:30' AND ap.data_referencia = '2026-02-03');

-- Ballet intermediário
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Ballet intermediário sexta 14:00hs' LIMIT 1), 80.00, '2026-02-19'::date, 'pix', 'Samile Araújo'
FROM public.alunos al WHERE al.nome = 'Samile Araújo'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Ballet intermediário sexta 14:00hs' AND ap.data_referencia = '2026-02-19');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Ballet intermediário sexta 14:00hs' LIMIT 1), 100.00, '2026-02-04'::date, 'pix', 'Karine Felix Lima'
FROM public.alunos al WHERE al.nome = 'Karine Felix Lima'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Ballet intermediário sexta 14:00hs' AND ap.data_referencia = '2026-02-04');

-- Jazz iniciante
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Jazz iniciante terça e quinta' LIMIT 1), 180.00, '2026-02-05'::date, 'pix', 'Sara Falcão Gomes Alves'
FROM public.alunos al WHERE al.nome = 'Sara Falcão Gomes Alves'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Jazz iniciante terça e quinta' AND ap.data_referencia = '2026-02-05');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Jazz iniciante terça e quinta' LIMIT 1), 155.00, '2026-02-10'::date, 'pix', 'Ane France Bastos Santana Chaves'
FROM public.alunos al WHERE al.nome = 'Ana Beatriz Bastos Santana Chaves'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Jazz iniciante terça e quinta' AND ap.data_referencia = '2026-02-10');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Jazz iniciante terça e quinta' LIMIT 1), 210.00, '2026-02-10'::date, 'pix', 'Elys Marina dos Santos Andrade'
FROM public.alunos al WHERE al.nome = 'Lara Falcão Alves Andrade'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Jazz iniciante terça e quinta' AND ap.data_referencia = '2026-02-10');

-- Teatro
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Teatro' LIMIT 1), 195.00, '2026-02-05'::date, 'pix', 'Wellington Tavares Nóbrega Junior'
FROM public.alunos al WHERE al.nome = 'Maria Clara Galvão'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Teatro' AND ap.data_referencia = '2026-02-05');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Teatro' LIMIT 1), 195.00, '2026-02-18'::date, 'pix', 'Adriana Silva Nico'
FROM public.alunos al WHERE al.nome = 'Roberta Nico'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Teatro' AND ap.data_referencia = '2026-02-18');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'Teatro' LIMIT 1), 95.00, '2026-02-11'::date, 'pix', 'Cauan Matos'
FROM public.alunos al WHERE al.nome = 'Cauan Matos'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'Teatro' AND ap.data_referencia = '2026-02-11');

-- GR
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'GR' LIMIT 1), 200.00, '2026-02-02'::date, 'crédito', 'Joana Borges Fernandes'
FROM public.alunos al WHERE al.nome = 'Joana Borges Fernandes'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'GR' AND ap.data_referencia = '2026-02-02');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'GR' LIMIT 1), 210.00, '2026-02-05'::date, 'pix', 'Mirela Schettine Santana'
FROM public.alunos al WHERE al.nome = 'Melissa de Oliveira Santana'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'GR' AND ap.data_referencia = '2026-02-05');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'GR' LIMIT 1), 240.00, '2026-02-02'::date, 'pix', 'Suzanne Santos Escoredo Fernandes'
FROM public.alunos al WHERE al.nome = 'Sophia Santos Escoredo Fernandes'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'GR' AND ap.data_referencia = '2026-02-02');

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data_referencia, forma_pagamento, nome_pagador_pix)
SELECT al.id, (SELECT p.id FROM public.planos p JOIN public.atividades a ON p.atividade_id = a.id WHERE a.nome = 'GR' LIMIT 1), 240.00, '2026-02-05'::date, 'pix', 'Tamires Maria Santos Ribeiro'
FROM public.alunos al WHERE al.nome = 'Melissa Siqueira Ribeiro'
AND NOT EXISTS (SELECT 1 FROM public.aluno_planos ap JOIN public.planos p ON ap.plano_id = p.id JOIN public.atividades a ON p.atividade_id = a.id WHERE ap.aluno_id = al.id AND a.nome = 'GR' AND ap.data_referencia = '2026-02-05');
