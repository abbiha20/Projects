import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMessageEntity1730210092619 implements MigrationInterface {
    name = 'UpdateMessageEntity1730210092619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` ADD \`block\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` DROP COLUMN \`block\``);
    }

}
