import Dinero from 'dinero.js';
import { Database } from '../services/database.js';
import { pendingTransactionsSql } from '../sql/pending-transactions.js';

export class PreConciliateUseCase {
  constructor(customer, transactions) {
    this.customer = customer;
    this.transactions = transactions;
  }

  async execute() {
    const pendingTransactions = await getPendingTransactions(this.customer);
    const result = []
    let i = 0;

    for (const t of this.transactions) {
      let remaining = money(t.valor);

      while (remaining.greaterThan(money(0)) && i < pendingTransactions.length) {
        const account = pendingTransactions[i];

        if (money(account.valor_residual).lessThanOrEqual(money(0))) {
          i++;
          continue;
        }

        const outstandingBefore = money(account.valor_residual);
        const settlementValue = outstandingBefore.lessThan(remaining) ? outstandingBefore : remaining;
        const outstandingAfter = outstandingBefore.subtract(settlementValue);

        result.push({
          id_cliente: account.id_cliente,
          razao_social: account.razao_social,
          id_titulo_cr: account.id_titulo_cr,
          data_vencimento: account.data_vencimento,
          data_emissao: t.data_emissao,
          valor_residual: toNumber(outstandingBefore),
          valor_recebido: toNumber(settlementValue),
          valor_total: toNumber(outstandingAfter)
        });

        account.valor_residual = toNumber(outstandingAfter);
        remaining = remaining.subtract(settlementValue);

        if (money(account.valor_residual).lessThanOrEqual(money(0))) {
          i++;
        }
      }
    }

    return result
  }
}

function money(value) {
  return Dinero({ amount: parseInt(value * 100) })
}

function toNumber(dineroObj) {
  return dineroObj.getAmount() / 100
}

async function getPendingTransactions(customer) {
  return await Database.query(pendingTransactionsSql, [customer.id_cliente]);
}