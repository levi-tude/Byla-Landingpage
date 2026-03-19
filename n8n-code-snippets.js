/**
 * Códigos JavaScript para usar nos nodes Code do n8n
 * Sistema de Controle Financeiro - Pluggy + Supabase
 */

// ============================================================================
// 1. VERIFICAR STATUS DO UPDATE PLUGGY
// ============================================================================
// Usar após fazer POST /items/{itemId}/update

const updateResponse = $input.item.json;

if (!updateResponse) {
  throw new Error('Resposta do update não encontrada');
}

const status = updateResponse.status;
const itemId = updateResponse.id;

// Status possíveis: UPDATING, UPDATED, LOGIN_ERROR, WAITING_USER_INPUT, etc.
if (status === 'UPDATING' || status === 'UPDATED') {
  return {
    json: {
      success: true,
      itemId: itemId,
      status: status,
      message: 'Update iniciado com sucesso',
      timestamp: new Date().toISOString()
    }
  };
} else if (status === 'LOGIN_ERROR') {
  throw new Error('Erro de login no Pluggy. Verifique as credenciais.');
} else {
  return {
    json: {
      success: false,
      itemId: itemId,
      status: status,
      message: `Status inesperado: ${status}`,
      timestamp: new Date().toISOString()
    }
  };
}

// ============================================================================
// 2. VERIFICAR SE ITEM ESTÁ ATUALIZADO (APÓS ESPERA)
// ============================================================================
// Usar após aguardar e fazer GET /items/{itemId}

const itemResponse = $input.item.json;
const currentStatus = itemResponse.status;

if (currentStatus === 'UPDATED') {
  return {
    json: {
      ready: true,
      itemId: itemResponse.id,
      status: currentStatus,
      lastUpdatedAt: itemResponse.executionStatus?.lastUpdatedAt,
      message: 'Item atualizado e pronto para buscar transações'
    }
  };
} else if (currentStatus === 'UPDATING') {
  return {
    json: {
      ready: false,
      itemId: itemResponse.id,
      status: currentStatus,
      message: 'Ainda processando... aguarde mais tempo',
      retry: true
    }
  };
} else {
  throw new Error(`Status do item não permite busca: ${currentStatus}`);
}

// ============================================================================
// 3. NORMALIZAR DADOS DAS TRANSAÇÕES
// ============================================================================
// Usar após buscar transações do Pluggy

const transactions = $input.item.json.results || [];
const normalized = [];

for (const transaction of transactions) {
  // Extrair data
  const date = transaction.date || transaction.dateCreated;
  
  // Extrair descrição
  const description = transaction.description || 
                     transaction.merchantName || 
                     transaction.paymentData?.payer?.name || 
                     'Transação sem descrição';
  
  // Extrair valor (sempre positivo, tipo será determinado depois)
  const amount = Math.abs(parseFloat(transaction.amount) || 0);
  
  // Determinar tipo baseado no valor original
  const originalAmount = parseFloat(transaction.amount) || 0;
  const tipo = originalAmount >= 0 ? 'entrada' : 'saida';
  
  // Gerar id_unico: data + descrição + valor
  const idUnico = `${date}-${description}-${amount}`;
  
  // Extrair pessoa (se disponível no description ou merchantName)
  // Você pode ajustar essa lógica conforme necessário
  let pessoa = '';
  if (description.includes('JOSE') || description.includes('JOSÉ')) {
    pessoa = 'José';
  } else if (description.includes('MARIA')) {
    pessoa = 'Maria';
  }
  // Adicione mais regras conforme necessário
  
  normalized.push({
    data: date,
    descricao: description,
    valor: amount,
    tipo: tipo,
    id_unico: idUnico,
    pessoa: pessoa,
    categoria: transaction.category || 'Outros',
    // Campos adicionais para debug
    _original: {
      id: transaction.id,
      amount: transaction.amount,
      date: transaction.date
    }
  });
}

return normalized.map(item => ({ json: item }));

// ============================================================================
// 4. VALIDAR E FILTRAR TRANSAÇÕES DUPLICADAS (OPCIONAL)
// ============================================================================
// Usar antes de inserir no Supabase para evitar tentativas desnecessárias

const items = $input.all();
const seen = new Set();
const unique = [];

for (const item of items) {
  const idUnico = item.json.id_unico;
  
  if (!idUnico) {
    console.warn('Item sem id_unico:', item.json);
    continue;
  }
  
  if (!seen.has(idUnico)) {
    seen.add(idUnico);
    unique.push(item);
  } else {
    console.log(`Duplicado ignorado: ${idUnico}`);
  }
}

return unique;

// ============================================================================
// 5. CALCULAR PERÍODO DE BUSCA (ÚLTIMOS 30 DIAS)
// ============================================================================
// Usar para definir parâmetros from/to na busca de transações
// Versão que preserva dados do node anterior (apiKey, itemId, accountId)
// e garante fromDate/toDate sempre preenchidos.

const input = $input.item.json;
const dadosAnteriores = { ...input };

const hoje = new Date();
const trintaDiasAtras = new Date();
trintaDiasAtras.setDate(hoje.getDate() - 30);

let fromDate = input.fromDate || trintaDiasAtras.toISOString().split('T')[0];
let toDate = input.toDate || hoje.toISOString().split('T')[0];
// Só a parte da data (YYYY-MM-DD) - a URL do Buscar Extrato adiciona T00:00:00.000Z
if (typeof fromDate === 'string' && fromDate.includes('T')) fromDate = fromDate.split('T')[0];
if (typeof toDate === 'string' && toDate.includes('T')) toDate = toDate.split('T')[0];

return {
  json: {
    ...dadosAnteriores,
    fromDate: fromDate,
    toDate: toDate
  }
};

// ============================================================================
// 6. TRATAR ERRO DE DUPLICAÇÃO DO SUPABASE
// ============================================================================
// Usar após tentar inserir no Supabase

const result = $input.item.json;

// Se a inserção foi bem-sucedida
if (result && result.id) {
  return {
    json: {
      success: true,
      inserted: true,
      id: result.id,
      id_unico: result.id_unico
    }
  };
}

// Se houve erro de duplicação (esperado e OK)
const error = $input.item.error;
if (error && error.message && error.message.includes('duplicate key')) {
  return {
    json: {
      success: true,
      inserted: false,
      duplicate: true,
      id_unico: $input.item.json?.id_unico || 'unknown',
      message: 'Transação já existe (duplicado esperado)'
    }
  };
}

// Outros erros devem ser propagados
throw error || new Error('Erro desconhecido ao inserir no Supabase');

// ============================================================================
// 7. LOG DE RESUMO DA EXECUÇÃO
// ============================================================================
// Usar no final do fluxo para log

const allItems = $input.all();
let total = 0;
let inseridos = 0;
let duplicados = 0;
let erros = 0;

for (const item of allItems) {
  total++;
  if (item.json.inserted === true) {
    inseridos++;
  } else if (item.json.duplicate === true) {
    duplicados++;
  } else if (item.json.error) {
    erros++;
  }
}

const resumo = {
  timestamp: new Date().toISOString(),
  total_processado: total,
  inseridos: inseridos,
  duplicados: duplicados,
  erros: erros,
  taxa_sucesso: total > 0 ? ((inseridos + duplicados) / total * 100).toFixed(2) + '%' : '0%'
};

console.log('📊 Resumo da execução:', JSON.stringify(resumo, null, 2));

return {
  json: resumo
};
