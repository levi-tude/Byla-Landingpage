/**
 * Verifica o retorno JSON da API PagBank EDI para ver se está retornando PIX.
 * Uso: node verificar-retorno-edi-pix.cjs [AAAA-MM-DD]
 * Se não passar a data, usa ontem.
 * Credenciais: edite USER e TOKEN abaixo (ou use env PAGBANK_EDI_USER e PAGBANK_EDI_TOKEN).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const USER = process.env.PAGBANK_EDI_USER || '108109086';
const TOKEN = process.env.PAGBANK_EDI_TOKEN || 'a45fc55a529c4daaae23f229dc845f29';
const BASE = 'https://edi.api.pagbank.com.br';
const AUTH = Buffer.from(`${USER}:${TOKEN}`).toString('base64');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { Authorization: `Basic ${AUTH}` }
    };
    https.get(url, opts, (res) => {
      let body = '';
      res.on('data', (ch) => body += ch);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve({ error: body }); }
      });
    }).on('error', reject);
  });
}

function isPix(d) {
  const mp = d.meio_pagamento;
  const au = String(d.arranjo_ur || '').trim().toUpperCase();
  const ap = String(d.arranjo_pagamento || '').trim().toUpperCase();
  return (mp == 11 || String(mp) === '11') || au === 'PIX' || ap === 'PIX';
}

function analisar(nome, detalhes) {
  if (!Array.isArray(detalhes) || detalhes.length === 0) {
    return { nome, total: 0, comPix: 0, meio_pagamento: [], arranjo_ur: [], arranjo_pagamento: [], amostra: null };
  }
  const meio = new Set();
  const arranjoUr = new Set();
  const arranjoPag = new Set();
  let comPix = 0;
  detalhes.forEach((d) => {
    if (d.meio_pagamento != null) meio.add(String(d.meio_pagamento));
    if (d.arranjo_ur) arranjoUr.add(d.arranjo_ur);
    if (d.arranjo_pagamento) arranjoPag.add(d.arranjo_pagamento);
    if (isPix(d)) comPix++;
  });
  return {
    nome,
    total: detalhes.length,
    comPix,
    meio_pagamento: [...meio],
    arranjo_ur: [...arranjoUr],
    arranjo_pagamento: [...arranjoPag],
    amostra: detalhes[0]
  };
}

async function main() {
  const data = process.argv[2] || (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })();
  const dir = path.join(__dirname);
  console.log('Data:', data);
  console.log('');

  const [trans, fin, cash] = await Promise.all([
    fetch(`${BASE}/movement/v3.00/transactional/${data}?pageNumber=1&pageSize=1000`),
    fetch(`${BASE}/movement/v3.00/financial/${data}?pageNumber=1&pageSize=1000`),
    fetch(`${BASE}/movement/v3.00/cashouts/${data}?pageNumber=1&pageSize=1000`)
  ]);

  if (trans.error) { console.error('Erro transactional:', trans.error); return; }
  if (fin.error) { console.error('Erro financial:', fin.error); return; }
  if (cash.error) { console.error('Erro cashouts:', cash.error); return; }

  fs.writeFileSync(path.join(dir, `resp-transactional-${data}.json`), JSON.stringify(trans, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, `resp-financial-${data}.json`), JSON.stringify(fin, null, 2), 'utf8');
  fs.writeFileSync(path.join(dir, `resp-cashouts-${data}.json`), JSON.stringify(cash, null, 2), 'utf8');
  console.log('Arquivos salvos: resp-transactional-' + data + '.json, resp-financial-' + data + '.json, resp-cashouts-' + data + '.json');
  console.log('');

  const a1 = analisar('transactional', trans.detalhes || []);
  const a2 = analisar('financial', fin.detalhes || []);
  const a3 = analisar('cashouts', cash.detalhes || []);

  [a1, a2, a3].forEach((a) => {
    console.log('---', a.nome, '---');
    console.log('Total itens:', a.total);
    console.log('Itens PIX (meio_pagamento 11 ou arranjo PIX):', a.comPix);
    if (a.meio_pagamento.length) console.log('meio_pagamento encontrados:', a.meio_pagamento.join(', '));
    if (a.arranjo_ur.length) console.log('arranjo_ur encontrados:', a.arranjo_ur.join(', '));
    if (a.arranjo_pagamento.length) console.log('arranjo_pagamento encontrados:', a.arranjo_pagamento.join(', '));
    if (a.amostra) console.log('Amostra 1º item (campos):', Object.keys(a.amostra).join(', '));
    console.log('');
  });

  const totalPix = a1.comPix + a2.comPix + a3.comPix;
  if (totalPix > 0) {
    console.log('Conclusão: SIM, o retorno contém', totalPix, 'item(ns) PIX.');
  } else if (a1.total + a2.total + a3.total === 0) {
    console.log('Conclusão: Nenhum item retornado nessa data. Tente outra data em que você tenha movimento.');
  } else {
    console.log('Conclusão: Há itens no retorno, mas nenhum com critério PIX (meio_pagamento 11 ou arranjo_ur/arranjo_pagamento PIX).');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
