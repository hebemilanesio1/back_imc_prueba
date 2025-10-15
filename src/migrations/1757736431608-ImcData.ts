import { MigrationInterface, QueryRunner } from "typeorm";

export class ImcData1757736431608  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "imc" ("peso", "altura", "imc", "categoria", "fecha") VALUES
      (60, 1.70, 20.76, 'Normal', '2025-09-01T10:00:00'),
      (85, 1.75, 27.76, 'Sobrepeso', '2025-09-02T11:00:00'),
      (45, 1.60, 17.58, 'Bajo Peso', '2025-09-03T12:00:00'),
      (95, 1.80, 29.32, 'Sobrepeso', '2025-09-04T13:00:00'),
      (120, 1.75, 39.18, 'Obeso', '2025-09-05T14:00:00'),
      (70, 1.70, 24.22, 'Normal', '2025-09-06T15:00:00'),
      (52, 1.65, 19.10, 'Normal', '2025-09-07T16:00:00'),
      (78, 1.68, 27.62, 'Sobrepeso', '2025-09-08T17:00:00'),
      (100, 1.80, 30.86, 'Obeso', '2025-09-09T18:00:00'),
      (65, 1.75, 21.22, 'Normal', '2025-09-10T19:00:00');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "imc"`);
  }
}
