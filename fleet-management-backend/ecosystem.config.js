module.exports = {
  apps: [
    {
      name: 'emittr-backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        DATABASE_HOST: 'emittr.czc80ae6kjp4.eu-north-1.rds.amazonaws.com',
        DATABASE_USERNAME: 'admin',
        DATABASE_PASSWORD: '8hPaNLRDMSEzLou8ygzj',
        DATABASE_PORT: '3306',
        DATABASE_NAME: 'emittr',
        JWT_SECRET: 'v6IokoecgG1XCzGfk71uVgtgLrsi0JcM',
        BASE_URL: 'https://emittr.choosemaid.com',
        EMAIL_SERVICE: 'Gmail',
        EMAIL_USER: 'casecelerate@gmail.com',
        EMAIL_PASS: 'smaplepass',
	TWILIO_ACCOUNT_SID: "YOUR_TWILIO_ACCOUNT_SID",
	TWILIO_API_KEY: "YOUR_TWILIO_API_KEY",
	TWILIO_AUTH_TOKEN: "YOUR_TWILIO_AUTH_TOKEN",
        TWILIO_PHONE_NUMBER: '+16232992510',
        TWILIO_TWIML_BIN_URL:
          'https://handler.twilio.com/twiml/EH350ca4ce82be4fa155d5e61eb79e8947',
        TWILIO_WEBHOOK_BASE_URL: 'https://emittr.choosemaid.com',
        TWILIO_API_KEY_SID: "YOUR_TWILIO_API_KEY_SID",
	TWILIO_API_SECRET: "YOUR_TWILIO_API_SECRET",
	TWILIO_TWIML_APP_SID: "YOUR_TWILIO_TWIML_APP_SID",
        TWILIO_ANDROID_PUSH_CREDENTIAL_SID:
          'CRc502d7c1cc1bac46f3c6dacadd9e6304',
        TWILIO_REGION: 'gll',
        TWILIO_RECORDING_ENABLED: false,
        TWILIO_CALL_MONITORING: false,
        TWILIO_MAX_CALL_DURATION: 14400,
        FCM_PROJECT_ID: 'emiterr-f1343',
        FRONTEND_URL: 'https://textology.net',
        ACCESS_SECRET: 'dbQwqe9sFaKUaRfOmhtxodja2M/jx0/oUG1l/3IZ',
        ENCRYPTION_KEY:
          '70a901f2896ac2ef91b32fdbfdf800416cd0f978db381388090d7d41fc29340f',
        ENCRYPTION_IV: '0917fc6ba19146dd4c1837569dc8dde6',

        BUCKET: 'emittr-dev',
        S3_REGION: 'eu-north-1',
        FCM_PRIVATE_KEY:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFs94fGO8QvvQX\nbs5dMaaaJXExzCwA7TRgxKUqD7Fpfygv+YhhwcwfICYnJlkLenWzkrJJU82dp+ix\nnQs10Oc+KPiWfXUL237HT7OpfdoR377viFyeBzYM+wc2mTaRd9kyWkg169mAFl1i\n98VZ/8ycObA5QeMTbAtvnbu5dqXEjg5YeEzIN41QVmdDtIHNTdS/JPlZy4G93nv+\nj4EhnyElSAvoUEMCVesy7hizI/M/lESmSWVXT/6lRS6peeKQsebY0VgWOqv4nHSZ\nGLa9fNvXhBWLesaNLduVHcWvh1S4R+rBotURJXgIdy2ZYDfVQz64x2xY/gUpUso+\nGmLLVIYpAgMBAAECggEACBfS0Pl9iCqASz5w10Q3WSzNH2WHtnIqCwfjE3pWOsF2\n7jopVN12MHQpqlVcaeGq1GL9+6NhDHIWzquFOEAg8TdZOsQwELV85nuQTnDy5qOp\nmScJvznVbXlatvJVbKXIHT1bIqLw8cMonOrT4uPmQY3D1XTezu5vtuixSjhYSkLB\nzebD7r/u9yl0fav230+AVwY4/MvviKwYkWQUqQN/EeNMhd7sFVLE+VsJKUcfsLB3\naculPVZtZlqHl1Ng0UR4NkQIAtANgWN5VjueEITWpWW0af9c882wOJZM8TZyyv9L\nKN7tPmFAN8OtJVxhYpaJbESnlPH/xE183zvcx4ehgQKBgQDxvk639i+OxeukI39U\nQceFejvbki8bnwS214p8THnc8MAZw4H8BZpLPXwpBm9GMcMkI8HvPThNhsk/rfBd\nrmb8XO7i9paeEWVxY1dxmSl72rd6uEX4TM+rN3TMJaZWqbxwedNKKq0Mo5KZxh5A\nQT731SM1CB//0wgS0a7QvEXeqQKBgQDRXKjeGZFIkWHu1FGkParl4ELfWO+ALDCF\nwcwjTqjmAH+Oohn0wcSBr5IVjzd66DqpuRfzxo7B0bH53dwN47dq9uS3n9wBZHix\nmHt7yEulVmda6oLAS7vTCizASJWOV3CSwr002uqx8zPXvjLQqyLrJ5dVFxrTJs12\nDK9BiDebgQKBgQCDnHh+7yk1Mcv4sNrBpI5bvRCZmhzLjOekI/Thd0FhaDEt1aMO\n8n3uOKtAKqCqNq1nH5CWD1531sn6QVh7qFepTW9BYb7ej9oKwWr6DcjoBUufJHPz\nmt30+Vw9SMImrIJLOggueM199A/8aEBP+zWs9/0TAjlprhrXJBFo0xe3AQKBgDo9\nc4BtTlwIjVy51YhB22OdMh0diWp3YHwlABumSxfIdbOA5oWOzZJh+9phf8aCCaej\nJMWcq6PBKKhgjlGS0jhAPDnUj4gXofeNenRhsKFq2s+QwxSpPLOldfN7fZcePeOl\npqqoZ3dfN0HB2DLyGIGf/tod1kl81tULDEnHkeiBAoGAe1vFi1e8P/5fxjrkfVuH\nc7WAUkPaKE2JV5BFUfFPwlYVB3gMdGpsQGz0tuwxm7HdKRfMkqWaW4sAHml5Enal\nXPxnnAd0LT8ZU1B2dmoNtPZ1uGpIcSakYlvQVvQNi9ea/K24LAUNoVPF1wUvcjbe\nprZKPliUQ28jNtGR3kiN5QE=\n-----END PRIVATE KEY-----\n',
        FCM_CLIENT_EMAIL:
          'firebase-adminsdk-46dhc@emiterr-f1343.iam.gserviceaccount.com',
      },
    },
  ],
};
