/**
 * BYLA - Enviar extrato da planilha Google para o Supabase (tabela transacoes)
 *
 * Uso: planilha com aba "Importar", linha 1: Data | Pessoa | Valor | Descrição | Tipo
 *      Da linha 2 em diante: dados do extrato. Execute enviarExtratoParaSupabase().
 *
 * Configure SUPABASE_URL e SUPABASE_KEY abaixo.
 */

// ============ CONFIGURE AQUI ============
// URL e chave: use o arquivo supabase-keys.local na raiz do projeto (SUPABASE_URL e SUPABASE_ANON_KEY) ou Supabase → Settings → API
var SUPABASE_URL = 'https://flbimmwxxsvixhghmmfu.supabase.co';
var SUPABASE_KEY = 'COLE_SUA_CHAVE_ANON_AQUI'; // Cole aqui o valor de SUPABASE_ANON_KEY do arquivo supabase-keys.local
// =======================================

/**
 * Lê a aba "Importar" (ou a primeira), gera id_unico por linha,
 * busca id_unicos já existentes no Supabase e insere só as linhas novas.
 */
function enviarExtratoParaSupabase() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Importar') || spreadsheet.getSheets()[0];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('Nenhuma linha de dados na aba Importar (use a partir da linha 2).');
    return;
  }

  var range = sheet.getRange(2, 1, lastRow, 5);
  var rows = range.getValues();
  var novos = [];
  var idUnicosPlanilha = [];

  for (var i = 0; i < rows.length; i++) {
    var data = String(rows[i][0] || '').trim();
    var pessoa = String(rows[i][1] || '').trim();
    var valor = rows[i][2];
    var descricao = String(rows[i][3] || '').trim();
    var tipo = String(rows[i][4] || 'saida').trim().toLowerCase();
    if (tipo !== 'entrada' && tipo !== 'saida') tipo = 'saida';

    if (!data || !pessoa) continue;

    var valorNum = parseFloat(String(valor).replace(',', '.')) || 0;
    if (valorNum === 0) continue;

    if (data.indexOf('/') !== -1) {
      var parts = data.split('/');
      if (parts.length >= 3) data = parts[2] + '-' + parts[1] + '-' + parts[0];
    } else if (data.indexOf('T') !== -1) {
      data = data.split('T')[0];
    }

    var idUnico = data + '-' + pessoa + '-' + valorNum;
    idUnicosPlanilha.push(idUnico);
    novos.push({
      data: data,
      pessoa: pessoa,
      valor: valorNum,
      descricao: descricao,
      tipo: tipo,
      id_unico: idUnico
    });
  }

  if (novos.length === 0) {
    SpreadsheetApp.getUi().alert('Nenhuma linha válida (Data e Pessoa obrigatórios, Valor numérico).');
    return;
  }

  var existentes = buscarIdUnicosExistentes();
  var inserir = [];
  for (var j = 0; j < novos.length; j++) {
    if (existentes.indexOf(novos[j].id_unico) === -1) inserir.push(novos[j]);
  }

  if (inserir.length === 0) {
    SpreadsheetApp.getUi().alert('Nenhuma transação nova para enviar (todas já existem no Supabase).');
    return;
  }

  var ok = 0;
  var erros = 0;
  for (var k = 0; k < inserir.length; k++) {
    if (inserirLinha(inserir[k])) ok++; else erros++;
  }

  SpreadsheetApp.getUi().alert('Enviadas: ' + ok + ' transação(ões).' + (erros > 0 ? ' Erros: ' + erros : ''));
}

function buscarIdUnicosExistentes() {
  var url = SUPABASE_URL + '/rest/v1/transacoes?select=id_unico';
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  });
  if (res.getResponseCode() !== 200) return [];
  var json = JSON.parse(res.getContentText());
  return (json || []).map(function (r) { return r.id_unico; });
}

function inserirLinha(obj) {
  var url = SUPABASE_URL + '/rest/v1/transacoes';
  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    payload: JSON.stringify(obj),
    muteHttpExceptions: true
  });
  return res.getResponseCode() >= 200 && res.getResponseCode() < 300;
}
