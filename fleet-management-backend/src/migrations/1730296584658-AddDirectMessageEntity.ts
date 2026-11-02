import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDirectMessageEntity1730296584658 implements MigrationInterface {
    name = 'AddDirectMessageEntity1730296584658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`direct_message\` (\`id\` varchar(36) NOT NULL, \`content\` text NOT NULL, \`fileURLs\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`isRead\` tinyint NOT NULL DEFAULT 0, \`messageType\` enum ('message', 'reply') NOT NULL DEFAULT 'message', \`senderId\` varchar(36) NULL, \`receiverId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`direct_message\` ADD CONSTRAINT \`FK_ef4a6edf9cbba6b2ec249243382\` FOREIGN KEY (\`senderId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`direct_message\` ADD CONSTRAINT \`FK_ca2481679ba6f268b7db58042bc\` FOREIGN KEY (\`receiverId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`direct_message\` DROP FOREIGN KEY \`FK_ca2481679ba6f268b7db58042bc\``);
        await queryRunner.query(`ALTER TABLE \`direct_message\` DROP FOREIGN KEY \`FK_ef4a6edf9cbba6b2ec249243382\``);
        await queryRunner.query(`DROP TABLE \`direct_message\``);
    }

}
