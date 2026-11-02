// src/config/configuration.ts

import { join } from 'path';

export default () => ({
  database: {
    type: 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME || 'emiterrdb',
    entities: [join(__dirname, '..', 'entities', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'migrations', '**', '*.{ts,js}')],
    cli: {
      entitiesDir: 'src/entities',
      migrationsDir: 'src/migrations',
    },
  },
  jwt: {
    memberSecret: process.env.JWT_MEMBER_SECRET,
    ownerSecret: process.env.JWT_OWNER_SECRET,
  },
  url: {
    baseUrl: process.env.BASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
  },
  fcm: {
    projectId: process.env.FCM_PROJECT_ID,
    privateKey: process.env.FCM_PRIVATE_KEY,
    clientEmail: process.env.FCM_CLIENT_EMAIL,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    webhookBaseUrl: process.env.TWILIO_WEBHOOK_BASE_URL,
    apiKeySid: process.env.TWILIO_API_KEY_SID,
    apiSecret: process.env.TWILIO_API_SECRET,
    twimlAppSid: process.env.TWILIO_TWIML_APP_SID,
    pushCredentials: {
      android: process.env.TWILIO_ANDROID_PUSH_CREDENTIAL_SID,
    },
    region: process.env.TWILIO_REGION || 'gll',
    callSettings: {
      recordingEnabled: process.env.TWILIO_RECORDING_ENABLED === 'true',
      monitoringEnabled: process.env.TWILIO_CALL_MONITORING === 'true',
      maxCallDuration:
        parseInt(process.env.TWILIO_MAX_CALL_DURATION, 10) || 14400,
      audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    },
  },
  s3: {
    region: process.env.S3_REGION,
    bucket: process.env.BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    iv: process.env.ENCRYPTION_IV,
  },
});
