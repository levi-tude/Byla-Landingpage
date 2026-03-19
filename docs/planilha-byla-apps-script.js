/**
 * BYLA - Atualiza planilha Google Sheets com transações do Supabase
 *
 * Como usar (Apps Script direto em script.google.com):
 * 1. Crie uma planilha no Google Sheets e copie o ID da URL (docs.google.com/spreadsheets/d/ID_AQUI/edit).
 * 2. Cole este código no Apps Script e preencha SUPABASE_KEY e PLANILHA_ID abaixo.
 * 3. Salve, execute "atualizarPlanilhaTransacoes" uma vez e autorize.
 * 4. Configure um gatilho diário (ícone Relógio → Adicionar gatilho).
 */

// ============ CONFIGURE AQUI ============
var SUPABASE_URL = 'https://flbimmwxxsvixhghmmfu.supabase.co';
var SUPABASE_KEY = 'COLE_SUA_CHAVE_ANON_AQUI'; // Supabase → Settings → API → anon public
var PLANILHA_ID = 'COLE_O_ID_DA_PLANILHA_AQUI'; // URL da planilha: .../d/ESTE_ID/edit
// =======================================

/**
 * Busca todas as transações no Supabase e preenche a primeira aba da planilha.
 * Ordena por data (mais recente primeiro).
 */
function atualizarPlanilhaTransacoes() {
  var spreadsheet = SpreadsheetApp.openById(PLANILHA_ID);
  var sheet = spreadsheet.getSheets()[0];

  var url = SUPABASE_URL + '/rest/v1/transacoes?order=data.desc';
  var options = {
    method: 'get',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();

  if (code !== 200) {
    Logger.log('Erro Supabase: ' + code + ' - ' + response.getContentText());
    throw new Error('Não foi possível buscar os dados. Código: ' + code);
  }

  var json = JSON.parse(response.getContentText());

  if (!json || json.length === 0) {
    sheet.clear();
    sheet.getRange(1, 1).setValue('Nenhuma transação encontrada.');
    return;
  }

  var headers = ['Data', 'Pessoa', 'Valor', 'Descrição', 'Tipo'];
  var rows = [headers];

  for (var i = 0; i < json.length; i++) {
    var r = json[i];
    rows.push([
      r.data || '',
      r.pessoa || '',
      r.valor != null ? Number(r.valor) : '',
      r.descricao || '',
      r.tipo || ''
    ]);
  }

  sheet.clear();
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.autoResizeColumns(1, headers.length);
}
