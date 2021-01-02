/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionsBalance {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const allTransactions = await this.find();

    const balance = allTransactions.reduce(
      (accumulator: Balance, transaction): Balance => {
        transaction.value = Number(transaction.value);
        switch (transaction.type) {
          case 'income':
            accumulator.income += transaction.value;
            break;

          case 'outcome':
            accumulator.outcome += transaction.value;
            break;

          default:
            break;
        }
        return accumulator;
      },
      { income: 0, outcome: 0, total: 0 } as Balance,
    );

    balance.total = balance.income - balance.outcome;
    return balance;
  }

  public async all(): Promise<TransactionsBalance> {
    const transactions = await this.find({
      relations: [`category`],
    });

    return {
      transactions,
      balance: await this.getBalance(),
    };
  }
}

export default TransactionsRepository;
