import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskEntity1729753325810 implements MigrationInterface {
    name = 'AddTaskEntity1729753325810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task\` DROP COLUMN \`status\``);
    }

}
