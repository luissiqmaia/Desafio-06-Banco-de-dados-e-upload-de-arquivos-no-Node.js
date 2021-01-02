import { getRepository } from 'typeorm';
import { isUuid } from 'uuidv4';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<Transaction> {
    if (!isUuid(id)) {
      throw new AppError('This id do not exists.');
    }

    const transactionsRepository = getRepository(Transaction);

    const transaction = await transactionsRepository.findOne({ id });

    if (!transaction) {
      throw new AppError('This transaction do not exists.');
    }

    const { affected } = await transactionsRepository.delete(id);

    if (!affected) {
      throw new AppError('Anyone transaction was delete.');
    }
    return transaction;
  }
}

export default DeleteTransactionService;
