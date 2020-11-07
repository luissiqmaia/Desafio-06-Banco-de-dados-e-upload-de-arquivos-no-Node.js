import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class Transactions1604715850919 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            enum: ['income', 'outcome'],
            isNullable: false,
          },
          {
            name: 'value',
            type: 'real',
            isNullable: false,
          },
          {
            name: 'category_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'TransactionsForeignKeyWithCategories',
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
            onDelete: 'SET NULL', // Excluindo uma categoria não se exclui as transações vinculadas a ela,
            onUpdate: 'CASCADE', // Atualizando o Id de uma categoria, atualiza-se nas transações vinculadas a ela
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'transactions',
      'TransactionsForeignKeyWithCategories',
    );

    await queryRunner.dropTable('transactions');
  }
}
