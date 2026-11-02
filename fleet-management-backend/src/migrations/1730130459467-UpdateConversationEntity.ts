import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateConversationEntity1730130459467 implements MigrationInterface {
    name = 'UpdateConversationEntity1730130459467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` ADD \`count\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` DROP COLUMN \`count\``);
    }

}
