import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactsEntity1730231372209 implements MigrationInterface {
    name = 'AddContactsEntity1730231372209'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` ADD \`assignTeam\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`conversation\` ADD \`assignedTeamId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`conversation\` ADD CONSTRAINT \`FK_58e9de6833ee5c2cfcc29fee1d7\` FOREIGN KEY (\`assignedTeamId\`) REFERENCES \`team\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`conversation\` DROP FOREIGN KEY \`FK_58e9de6833ee5c2cfcc29fee1d7\``);
        await queryRunner.query(`ALTER TABLE \`conversation\` DROP COLUMN \`assignedTeamId\``);
        await queryRunner.query(`ALTER TABLE \`conversation\` DROP COLUMN \`assignTeam\``);
    }

}
