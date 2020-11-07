import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactionsBalance = await transactionsRepository.all();
  return response.json(transactionsBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json({ ...transaction, category_id: undefined });
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  return response.status(204).json(null);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { path } = request.file;

    const importTransactionsService = new ImportTransactionsService();

    const transactions = await importTransactionsService.execute(path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
