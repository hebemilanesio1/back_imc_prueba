import { MigrationInterface, QueryRunner } from "typeorm";

export class InitImc1757551585726 implements MigrationInterface {
    name = 'InitImc1757551585726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "imc" ("id" SERIAL NOT NULL, "peso" double precision NOT NULL, "altura" double precision NOT NULL, "imc" double precision NOT NULL, "categoria" character varying NOT NULL, "fecha" TIMESTAMP NOT NULL, CONSTRAINT "PK_b2f38b824da5846f543dcee14cc" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "imc"`);
    }

}
