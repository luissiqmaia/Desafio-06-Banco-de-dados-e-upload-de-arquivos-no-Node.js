/* eslint-disable func-names */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-useless-return */
import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';
import { getRepository, In } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface TransactionModel {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface TransactionsCategories {
  transactions: TransactionModel[];
  categories: string[];
}

class ImportTransactionsService {
  async execute(
    filePath = 'file.csv',
  ): Promise<{ transactions: Transaction[] }> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const csvFilePath = path.resolve(__dirname, '..', 'tmp', filePath);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 1,
      ltrim: true,
      rtrim: true,
      columns: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: TransactionModel[] = [];
    const categories: string[] = [];

    parseCSV.on('data', transaction => {
      const { title, type, value, category } = transaction;

      if (!title || !type || !value || !category) return;

      transactions.push({ title, type, value, category });
      categories.includes(category) ? null : categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', () => resolve('Transação finalizada!'));
    });

    const existingCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const categoriesTitleToCreate = categories
      .filter(catCSV => {
        return !existingCategories.map(catDB => catDB.title).includes(catCSV);
      })
      .reduce((acc: string[], next) => {
        return acc.includes(next) ? acc : [...acc, next];
      }, []);

    const categoriesCreated = categoriesRepository.create(
      categoriesTitleToCreate.map(title => {
        return {
          title,
        };
      }),
    );

    await categoriesRepository.save(categoriesCreated);

    const finalCategories = [...categoriesCreated, ...existingCategories];

    const transactionsCreated = transactionsRepository.create(
      transactions.map(t => ({
        type: t.type,
        title: t.title,
        value: t.value,
        category: finalCategories.find(c => c.title === t.category),
      })),
    );

    await fs.promises.unlink(filePath);

    await transactionsRepository.save(transactionsCreated);

    return { transactions: transactionsCreated };
  }
}

export default ImportTransactionsService;
