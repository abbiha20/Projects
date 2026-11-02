import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMessafeEntity1730207032094 implements MigrationInterface {
    name = 'UpdateMessafeEntity1730207032094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`message\` ADD \`isDelivered\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD \`deliveryError\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`message\` DROP COLUMN \`deliveryError\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP COLUMN \`isDelivered\``);
    }

}
