import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface TransactionCreateModel {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionCreateModel): Promise<Transaction> {
    if (!/income|outcome/g.test(type)) {
      throw new AppError('This type of transaction do not exists.');
    }

    if (type === 'income' && value < 0) {
      throw new AppError('This type of transaction must be for income.');
    }

    if (type === 'outcome' && value < 0) {
      throw new AppError('This type of transaction must be for outcome.');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const totalBalance = (await transactionsRepository.getBalance()).total;

    if (type === 'outcome' && value > totalBalance) {
      throw new AppError('Is not possible perform this action!');
    }

    let transactionCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = await categoriesRepository.save({
        title: category,
      });
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
