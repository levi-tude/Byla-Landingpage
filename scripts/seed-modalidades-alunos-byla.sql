-- =============================================================================
-- BYLA - Seed: novas modalidades e alunos (fev/2025)
-- Execute no SQL Editor do Supabase DEPOIS do schema (supabase-schema-cadastros.sql).
-- Datas em DD/MM foram convertidas para 2025-02-DD.
-- "Nome da mesma/o" = nome_pagador igual ao nome do aluno.
-- =============================================================================

-- 1) ATIVIDADES (modalidades) – ON CONFLICT para não duplicar se já existir
INSERT INTO public.atividades (nome)
VALUES
  ('Pilates'),
  ('Contemporânea avançado'),
  ('Dança contemporânea infantil terça e quinta 16:00hs'),
  ('Ballet iniciantes terça e quinta 19:30'),
  ('Ballet intermediário sexta 14:00hs'),
  ('Jazz iniciante terça e quinta'),
  ('Teatro'),
  ('GR')
ON CONFLICT (nome) DO NOTHING;

-- 2) PLANOS – um plano "Mensalidade" por atividade (só insere se ainda não existir)
INSERT INTO public.planos (atividade_id, nome)
SELECT a.id, 'Mensalidade'
FROM public.atividades a
WHERE a.nome IN (
  'Pilates', 'Contemporânea avançado',
  'Dança contemporânea infantil terça e quinta 16:00hs',
  'Ballet iniciantes terça e quinta 19:30',
  'Ballet intermediário sexta 14:00hs',
  'Jazz iniciante terça e quinta', 'Teatro', 'GR'
)
AND NOT EXISTS (
  SELECT 1 FROM public.planos p WHERE p.atividade_id = a.id
);

-- 3) ALUNOS – insere só se o nome ainda não existir
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

-- 4) ALUNO_PLANOS – vínculo aluno + plano (atividade) + valor, data, forma de pagamento e nome do pagador
-- Pilates
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 230.00, '2025-02-05'::date, 'pix', 'Nilza Adelaide da Silva Faria'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Nilza Adelaide da Silva Faria' AND a.nome = 'Pilates'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 340.00, '2025-02-10'::date, 'pix', 'Tatiana Silveira Robadey'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Tatiana Silveira Robadey' AND a.nome = 'Pilates'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

-- Contemporânea avançado
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 100.00, '2025-02-19'::date, 'pix', 'Samila Araújo da Silva'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Samila Araújo da Silva' AND a.nome = 'Contemporânea avançado'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

-- Dança contemporânea infantil terça e quinta 16:00hs
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 80.00, '2025-02-05'::date, 'pix', 'Robson Souza Pitanga'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Maria Flor Villar Pitanga' AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 170.00, '2025-02-05'::date, 'pix', 'Jacyra Lago Ramos'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Mila Ramos' AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 210.00, '2025-02-03'::date, 'pix', 'Humberto Almeida Rais Mercadinho'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Maria Liz Silva Reis' AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 240.00, '2025-02-05'::date, 'débito', 'Giovanna Maria Ferreira Bezerra'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Giovanna Maria Ferreira Bezerra' AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 210.00, '2025-02-03'::date, 'pix', 'Taiane dos Anjos Rabelo'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Aylla Rabelo Souza' AND a.nome = 'Dança contemporânea infantil terça e quinta 16:00hs'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

-- Ballet iniciantes terça e quinta 19:30
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 210.00, '2025-02-03'::date, 'pix', 'Taiane Bastos dos Santos Maciel'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Taiane Bastos dos Santos Maciel' AND a.nome = 'Ballet iniciantes terça e quinta 19:30'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 210.00, '2025-02-03'::date, 'pix', 'Taiane Bastos dos Santos Maciel'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Sofia Bastos' AND a.nome = 'Ballet iniciantes terça e quinta 19:30'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

-- Ballet intermediário sexta 14:00hs
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 80.00, '2025-02-19'::date, 'pix', 'Samile Araújo'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Samile Araújo' AND a.nome = 'Ballet intermediário sexta 14:00hs'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 100.00, '2025-02-04'::date, 'pix', 'Karine Felix Lima'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Karine Felix Lima' AND a.nome = 'Ballet intermediário sexta 14:00hs'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

-- Jazz iniciante terça e quinta
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 180.00, '2025-02-05'::date, 'pix', 'Sara Falcão Gomes Alves'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Sara Falcão Gomes Alves' AND a.nome = 'Jazz iniciante terça e quinta'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 155.00, '2025-02-10'::date, 'pix', 'Ane France Bastos Santana Chaves'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Ana Beatriz Bastos Santana Chaves' AND a.nome = 'Jazz iniciante terça e quinta'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 210.00, '2025-02-10'::date, 'pix', 'Elys Marina dos Santos Andrade'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Lara Falcão Alves Andrade' AND a.nome = 'Jazz iniciante terça e quinta'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

-- Teatro
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 195.00, '2025-02-05'::date, 'pix', 'Wellington Tavares Nóbrega Junior'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Maria Clara Galvão' AND a.nome = 'Teatro'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 195.00, '2025-02-18'::date, 'pix', 'Adriana Silva Nico'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Roberta Nico' AND a.nome = 'Teatro'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 95.00, '2025-02-11'::date, 'pix', 'Cauan Matos'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Cauan Matos' AND a.nome = 'Teatro'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

-- GR
INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 200.00, '2025-02-02'::date, 'crédito', 'Joana Borges Fernandes'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Joana Borges Fernandes' AND a.nome = 'GR'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 210.00, '2025-02-05'::date, 'pix', 'Mirela Schettine Santana'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Melissa de Oliveira Santana' AND a.nome = 'GR'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 240.00, '2025-02-02'::date, 'pix', 'Suzanne Santos Escoredo Fernandes'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Sophia Santos Escoredo Fernandes' AND a.nome = 'GR'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;

INSERT INTO public.aluno_planos (aluno_id, plano_id, valor, data, forma_pagamento, nome_pagador)
SELECT al.id, p.id, 240.00, '2025-02-05'::date, 'pix', 'Tamires Maria Santos Ribeiro'
FROM public.alunos al, public.planos p
JOIN public.atividades a ON p.atividade_id = a.id
WHERE al.nome = 'Melissa Siqueira Ribeiro' AND a.nome = 'GR'
ON CONFLICT (aluno_id, plano_id, data) DO NOTHING;
