import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class ChangeFieldValueInTransactions1604761187798
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transactions',
      'value',
      new TableColumn({
        name: 'value',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'transactions',
      'value',
      new TableColumn({
        name: 'value',
        type: 'real',
        isNullable: false,
      }),
    );
  }
}
