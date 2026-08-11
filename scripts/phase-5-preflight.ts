import "dotenv/config";

import { assertProductionEnvironment } from "../src/config/env";

const env = assertProductionEnvironment();

console.log("Phase 5 production environment preflight passed.", {
  appOrigin: new URL(env.APP_URL).origin,
  awsRegion: env.AWS_REGION,
  databaseTls: env.DATABASE_SSL,
  databaseConnectionLimit: env.DATABASE_CONNECTION_LIMIT,
  s3Bucket: env.S3_BUCKET_NAME,
});
