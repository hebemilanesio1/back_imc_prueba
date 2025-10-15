import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class Init7Users1695467880000 implements MigrationInterface {
    name = 'Init7Users1695467880000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const defaultPassword = '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Insertar los 7 usuarios
        await queryRunner.query(`
            INSERT INTO "users" (id, email, password) VALUES
            (1, 'hebe@gmail.com', '${hashedPassword}'),
            (2, 'lauri@gmail.com', '${hashedPassword}'),
            (3, 'fede@gmail.com', '${hashedPassword}'),
            (4, 'jime@gmail.com', '${hashedPassword}'),
            (5, 'juan@gmail.com', '${hashedPassword}'),
            (6, 'llanco@gmail.com', '${hashedPassword}'),
            (7, 'rama@gmail.com', '${hashedPassword}');
        `);

        // Registros de IMC de ejemplo
        await queryRunner.query(`
            INSERT INTO "imc" (peso, altura, imc, categoria, fecha, user_id) VALUES
            (70, 1.75, 22.86, 'Normal', NOW(), 1),
            (85, 1.80, 26.23, 'Sobrepeso', NOW(), 2),
            (60, 1.65, 22.04, 'Normal', NOW(), 3),
            (95, 1.70, 32.87, 'Obeso', NOW(), 4),
            (72, 1.78, 22.72, 'Normal', NOW(), 5),
            (80, 1.82, 24.15, 'Normal', NOW(), 6),
            (68, 1.70, 23.53, 'Normal', NOW(), 7);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "imc" WHERE user_id BETWEEN 1 AND 7;`);
        await queryRunner.query(`DELETE FROM "users" WHERE id BETWEEN 1 AND 7;`);
        await queryRunner.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
    }
}
