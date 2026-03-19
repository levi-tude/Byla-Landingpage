# Importar extrato (planilha Google) para o Supabase

Passo a passo para usar uma planilha como fonte de transações e enviar para a tabela **transacoes** do Supabase, **sem custo** e com **qualquer banco**.

---

## 1. Criar a planilha

1. Crie uma nova planilha no Google Sheets (ou use uma existente).
2. Na **primeira aba**, renomeie para **Importar**.
3. Na **primeira linha**, coloque exatamente estes títulos (uma coluna cada):

   | A     | B      | C     | D         | E    |
   |-------|--------|-------|-----------|------|
   | Data  | Pessoa | Valor | Descrição | Tipo |

4. Da **linha 2** em diante você vai colar as transações (ou importar CSV). Exemplo:

   | Data       | Pessoa              | Valor  | Descrição | Tipo    |
   |------------|---------------------|--------|-----------|---------|
   | 2026-02-20 | MARIA SILVA         | 230    | PIX       | entrada |
   | 2026-02-20 | JOÃO PAGADOR        | 95     | PIX       | entrada |
   | 2026-02-19 | PAGAMENTO LOJA      | 50     | Débito    | saida   |

**Regras:**
- **Data:** formato `AAAA-MM-DD` (ex.: 2026-02-20).
- **Pessoa:** nome de quem aparece na transação (quem pagou ou descrição).
- **Valor:** número, sem R$ (ex.: 230 ou 95.50).
- **Descrição:** método (PIX, Débito, etc.) ou texto livre.
- **Tipo:** só `entrada` ou `saida`.

---

## 2. Configurar o script (Apps Script)

1. Na planilha, menu **Extensões** → **Apps Script**.
2. Apague o conteúdo padrão e **cole todo** o código do arquivo **planilha-importar-extrato-apps-script.js** (esta pasta docs).
3. No topo do script, ajuste:
   - **SUPABASE_URL:** a URL do seu projeto (ex.: `https://flbimmwxxsvixhghmmfu.supabase.co`).
   - **SUPABASE_KEY:** chave **anon public** do Supabase (Settings → API → anon public).
4. Salve (Ctrl+S). Na primeira vez que rodar, o Google pede autorização (conceda).

---

## 3. Enviar os dados para o Supabase

**Opção A – Botão na planilha (recomendado)**

1. No Apps Script, crie uma função que só chama `enviarExtratoParaSupabase` (ex.: função **Executar** com esse único comando).
2. No editor do Apps Script: **Implantar** → **Nova implantação** → tipo **Aplicação da Web** (ou use **Executar** direto no editor).
3. Ou: na planilha, **Inserir** → **Desenho** → desenhe um botão → clique com botão direito → **Atribuir script** → coloque o nome da função (ex.: `Executar`).

**Opção B – Rodar direto no Apps Script**

1. No Apps Script, selecione a função **enviarExtratoParaSupabase** no dropdown.
2. Clique em **Executar** (▶). Autorize se pedir.
3. Veja o **Log** (View → Logs) para saber quantas linhas foram enviadas.

O script:
- Lê as linhas da aba **Importar** (da linha 2 em diante).
- Gera um **id_unico** por linha (data + pessoa + valor) para não duplicar.
- Consulta o Supabase para ver quais **id_unico** já existem.
- Insere **só as linhas novas** na tabela **transacoes**.

---

## 4. De onde vir os dados (exportar do banco)

- **PagBank / PagSeguro:** no app ou no painel, procure “Extrato” ou “Movimentações” e use “Exportar” ou “Compartilhar” em CSV/Excel. Abra o CSV, copie as colunas que batem com Data, Pessoa, Valor, Descrição e ajuste Tipo (entrada/saida) e Data (AAAA-MM-DD), depois cole na aba **Importar**.
- **Outros bancos:** geralmente em “Extrato” ou “Exportar” há CSV ou Excel. Ajuste as colunas para bater com os títulos da planilha e cole na **Importar**.

Assim você mantém o projeto funcionando **sem Pluggy** e **sem custo**, usando a mesma tabela e as mesmas views do Supabase.
