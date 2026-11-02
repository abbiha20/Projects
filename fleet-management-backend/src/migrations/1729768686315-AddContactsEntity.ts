import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactsEntity1729768686315 implements MigrationInterface {
    name = 'AddContactsEntity1729768686315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`voice_mail\` (\`id\` varchar(36) NOT NULL, \`recordingUrl\` varchar(255) NOT NULL, \`transcription\` varchar(255) NOT NULL, \`duration\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`callId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`twilioCallSid\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`recordingUrl\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`status\` enum ('initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer') NOT NULL DEFAULT 'initiated'`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`duration\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`hasVoicemail\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`CREATE INDEX \`IDX_66e1a2bc01fbdf4094b81e989d\` ON \`call\` (\`conversationId\`, \`contactId\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_ce4f41219a370fbbac03a99f68\` ON \`call\` (\`twilioCallSid\`)`);
        await queryRunner.query(`ALTER TABLE \`voice_mail\` ADD CONSTRAINT \`FK_9646cd9aa3e0cc8826930256822\` FOREIGN KEY (\`callId\`) REFERENCES \`call\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`voice_mail\` DROP FOREIGN KEY \`FK_9646cd9aa3e0cc8826930256822\``);
        await queryRunner.query(`DROP INDEX \`IDX_ce4f41219a370fbbac03a99f68\` ON \`call\``);
        await queryRunner.query(`DROP INDEX \`IDX_66e1a2bc01fbdf4094b81e989d\` ON \`call\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`hasVoicemail\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`duration\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`recordingUrl\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`twilioCallSid\``);
        await queryRunner.query(`DROP TABLE \`voice_mail\``);
    }

}
