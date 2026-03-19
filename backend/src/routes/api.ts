import { Router, Request, Response } from 'express';
import { getSupabase } from '../services/supabaseClient.js';
import { readSheetRange, readSheetValues, readSheetValuesBySheetName, listSheetNames } from '../services/sheetsService.js';
import { parsearAbaEmBlocos, getLimiteAtivosParaAba } from '../logic/parsePlanilhaPorBlocos.js';
import { mergePriorizarPlanilha } from '../logic/merge.js';
import { config } from '../config.js';
import { SupabaseAlunosAdapter } from '../adapters/SupabaseAlunosAdapter.js';
import { PlanilhaAlunosAdapter } from '../adapters/PlanilhaAlunosAdapter.js';
import { PlanilhaRangeAdapter } from '../adapters/PlanilhaRangeAdapter.js';
import { SupabaseAtividadesAdapter } from '../adapters/SupabaseAtividadesAdapter.js';
import { SupabasePendenciasAdapter } from '../adapters/SupabasePendenciasAdapter.js';
import { PlanilhaFluxoAdapter } from '../adapters/PlanilhaFluxoAdapter.js';
import { CacheFluxoPlanilhaAdapter } from '../adapters/CacheFluxoPlanilhaAdapter.js';
import { GetAlunosCompletoUseCase } from '../useCases/GetAlunosCompletoUseCase.js';
import { GetModalidadesCompletoUseCase } from '../useCases/GetModalidadesCompletoUseCase.js';
import { GetPendenciasCompletoUseCase } from '../useCases/GetPendenciasCompletoUseCase.js';
import { GetFluxoCompletoUseCase } from '../useCases/GetFluxoCompletoUseCase.js';

const router = Router();

const planilhaRange = new PlanilhaRangeAdapter();
const alunosUseCase = new GetAlunosCompletoUseCase(
  new SupabaseAlunosAdapter(),
  new PlanilhaAlunosAdapter()
);
const modalidadesUseCase = new GetModalidadesCompletoUseCase(
  new SupabaseAtividadesAdapter(),
  planilhaRange
);
const pendenciasUseCase = new GetPendenciasCompletoUseCase(
  new SupabasePendenciasAdapter(),
  planilhaRange
);
const fluxoUseCase = new GetFluxoCompletoUseCase(
  new CacheFluxoPlanilhaAdapter(new PlanilhaFluxoAdapter())
);

/** GET /api/dados-completos – Fase 1: lê Supabase (atividades) + uma planilha e retorna JSON combinado. */
router.get('/dados-completos', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabase();
    let supabaseData: unknown[] = [];
    if (supabase) {
      const { data, error } = await supabase.from('atividades').select('id, nome').order('nome');
      if (!error) supabaseData = data ?? [];
    }
    const range = process.env.GOOGLE_SHEETS_RANGE ?? 'Página1!A:Z';
    const { rows: planilhaRows, error: sheetError } = await readSheetRange(range);
    const regra = 'dados-completos: Supabase (atividades) + planilha (complemento). Regras em docs/REGRAS_FONTES_SUPABASE_PLANILHAS.md';
    const merged = mergePriorizarPlanilha(planilhaRows, supabaseData as Record<string, unknown>[], regra);
    res.json({
      supabase: supabaseData,
      planilha: planilhaRows,
      combinado: merged.combinado,
      regra_usada: merged.regra_usada,
      origem: merged.origem,
      sheet_error: sheetError ?? undefined,
    });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

/** Range A1: nome da aba com aspas se tiver espaço (ex.: 'PILATES MARINA'!A:Z). */
function rangeAba(nomeAba: string, cols: string): string {
  const precisaAspas = /[\s']/.test(nomeAba);
  const aba = precisaAspas ? `'${String(nomeAba).replace(/'/g, "''")}'` : nomeAba;
  return `${aba}!${cols}`;
}

/** GET /api/planilha-fluxo-byla/abas – Lista nomes das abas da planilha FLUXO DE CAIXA BYLA (para análise/config). */
router.get('/planilha-fluxo-byla/abas', async (_req: Request, res: Response) => {
  try {
    const id = config.sheets.spreadsheetId;
    if (!id) return res.status(400).json({ error: 'Planilha FLUXO BYLA não configurada' });
    const { names, error } = await listSheetNames(id);
    if (error) return res.status(502).json({ error, abas: [] });
    res.json({ abas: names });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** GET /api/planilha-fluxo-byla/verificar-aba?aba=PILATES%20MARINA – Verifica leitura de uma aba (contagem, colunas, amostra). */
router.get('/planilha-fluxo-byla/verificar-aba', async (req: Request, res: Response) => {
  try {
    const id = config.sheets.spreadsheetId;
    const nomeAba = (req.query.aba as string)?.trim();
    if (!id) return res.status(400).json({ error: 'Planilha FLUXO BYLA não configurada' });
    if (!nomeAba) return res.status(400).json({ error: 'Query ?aba= obrigatória (ex.: aba=PILATES%20MARINA)' });

    let range = rangeAba(nomeAba, 'A:Z');
    let result = await readSheetValues(range, id);
    if (result.error) {
      result = await readSheetValuesBySheetName(nomeAba, id);
    }
    const { values, error } = result;
    if (error) return res.status(502).json({ aba: nomeAba, error, rowCount: 0, ativos: 0, inativos: 0, colunas: [], amostra: [] });

    const limite = getLimiteAtivosParaAba(nomeAba);
    if (limite != null) {
      const parseadas = parsearAbaEmBlocos(values, nomeAba, limite);
      const rows = parseadas.map((p) => p.row);
      const ativos = parseadas.filter((p) => p.ativo).length;
      const inativos = parseadas.filter((p) => !p.ativo).length;
      const colunas = rows.length > 0 ? Object.keys(rows[0]).filter((k) => !k.startsWith('_')) : [];
      const amostra = rows.slice(0, 10);
      return res.json({
        aba: nomeAba,
        rowCount: rows.length,
        ativos,
        inativos,
        linhaLimiteAtivos: limite,
        colunas,
        amostra,
      });
    }

    if (values.length < 2) return res.json({ aba: nomeAba, rowCount: 0, colunas: [], amostra: [] });
    const headers = (values[0] ?? []).map((h) => (h ?? '').trim() || 'col');
    const rowCount = values.length - 1;
    const amostra = values.slice(1, 6).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (row[i] ?? '').toString(); });
      return obj;
    });
    res.json({ aba: nomeAba, rowCount, colunas: headers, amostra });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** GET /api/alunos-completo – Caso de uso: alunos (planilha prevalece; todas as abas se configurado). */
router.get('/alunos-completo', async (_req: Request, res: Response) => {
  try {
    const range = process.env.GOOGLE_SHEETS_ALUNOS_RANGE ?? process.env.GOOGLE_SHEETS_RANGE ?? 'ATENDIMENTOS!A:Z';
    const result = await alunosUseCase.execute(range, config.sheets.alunosTodasAbas);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

/** GET /api/modalidades-completo – Caso de uso: modalidades (planilha prevalece). */
router.get('/modalidades-completo', async (_req: Request, res: Response) => {
  try {
    const range = process.env.GOOGLE_SHEETS_MODALIDADES_RANGE ?? process.env.GOOGLE_SHEETS_RANGE ?? 'Modalidades!A:Z';
    const result = await modalidadesUseCase.execute(range);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

/** GET /api/pendencias-completo – Caso de uso: pendências (planilha prevalece). */
router.get('/pendencias-completo', async (_req: Request, res: Response) => {
  try {
    const range = process.env.GOOGLE_SHEETS_PENDENCIAS_RANGE ?? process.env.GOOGLE_SHEETS_RANGE ?? 'Pendencias!A:Z';
    const result = await pendenciasUseCase.execute(range);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

/** GET /api/fluxo-completo – Caso de uso: totais planilha CONTROLE DE CAIXA (com cache TTL). ?mes=3&ano=2026 */
router.get('/fluxo-completo', async (req: Request, res: Response) => {
  try {
    const mes = req.query.mes != null ? Number(req.query.mes) : undefined;
    const ano = req.query.ano != null ? Number(req.query.ano) : undefined;
    const result = await fluxoUseCase.execute(mes, ano);
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

/** GET /api/fontes – Status das fontes de dados (Supabase + duas planilhas). Garante harmonia e visibilidade. */
router.get('/fontes', async (_req: Request, res: Response) => {
  try {
    const idPlanilha1 = config.sheets.spreadsheetId;
    const idPlanilha2 = config.sheets.fluxoSpreadsheetId;
    const rangePlanilha1 = process.env.GOOGLE_SHEETS_ALUNOS_RANGE ?? 'ATENDIMENTOS!A1';
    const rangePlanilha2 = config.sheets.fluxoRange?.split('!')[0] ? `${config.sheets.fluxoRange.split('!')[0]}!A1` : 'MARÇO 26!A1';

    let supabaseOk = false;
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('alunos').select('id').limit(1);
      supabaseOk = !error;
    }

    let planilha1Ok = false;
    let planilha1Error: string | undefined;
    if (idPlanilha1) {
      const r = await readSheetRange(rangePlanilha1, idPlanilha1);
      planilha1Ok = !r.error;
      planilha1Error = r.error;
    }

    let planilha2Ok = false;
    let planilha2Error: string | undefined;
    if (idPlanilha2) {
      const r = await readSheetValues(`${rangePlanilha2}`, idPlanilha2);
      planilha2Ok = !r.error;
      planilha2Error = r.error;
    }

    res.json({
      supabase: {
        configurado: !!supabase,
        ok: supabaseOk,
        papel: 'Financeiro oficial (extrato, saldo) + fallback cadastro',
      },
      planilha1: {
        id: idPlanilha1 || null,
        nome: 'FLUXO DE CAIXA BYLA',
        configurado: !!idPlanilha1,
        ok: planilha1Ok,
        erro: planilha1Error,
        papel: 'Alunos, modalidades, pendências (aba ATENDIMENTOS e outras)',
      },
      planilha2: {
        id: idPlanilha2 || null,
        nome: 'CONTROLE DE CAIXA',
        configurado: !!idPlanilha2,
        ok: planilha2Ok,
        erro: planilha2Error,
        papel: 'Totais do mês (Entrada, Saída, Lucro por aba)',
      },
      harmonia: 'Todas as fontes usadas conforme docs/REGRAS_FONTES_SUPABASE_PLANILHAS.md e docs/BOUNDED_CONTEXTS_BYLA.md',
    });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
    });
  }
});

/** GET /api/transacoes?mes=3&ano=2026&tipo=entrada|saida – Lista transações do mês (Supabase) para detalhes na visão geral. */
router.get('/transacoes', async (req: Request, res: Response) => {
  try {
    const mes = parseInt(String(req.query.mes ?? ''), 10);
    const ano = parseInt(String(req.query.ano ?? ''), 10);
    const tipo = (req.query.tipo as string)?.toLowerCase();
    if (!mes || mes < 1 || mes > 12 || !ano || ano < 2000) {
      return res.status(400).json({ error: 'Parâmetros mes (1-12) e ano obrigatórios.', itens: [] });
    }
    if (tipo !== 'entrada' && tipo !== 'saida') {
      return res.status(400).json({ error: 'Parâmetro tipo deve ser "entrada" ou "saida".', itens: [] });
    }
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'Supabase não configurado.', itens: [] });

    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('transacoes')
      .select('id, data, pessoa, valor, descricao, tipo')
      .gte('data', inicio)
      .lte('data', fim)
      .order('data', { ascending: false })
      .order('id', { ascending: false })
      .limit(2000);

    if (error) return res.status(502).json({ error: error.message, itens: [] });

    const todas = (data ?? []) as { id: string; data: string; pessoa: string; valor: number; descricao: string | null; tipo: string }[];

    const idsParaIgnorar = new Set<string>();

    const externosPorData = new Map<string, { id: string; valor: number; usado: boolean }[]>();
    for (const r of todas) {
      const pessoa = (r.pessoa ?? '').toLowerCase().trim();
      const descricao = (r.descricao ?? '').toLowerCase().trim();
      const isEa = pessoa.startsWith('ea ') || descricao.startsWith('ea ');
      const isBlead = pessoa.startsWith('blead ad tech') || descricao.includes('blead ad tech');
      if (r.tipo === 'entrada' && (isEa || isBlead)) {
        const arr = externosPorData.get(r.data) ?? [];
        arr.push({ id: r.id, valor: Number(r.valor || 0), usado: false });
        externosPorData.set(r.data, arr);
        idsParaIgnorar.add(r.id); // sempre ignorar entradas EA/Blead
      }
    }

    const TOLERANCIA = 300; // diferença máxima aceitável entre valor de entrada externa e saída para Samuel

    for (const r of todas) {
      const pessoa = (r.pessoa ?? '').toLowerCase().trim();
      if (r.tipo !== 'saida') continue;
      if (!pessoa.startsWith('samuel davi tude silva')) continue;
      const arr = externosPorData.get(r.data);
      if (!arr || arr.length === 0) continue;
      const valorSaida = Number(r.valor || 0);
      for (const ext of arr) {
        if (ext.usado) continue;
        if (Math.abs(ext.valor - valorSaida) <= TOLERANCIA) {
          ext.usado = true;
          idsParaIgnorar.add(r.id);
          break;
        }
      }
    }

    const filtradas = todas
      .filter((row) => row.tipo === tipo && !idsParaIgnorar.has(row.id))
      .slice(0, 500);

    res.json({ itens: filtradas, mes, ano, tipo });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
      itens: [],
    });
  }
});

/** GET /api/despesas?mes=3&ano=2026 – Lista despesas (tabela despesas) e resumo por funcionário/categoria para o mês. */
router.get('/despesas', async (req: Request, res: Response) => {
  try {
    const mes = parseInt(String(req.query.mes ?? ''), 10);
    const ano = parseInt(String(req.query.ano ?? ''), 10);
    if (!mes || mes < 1 || mes > 12 || !ano || ano < 2000) {
      return res.status(400).json({ error: 'Parâmetros mes (1-12) e ano obrigatórios.', itens: [], resumo: {} });
    }
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'Supabase não configurado.', itens: [], resumo: {} });

    const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('despesas')
      .select('id, data, valor, descricao, categoria, subcategoria, centro_custo, funcionario, origem')
      .gte('data', inicio)
      .lte('data', fim)
      .order('data', { ascending: false })
      .order('id', { ascending: false });

    if (error) return res.status(502).json({ error: error.message, itens: [], resumo: {} });

    const itens = (data ?? []) as {
      id: string;
      data: string;
      valor: number;
      descricao: string;
      categoria: string;
      subcategoria: string | null;
      centro_custo: string | null;
      funcionario: string | null;
      origem: string;
    }[];

    const totalGeral = itens.reduce((acc, d) => acc + Number(d.valor || 0), 0);

    const resumoPorFuncionario: { funcionario: string; total: number; qtd: number }[] = [];
    const mapFunc = new Map<string, { total: number; qtd: number }>();
    for (const d of itens) {
      const nome = (d.funcionario ?? '').trim() || 'Sem funcionário';
      const entry = mapFunc.get(nome) ?? { total: 0, qtd: 0 };
      entry.total += Number(d.valor || 0);
      entry.qtd += 1;
      mapFunc.set(nome, entry);
    }
    for (const [funcionario, v] of mapFunc) {
      resumoPorFuncionario.push({ funcionario, total: v.total, qtd: v.qtd });
    }
    resumoPorFuncionario.sort((a, b) => b.total - a.total);

    const resumoPorCategoria: { categoria: string; total: number; qtd: number }[] = [];
    const mapCat = new Map<string, { total: number; qtd: number }>();
    for (const d of itens) {
      const cat = (d.categoria ?? '').trim() || 'Sem categoria';
      const entry = mapCat.get(cat) ?? { total: 0, qtd: 0 };
      entry.total += Number(d.valor || 0);
      entry.qtd += 1;
      mapCat.set(cat, entry);
    }
    for (const [categoria, v] of mapCat) {
      resumoPorCategoria.push({ categoria, total: v.total, qtd: v.qtd });
    }
    resumoPorCategoria.sort((a, b) => b.total - a.total);

    res.json({
      itens,
      resumo: {
        total_geral: totalGeral,
        por_funcionario: resumoPorFuncionario,
        por_categoria: resumoPorCategoria,
      },
      mes,
      ano,
    });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
      itens: [],
      resumo: {},
    });
  }
});

// --- Relatórios (dados estruturados para IA) ---
const MESES_NOMES: Record<number, string> = {
  1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril', 5: 'Maio', 6: 'Junho',
  7: 'Julho', 8: 'Agosto', 9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro',
};

interface ResumoMensalRow {
  ano: number;
  mes: number;
  total_entradas: number;
  total_saidas: number;
  saldo_mes: number;
  qtd_entradas?: number;
  qtd_saidas?: number;
}

/** Busca resumo oficial por mês(s) no Supabase (v_resumo_mensal_oficial). */
async function getResumoMensalSupabase(mesAnos: { mes: number; ano: number }[]): Promise<ResumoMensalRow[]> {
  const supabase = getSupabase();
  if (!supabase || mesAnos.length === 0) return [];
  const orFilters = mesAnos.map(({ mes, ano }) => `and(mes.eq.${mes},ano.eq.${ano})`).join(',');
  const { data, error } = await supabase
    .from('v_resumo_mensal_oficial')
    .select('ano, mes, total_entradas, total_saidas, saldo_mes, qtd_entradas, qtd_saidas')
    .or(orFilters);

  if (error) return [];
  return (data ?? []) as ResumoMensalRow[];
}

/** Retorna (mes, ano) do mês anterior. */
function mesAnterior(mes: number, ano: number): { mes: number; ano: number } {
  if (mes === 1) return { mes: 12, ano: ano - 1 };
  return { mes: mes - 1, ano };
}

/** Agrupa linhas da planilha por bloco (entradas vs saídas) usando cabeçalhos. */
function extrairBlocosPlanilha(porColuna: { label: string; valor: string; valorNum?: number }[][] | undefined): {
  entradas: { label: string; valor: number }[];
  saidas: { nome: string; total: number }[];
  gastosFixosItens: { label: string; valor: number }[];
} {
  const entradas: { label: string; valor: number }[] = [];
  const saidasMap = new Map<string, number>();
  const gastosFixosItens: { label: string; valor: number }[] = [];
  if (!porColuna || !Array.isArray(porColuna)) return { entradas, saidas: [], gastosFixosItens };

  const isEntrada = (l: string) => {
    const u = l.toUpperCase();
    return (u.includes('ENTRADA') && !u.includes('SAÍDA') && !u.includes('SAIDA')) || u.includes('TOTAL ENTRADAS');
  };
  const isSaida = (l: string) => {
    const u = l.toUpperCase();
    return u.includes('SAÍDA') || u.includes('SAIDA') || u.includes('TOTAL SAÍDAS') || u.includes('GASTOS FIXOS') || u.includes('ALUGUEL');
  };
  const isTotalGeral = (l: string) => {
    const u = l.toUpperCase();
    return u.includes('ENTRADA TOTAL') || u.includes('SAÍDA TOTAL') || u.includes('SAIDA TOTAL') || u.includes('LUCRO TOTAL');
  };

  for (const col of porColuna) {
    if (!Array.isArray(col)) continue;
    let blocoAtual: 'entrada' | 'saida' | null = null;
    let nomeBlocoSaida = '';

    for (const item of col) {
      const label = (item.label ?? '').trim();
      const valor = item.valorNum ?? 0;
      if (!label) continue;
      const u = label.toUpperCase();
      if (isTotalGeral(u)) continue;
      if (valor < 0) continue;

      if (isEntrada(u)) {
        blocoAtual = 'entrada';
        if (valor > 0) entradas.push({ label, valor });
      } else if (isSaida(u)) {
        blocoAtual = 'saida';
        if (u.includes('GASTOS FIXOS')) nomeBlocoSaida = 'Gastos Fixos';
        else if (u.includes('ALUGUEL')) nomeBlocoSaida = 'Saídas Aluguel';
        else if (u.includes('TOTAL') && u.includes('SAÍDAS')) nomeBlocoSaida = 'Total Saídas (Parceiros)';
        else nomeBlocoSaida = nomeBlocoSaida || label;
        if (valor > 0) {
          const cur = saidasMap.get(nomeBlocoSaida) ?? 0;
          saidasMap.set(nomeBlocoSaida, cur + valor);
        }
      } else if (blocoAtual === 'entrada' && valor > 0) {
        entradas.push({ label, valor });
      } else if (blocoAtual === 'saida' && valor > 0) {
        if (nomeBlocoSaida === 'Gastos Fixos') gastosFixosItens.push({ label, valor });
        const cur = saidasMap.get(nomeBlocoSaida) ?? 0;
        saidasMap.set(nomeBlocoSaida, cur + valor);
      }
    }
  }

  const saidas = Array.from(saidasMap.entries()).map(([nome, total]) => ({ nome, total }));
  return { entradas, saidas, gastosFixosItens };
}

/** Filtra transações do dia aplicando regras EA/Blead/Samuel (reuso da lógica de /transacoes). */
function filtrarTransacoesDia(
  todas: { id: string; data: string; pessoa: string; valor: number; descricao: string | null; tipo: string }[]
): { entradas: typeof todas; saidas: typeof todas } {
  const idsParaIgnorar = new Set<string>();
  const externosPorData = new Map<string, { id: string; valor: number; usado: boolean }[]>();
  for (const r of todas) {
    const pessoa = (r.pessoa ?? '').toLowerCase().trim();
    const descricao = (r.descricao ?? '').toLowerCase().trim();
    const isEa = pessoa.startsWith('ea ') || descricao.startsWith('ea ');
    const isBlead = pessoa.startsWith('blead ad tech') || descricao.includes('blead ad tech');
    if (r.tipo === 'entrada' && (isEa || isBlead)) {
      const arr = externosPorData.get(r.data) ?? [];
      arr.push({ id: r.id, valor: Number(r.valor || 0), usado: false });
      externosPorData.set(r.data, arr);
      idsParaIgnorar.add(r.id);
    }
  }
  const TOLERANCIA = 300;
  for (const r of todas) {
    const pessoa = (r.pessoa ?? '').toLowerCase().trim();
    if (r.tipo !== 'saida') continue;
    if (!pessoa.startsWith('samuel davi tude silva')) continue;
    const arr = externosPorData.get(r.data);
    if (!arr || arr.length === 0) continue;
    const valorSaida = Number(r.valor || 0);
    for (const ext of arr) {
      if (ext.usado) continue;
      if (Math.abs(ext.valor - valorSaida) <= TOLERANCIA) {
        ext.usado = true;
        idsParaIgnorar.add(r.id);
        break;
      }
    }
  }
  const entradas = todas.filter((r) => r.tipo === 'entrada' && !idsParaIgnorar.has(r.id));
  const saidas = todas.filter((r) => r.tipo === 'saida' && !idsParaIgnorar.has(r.id));
  return { entradas, saidas };
}

/** GET /api/relatorios/diario?data=2026-03-10 – Dados estruturados do dia (entradas/saídas) para relatório/IA. */
router.get('/relatorios/diario', async (req: Request, res: Response) => {
  try {
    const dataStr = (req.query.data as string)?.trim();
    if (!dataStr || !/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      return res.status(400).json({ error: 'Parâmetro data obrigatório no formato YYYY-MM-DD.' });
    }
    const supabase = getSupabase();
    if (!supabase) return res.status(503).json({ error: 'Supabase não configurado.' });

    const { data: rows, error } = await supabase
      .from('transacoes')
      .select('id, data, pessoa, valor, descricao, tipo')
      .eq('data', dataStr)
      .order('id', { ascending: false });

    if (error) return res.status(502).json({ error: error.message });
    const todas = (rows ?? []) as { id: string; data: string; pessoa: string; valor: number; descricao: string | null; tipo: string }[];
    const { entradas: entradasList, saidas: saidasList } = filtrarTransacoesDia(todas);

    const totalEntradas = entradasList.reduce((s, r) => s + Number(r.valor || 0), 0);
    const totalSaidas = saidasList.reduce((s, r) => s + Number(r.valor || 0), 0);
    const LIMITE_ITENS = 15;
    const itensEntradas = entradasList.slice(0, LIMITE_ITENS).map((r) => ({
      pessoa: r.pessoa ?? '',
      valor: Number(r.valor || 0),
      descricao: (r.descricao ?? '').slice(0, 80),
    }));
    const itensSaidas = saidasList.slice(0, LIMITE_ITENS).map((r) => ({
      pessoa: r.pessoa ?? '',
      valor: Number(r.valor || 0),
      descricao: (r.descricao ?? '').slice(0, 80),
    }));
    const [d, m, a] = dataStr.split('-');
    const periodoLabel = `${d}/${m}/${a}`;

    res.json({
      tipo: 'diario',
      data: dataStr,
      periodo_label: periodoLabel,
      entradas: {
        total: totalEntradas,
        quantidade: entradasList.length,
        itens_resumo: itensEntradas,
        mais_itens: Math.max(0, entradasList.length - LIMITE_ITENS),
      },
      saidas: {
        total: totalSaidas,
        quantidade: saidasList.length,
        itens_resumo: itensSaidas,
        mais_itens: Math.max(0, saidasList.length - LIMITE_ITENS),
      },
      saldo_dia: totalEntradas - totalSaidas,
      fontes: { origem: 'transacoes (Supabase)' },
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** GET /api/relatorios/mensal?mes=3&ano=2026 – Dados estruturados do mês para relatório/IA. */
router.get('/relatorios/mensal', async (req: Request, res: Response) => {
  try {
    const mes = parseInt(String(req.query.mes ?? ''), 10);
    const ano = parseInt(String(req.query.ano ?? ''), 10);
    if (!mes || mes < 1 || mes > 12 || !ano || ano < 2000) {
      return res.status(400).json({ error: 'Parâmetros mes (1-12) e ano obrigatórios.' });
    }
    const supabase = getSupabase();
    const resumos = await getResumoMensalSupabase([{ mes, ano }, mesAnterior(mes, ano)]);
    const resumoAtual = resumos.find((r) => r.mes === mes && r.ano === ano);
    const resumoAnt = resumos.find((r) => r.mes === mesAnterior(mes, ano).mes && r.ano === mesAnterior(mes, ano).ano);

    const fluxo = await fluxoUseCase.execute(mes, ano);
    const comb = fluxo.combinado;
    const { entradas: porFonteEntradas, saidas: porBlocoSaidas, gastosFixosItens } = extrairBlocosPlanilha(comb.porColuna);

    const totalEntradaPlanilha = comb.entradaTotal ?? porFonteEntradas.reduce((s, x) => s + x.valor, 0);
    const totalSaidaPlanilha = comb.saidaTotal ?? porBlocoSaidas.reduce((s, x) => s + x.total, 0);
    const lucroPlanilha = comb.lucroTotal ?? (totalEntradaPlanilha - totalSaidaPlanilha);

    const totalOficialEntradas = resumoAtual?.total_entradas ?? 0;
    const totalOficialSaidas = resumoAtual?.total_saidas ?? 0;
    const saldoOficial = resumoAtual?.saldo_mes ?? totalOficialEntradas - totalOficialSaidas;
    const lucroMesAnterior = resumoAnt?.saldo_mes ?? null;

    const deltaEntrada = lucroMesAnterior !== null && resumoAnt ? totalOficialEntradas - resumoAnt.total_entradas : null;
    const deltaSaida = lucroMesAnterior !== null && resumoAnt ? totalOficialSaidas - resumoAnt.total_saidas : null;
    const deltaLucro = lucroMesAnterior !== null ? saldoOficial - lucroMesAnterior : null;

    res.json({
      tipo: 'mensal',
      mes,
      ano,
      periodo_label: `${MESES_NOMES[mes] ?? ''} de ${ano}`,
      entradas: {
        total_oficial: totalOficialEntradas,
        total_planilha: totalEntradaPlanilha || null,
        por_fonte_planilha: porFonteEntradas.length ? porFonteEntradas : undefined,
        comparacao_mes_anterior: resumoAnt
          ? {
              total_anterior: resumoAnt.total_entradas,
              delta_absoluto: deltaEntrada ?? 0,
              delta_percentual: resumoAnt.total_entradas ? Math.round(((deltaEntrada ?? 0) / resumoAnt.total_entradas) * 10000) / 100 : 0,
            }
          : null,
      },
      saidas: {
        total_oficial: totalOficialSaidas,
        total_planilha: totalSaidaPlanilha || null,
        por_bloco_planilha: porBlocoSaidas.length ? porBlocoSaidas : undefined,
        comparacao_mes_anterior: resumoAnt
          ? {
              total_anterior: resumoAnt.total_saidas,
              delta_absoluto: deltaSaida ?? 0,
              delta_percentual: resumoAnt.total_saidas ? Math.round(((deltaSaida ?? 0) / resumoAnt.total_saidas) * 10000) / 100 : 0,
            }
          : null,
      },
      lucro: {
        valor: saldoOficial,
        valor_planilha: lucroPlanilha ?? null,
        lucro_mes_anterior: lucroMesAnterior,
        delta_absoluto: deltaLucro ?? null,
        delta_percentual:
          lucroMesAnterior != null && lucroMesAnterior !== 0
            ? Math.round(((deltaLucro ?? 0) / lucroMesAnterior) * 10000) / 100
            : null,
      },
      destaques: {
        categorias_maior_despesa: porBlocoSaidas.slice(0, 5),
        gastos_fixos_itens: gastosFixosItens.slice(0, 15),
      },
      fontes: {
        resumo_oficial_origem: 'v_resumo_mensal_oficial',
        planilha_origem: 'CONTROLE DE CAIXA',
        aba_planilha: comb.aba ?? null,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** Meses do trimestre: 1=>[1,2,3], 2=>[4,5,6], 3=>[7,8,9], 4=>[10,11,12]. */
function mesesDoTrimestre(trimestre: number): number[] {
  const t = Math.max(1, Math.min(4, trimestre));
  return [(t - 1) * 3 + 1, (t - 1) * 3 + 2, (t - 1) * 3 + 3];
}

/** GET /api/relatorios/trimestral?trimestre=1&ano=2026 */
router.get('/relatorios/trimestral', async (req: Request, res: Response) => {
  try {
    const trimestre = parseInt(String(req.query.trimestre ?? ''), 10);
    const ano = parseInt(String(req.query.ano ?? ''), 10);
    if (!trimestre || trimestre < 1 || trimestre > 4 || !ano || ano < 2000) {
      return res.status(400).json({ error: 'Parâmetros trimestre (1-4) e ano obrigatórios.' });
    }
    const meses = mesesDoTrimestre(trimestre);
    const mesAnos = meses.map((m) => ({ mes: m, ano }));
    const resumos = await getResumoMensalSupabase(mesAnos);
    const prevAno = trimestre === 1 ? ano - 1 : ano;
    const prevMeses = trimestre === 1 ? [10, 11, 12] : meses.map((m) => m - 3);
    const resumoTrimestreAnterior = await getResumoMensalSupabase(prevMeses.map((m) => ({ mes: m, ano: prevAno })));

    let totalEntradas = 0;
    let totalSaidas = 0;
    const porMes: { mes: number; ano: number; total_entradas: number; total_saidas: number; saldo: number }[] = [];
    for (const r of resumos) {
      totalEntradas += r.total_entradas ?? 0;
      totalSaidas += r.total_saidas ?? 0;
      porMes.push({
        mes: r.mes,
        ano: r.ano,
        total_entradas: r.total_entradas,
        total_saidas: r.total_saidas,
        saldo: r.saldo_mes ?? r.total_entradas - r.total_saidas,
      });
    }
    porMes.sort((a, b) => a.mes - b.mes);

    let totalPlanilhaEntradas = 0;
    let totalPlanilhaSaidas = 0;
    for (const m of meses) {
      const f = await fluxoUseCase.execute(m, ano);
      totalPlanilhaEntradas += f.combinado.entradaTotal ?? 0;
      totalPlanilhaSaidas += f.combinado.saidaTotal ?? 0;
    }

    const totalAntEntradas = resumoTrimestreAnterior.reduce((s, r) => s + (r.total_entradas ?? 0), 0);
    const totalAntSaidas = resumoTrimestreAnterior.reduce((s, r) => s + (r.total_saidas ?? 0), 0);
    const totalAntSaldo = resumoTrimestreAnterior.reduce((s, r) => s + (r.saldo_mes ?? 0), 0);

    res.json({
      tipo: 'trimestral',
      trimestre,
      ano,
      periodo_label: `${trimestre}º trimestre de ${ano} (${MESES_NOMES[meses[0]]}–${MESES_NOMES[meses[2]]})`,
      meses,
      entradas: {
        total_oficial: totalEntradas,
        total_planilha: totalPlanilhaEntradas || null,
        media_mensal_oficial: meses.length ? Math.round((totalEntradas / meses.length) * 100) / 100 : 0,
        comparacao_trimestre_anterior: {
          total_anterior: totalAntEntradas,
          delta_absoluto: totalEntradas - totalAntEntradas,
          delta_percentual: totalAntEntradas ? Math.round(((totalEntradas - totalAntEntradas) / totalAntEntradas) * 10000) / 100 : 0,
        },
      },
      saidas: {
        total_oficial: totalSaidas,
        total_planilha: totalPlanilhaSaidas || null,
        media_mensal_oficial: meses.length ? Math.round((totalSaidas / meses.length) * 100) / 100 : 0,
        comparacao_trimestre_anterior: {
          total_anterior: totalAntSaidas,
          delta_absoluto: totalSaidas - totalAntSaidas,
          delta_percentual: totalAntSaidas ? Math.round(((totalSaidas - totalAntSaidas) / totalAntSaidas) * 10000) / 100 : 0,
        },
      },
      lucro: {
        total_oficial: totalEntradas - totalSaidas,
        total_planilha: totalPlanilhaEntradas && totalPlanilhaSaidas ? totalPlanilhaEntradas - totalPlanilhaSaidas : null,
        media_mensal: meses.length ? Math.round((totalEntradas - totalSaidas) / meses.length * 100) / 100 : 0,
        comparacao_trimestre_anterior: {
          total_anterior: totalAntSaldo,
          delta_absoluto: totalEntradas - totalSaidas - totalAntSaldo,
          delta_percentual: totalAntSaldo ? Math.round(((totalEntradas - totalSaidas - totalAntSaldo) / totalAntSaldo) * 10000) / 100 : 0,
        },
      },
      por_mes: porMes,
      fontes: {
        resumo_oficial_origem: 'v_resumo_mensal_oficial',
        planilha_origem: 'CONTROLE DE CAIXA',
      },
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

/** GET /api/relatorios/anual?ano=2026 */
router.get('/relatorios/anual', async (req: Request, res: Response) => {
  try {
    const ano = parseInt(String(req.query.ano ?? ''), 10);
    if (!ano || ano < 2000) {
      return res.status(400).json({ error: 'Parâmetro ano obrigatório.' });
    }
    const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const mesAnos = meses.map((m) => ({ mes: m, ano }));
    const resumos = await getResumoMensalSupabase(mesAnos);
    const resumosAnoAnterior = await getResumoMensalSupabase(meses.map((m) => ({ mes: m, ano: ano - 1 })));

    let totalEntradas = 0;
    let totalSaidas = 0;
    const porMes: { mes: number; ano: number; total_entradas: number; total_saidas: number; saldo: number }[] = [];
    for (const r of resumos) {
      totalEntradas += r.total_entradas ?? 0;
      totalSaidas += r.total_saidas ?? 0;
      porMes.push({
        mes: r.mes,
        ano: r.ano,
        total_entradas: r.total_entradas,
        total_saidas: r.total_saidas,
        saldo: r.saldo_mes ?? r.total_entradas - r.total_saidas,
      });
    }
    porMes.sort((a, b) => a.mes - b.mes);

    let totalPlanilhaEntradas = 0;
    let totalPlanilhaSaidas = 0;
    for (const m of meses) {
      const f = await fluxoUseCase.execute(m, ano);
      totalPlanilhaEntradas += f.combinado.entradaTotal ?? 0;
      totalPlanilhaSaidas += f.combinado.saidaTotal ?? 0;
    }

    const totalAntEntradas = resumosAnoAnterior.reduce((s, r) => s + (r.total_entradas ?? 0), 0);
    const totalAntSaidas = resumosAnoAnterior.reduce((s, r) => s + (r.total_saidas ?? 0), 0);
    const totalAntSaldo = resumosAnoAnterior.reduce((s, r) => s + (r.saldo_mes ?? 0), 0);

    res.json({
      tipo: 'anual',
      ano,
      periodo_label: `Ano ${ano}`,
      entradas: {
        total_oficial: totalEntradas,
        total_planilha: totalPlanilhaEntradas || null,
        media_mensal_oficial: 12 ? Math.round((totalEntradas / 12) * 100) / 100 : 0,
        comparacao_ano_anterior: {
          total_anterior: totalAntEntradas,
          delta_absoluto: totalEntradas - totalAntEntradas,
          delta_percentual: totalAntEntradas ? Math.round(((totalEntradas - totalAntEntradas) / totalAntEntradas) * 10000) / 100 : 0,
        },
      },
      saidas: {
        total_oficial: totalSaidas,
        total_planilha: totalPlanilhaSaidas || null,
        media_mensal_oficial: 12 ? Math.round((totalSaidas / 12) * 100) / 100 : 0,
        comparacao_ano_anterior: {
          total_anterior: totalAntSaidas,
          delta_absoluto: totalSaidas - totalAntSaidas,
          delta_percentual: totalAntSaidas ? Math.round(((totalSaidas - totalAntSaidas) / totalAntSaidas) * 10000) / 100 : 0,
        },
      },
      lucro: {
        total_oficial: totalEntradas - totalSaidas,
        total_planilha: totalPlanilhaEntradas && totalPlanilhaSaidas ? totalPlanilhaEntradas - totalPlanilhaSaidas : null,
        media_mensal: 12 ? Math.round((totalEntradas - totalSaidas) / 12 * 100) / 100 : 0,
        comparacao_ano_anterior: {
          total_anterior: totalAntSaldo,
          delta_absoluto: totalEntradas - totalSaidas - totalAntSaldo,
          delta_percentual: totalAntSaldo ? Math.round(((totalEntradas - totalSaidas - totalAntSaldo) / totalAntSaldo) * 10000) / 100 : 0,
        },
      },
      por_mes: porMes,
      fontes: {
        resumo_oficial_origem: 'v_resumo_mensal_oficial',
        planilha_origem: 'CONTROLE DE CAIXA',
      },
    });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

const SYSTEM_PROMPT_IA = `Você é um analista financeiro experiente do Espaço Byla. Sua tarefa é gerar um RELATÓRIO EXECUTIVO SIMPLES a partir dos dados fornecidos em JSON.

Regras gerais:
- Sempre responda em português brasileiro.
- Use apenas os números presentes nos dados; não invente valores.
- Formato SEM símbolos especiais como asteriscos (*).
- Estrutura de seções para relatórios mensal, trimestral e anual:
  1) Título na primeira linha: "Relatório mensal - <período>" (ou "Relatório trimestral - <período>", "Relatório anual - <período>").
  2) Seção "Resumo" com 2 a 3 frases curtas e diretas.
  3) Seção "Entradas" com bullets simples, mostrando:
     - Total de entradas oficiais do período.
     - Se fizer sentido, uma frase curta explicando se o valor é alto, baixo ou estável em relação ao histórico enviado nos dados.
  4) Seção "Saídas" com bullets simples, mostrando:
     - Total de saídas oficiais do período.
     - Se fizer sentido, uma frase curta destacando se os gastos estão sob controle ou cresceram.
  5) Seção "Lucro" com bullets simples, mostrando:
     - Lucro total oficial do período.
     - Uma frase curta dizendo se o resultado é confortável, de atenção ou apertado (use apenas os números fornecidos).

Estilo:
- Frases curtas, linguagem simples, sem jargões financeiros.
- Priorize clareza para donos da empresa que querem entender rápido.
- Não inclua recomendações longas; no máximo 1 frase de alerta ou oportunidade em cada seção quando fizer sentido.`;

const SYSTEM_PROMPT_IA_DIARIO = `Você é um analista financeiro do Espaço Byla. Gere um RELATÓRIO DIÁRIO SIMPLES com base nos dados fornecidos em JSON.

Regras:
- Português brasileiro.
- Use apenas os números presentes nos dados; não invente valores.
- Não use símbolos como asteriscos (*); apenas texto comum e quebras de linha.
- Estrutura:
  1) Título: "Resumo do dia - <data>".
  2) Seção "Resumo" com 2 frases curtas explicando o resultado do dia (positivo, equilibrado ou negativo).
  3) Seção "Entradas" com bullets simples indicando o total de entradas do dia e, se fizer sentido, um comentário curto.
  4) Seção "Saídas" com bullets simples indicando o total de saídas do dia e, se fizer sentido, um comentário curto.
  5) Seção "Saldo do dia" com bullets simples indicando o saldo (entradas - saídas) e uma frase curta dizendo se o dia foi bom, razoável ou de atenção.

Tamanho:
- Até 200 palavras no total.
- Seja direto e claro, pensando em donos da empresa que querem ler algo rápido.`;

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'] as const;

/** Chama a API gratuita do Google Gemini e retorna o texto gerado. Tenta outro modelo se der 429. */
async function gerarTextoComGemini(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
  };

  let last429 = false;
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const raw = await response.text();

    if (response.ok) {
      let data: { candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[] };
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        throw new Error('Resposta inválida da API Gemini.');
      }
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text?.trim() ?? '';
      if (!text && candidate?.finishReason === 'SAFETY') throw new Error('A IA bloqueou a resposta por política de segurança. Tente um relatório com menos dados ou outro período.');
      return text || '(A IA não retornou texto. Tente gerar novamente.)';
    }

    if (response.status === 429) {
      last429 = true;
      await new Promise((r) => setTimeout(r, 6000));
      continue;
    }
    if (response.status === 404) continue;
    if (response.status === 400 && raw.includes('API_KEY_INVALID')) throw new Error('Chave da API Gemini inválida. Gere uma nova em Google AI Studio e atualize o .env.');
    throw new Error(`Gemini API: ${response.status}. ${raw.slice(0, 300)}`);
  }

  if (last429) {
    throw new Error(
      'Limite gratuito da API Gemini atingido. Aguarde 1–2 minutos e tente de novo. Alternativa: adicione OPENAI_API_KEY no backend/.env (pago) para usar a OpenAI.'
    );
  }
  throw new Error('Nenhum modelo Gemini disponível no momento. Tente mais tarde ou configure OPENAI_API_KEY no .env.');
}

/** Chama a Groq (API OpenAI-compatível, grátis, cota alta). */
async function gerarTextoComGroq(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API: ${response.status}. ${errBody.slice(0, 200)}`);
  }
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Chama a OpenAI e retorna o texto gerado (pago). */
async function gerarTextoComOpenAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API: ${response.status}. ${errBody.slice(0, 200)}`);
  }
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Gera um relatório em texto a partir do payload (fallback quando nenhuma API de IA está disponível). Mantém o mesmo formato simples dos prompts. */
function gerarTextoFallback(payload: Record<string, unknown>, isDiario: boolean): string {
  const tipo = (payload.tipo as string) ?? 'mensal';
  const periodo = (payload.periodo_label as string) ?? (payload.data as string) ?? '';
  const entradas = payload.entradas as Record<string, unknown> | undefined;
  const saidas = payload.saidas as Record<string, unknown> | undefined;
  const entTotal = entradas && typeof entradas.total === 'number' ? entradas.total : (entradas?.total_oficial as number) ?? 0;
  const saiTotal = saidas && typeof saidas.total === 'number' ? saidas.total : (saidas?.total_oficial as number) ?? 0;
  const lucro = typeof (payload as Record<string, unknown>).lucro === 'object'
    ? ((payload.lucro as Record<string, unknown>)?.total_oficial as number) ?? entTotal - saiTotal
    : entTotal - saiTotal;
  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  if (isDiario) {
    return (
      `Resumo do dia - ${periodo}\n\n` +
      `Resumo\n` +
      `O dia fechou com entradas de ${fmt(entTotal)} e saídas de ${fmt(saiTotal)}, gerando um saldo de ${fmt(lucro)}.\n\n` +
      `Entradas\n` +
      `- Total de entradas do dia: ${fmt(entTotal)}.\n\n` +
      `Saídas\n` +
      `- Total de saídas do dia: ${fmt(saiTotal)}.\n\n` +
      `Saldo do dia\n` +
      `- Saldo do dia: ${fmt(lucro)}.`
    );
  }
  return (
    `Relatório ${tipo} - ${periodo}\n\n` +
    `Resumo\n` +
    `No período, as entradas somaram ${fmt(entTotal)}, as saídas totalizaram ${fmt(saiTotal)} e o lucro foi de ${fmt(lucro)}.\n\n` +
    `Entradas\n` +
    `- Total de entradas oficiais: ${fmt(entTotal)}.\n\n` +
    `Saídas\n` +
    `- Total de saídas oficiais: ${fmt(saiTotal)}.\n\n` +
    `Lucro\n` +
    `- Lucro oficial do período: ${fmt(lucro)}.\n\n` +
    `Relatório gerado automaticamente com base nos dados financeiros do Espaço Byla.`
  );
}

/** GET /api/relatorios/ia-status – Indica se a IA está configurada (para exibir botão/hint no front). */
router.get('/relatorios/ia-status', (_req: Request, res: Response) => {
  const gemini = !!config.geminiApiKey;
  const groq = !!config.groqApiKey;
  const openai = !!config.openaiApiKey;
  const provider = gemini ? 'gemini' : groq ? 'groq' : openai ? 'openai' : null;
  res.json({ configured: gemini || groq || openai, provider });
});

/** POST /api/relatorios/gerar-texto-ia – Gera texto do relatório. Ordem: Gemini → Groq → OpenAI; se todos falharem, usa relatório em texto (fallback). */
router.post('/relatorios/gerar-texto-ia', async (req: Request, res: Response) => {
  try {
    const payload = req.body?.payload;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Body deve conter { "payload": <objeto do relatório> }.', texto: null });
    }
    const tipo = payload.tipo ?? 'mensal';
    const isDiario = tipo === 'diario';
    const systemPrompt = isDiario ? SYSTEM_PROMPT_IA_DIARIO : SYSTEM_PROMPT_IA;
    const userPrompt = isDiario
      ? `Com base nos dados do dia abaixo, produza o resumo do dia. Antes de escrever: 1) Confira totais; 2) Identifique o maior movimento de entrada e de saída; 3) Redija o texto nas seções solicitadas.

[DADOS]
${JSON.stringify(payload, null, 2)}
[/DADOS]`
      : `Analise os dados abaixo e produza o relatório executivo ${tipo} conforme o tipo indicado.

[DADOS]
${JSON.stringify(payload, null, 2)}
[/DADOS]

Gere o texto em seções claras (Resumo, Entradas, Saídas, Lucro, Destaques ou Comparativo), em até 600 palavras para mensal e até 800 para trimestral/anual. Use apenas os números presentes nos dados.`;

    let texto = '';
    const geminiKey = config.geminiApiKey;
    const groqKey = config.groqApiKey;
    const openaiKey = config.openaiApiKey;

    if (geminiKey) {
      try {
        texto = await gerarTextoComGemini(systemPrompt, userPrompt, geminiKey);
        if (texto) {
          res.json({ texto });
          return;
        }
      } catch {
        // segue para Groq ou OpenAI
      }
    }

    if (groqKey) {
      try {
        texto = await gerarTextoComGroq(systemPrompt, userPrompt, groqKey);
        if (texto) {
          res.json({ texto });
          return;
        }
      } catch {
        // segue para OpenAI ou fallback
      }
    }

    if (openaiKey) {
      try {
        texto = await gerarTextoComOpenAI(systemPrompt, userPrompt, openaiKey);
        if (texto) {
          res.json({ texto });
          return;
        }
      } catch {
        // segue para fallback
      }
    }

    texto = gerarTextoFallback(payload as Record<string, unknown>, isDiario);
    res.json({ texto });
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : String(e),
      texto: null,
    });
  }
});

export default router;
