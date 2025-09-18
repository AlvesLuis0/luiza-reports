import Dinero from 'dinero.js';
import { Database } from '../services/database.js';
import { pendingTransactionsSql } from '../sql/pending-transactions.js';

export class PreConciliateUseCase {
  constructor(customer, total) {
    this.customer = customer;
    this.total = toMoney(total);
  }

  async execute() {
    const pendingTransactions = await getPendingTransactions(this.customer);
    const result = [];

    for(const t of pendingTransactions) {
      if(this.total.isZero()) break;
      const value = toMoney(t.valor_residual);

      if(this.total.greaterThanOrEqual(value)) {
        result.push({ ...t, valor_final: 0 });
        this.total = this.total.subtract(value);
      } else {
        result.push({ ...t, valor_final: toNumber(value.subtract(this.total)) })
        this.total = toMoney(0);
      }
    }

    return result;
  }
}

function toMoney(value) {
  return Dinero({ amount: parseInt(value * 100) });
}

function toNumber(value) {
  return value.getAmount() / 100;
}

async function getPendingTransactions(customer) {
  return await Database.query(pendingTransactionsSql, [customer.id_cliente]);
}