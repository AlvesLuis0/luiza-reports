import { insertExtractBankSql } from "../sql/insert-extract-bank.js";
import { Database } from '../services/database.js';
import { insertPaymentSql } from "../sql/insert-payment.js";

export class ConciliateUseCase {
  constructor(history, transactions) {
    this.history = history;
    this.transactions = transactions;
  }

  async execute() {
    const ids = [];

    await Database.transaction(async (tx) => {

      // inserir valores do extrato
      for(const t of this.transactions) {
        await new Promise((resolve, reject) => {
          tx.query(insertExtractBankSql, formatTransactionToSql(t), (err, res) => {
            if (err) return reject(err);
            resolve(res);
          });
        });
      }

      // inserir baixas
      for(const p of this.history) {
        await new Promise((resolve, reject) => {
          tx.query(insertPaymentSql, formatPaymentToSql(p), (err, res) => {
            if (err) return reject(err);
            ids.push(`${p.id_titulo_cr}-${p.sequencia}`);
            resolve(res);
          });
        });
      }
    });

    return ids;
  }
}


function formatTransactionToSql(t) {
  return [
    t.id_extrato_banco,
    t.banco,
    t.conta,
    t.data_emissao,
    t.descricao,
    t.documento,
    t.tipo,
    t.valor
  ];
}

function formatPaymentToSql(b) {
  return [
    b.id_titulo_cr,
    b.sequencia,
    b.data_emissao,
    b.valor_recebido, // valor
    b.valor_recebido, // valor_principal
    b.id_extrato_banco,
  ]
}