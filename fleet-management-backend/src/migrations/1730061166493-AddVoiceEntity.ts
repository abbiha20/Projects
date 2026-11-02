import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVoiceEntity1730061166493 implements MigrationInterface {
    name = 'AddVoiceEntity1730061166493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`recordingSid\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`recordingStatus\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`recordingDuration\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`recordingChannels\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`recordingSource\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`answeredBy\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`machineDuration\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`call\` ADD \`isRecordingEnabled\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`isRecordingEnabled\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`machineDuration\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`answeredBy\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`recordingSource\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`recordingChannels\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`recordingDuration\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`recordingStatus\``);
        await queryRunner.query(`ALTER TABLE \`call\` DROP COLUMN \`recordingSid\``);
    }

}
