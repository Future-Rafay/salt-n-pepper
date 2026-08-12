import assert from "node:assert/strict";
import test from "node:test";

import { assertProductionEnvironment } from "@/config/env";

const valid = {
  DATABASE_URL: "mysql://app:secret@db.example.com:3306/saltnpepper?sslaccept=strict",
  DATABASE_SSL: "true",
  AUTH_SECRET: "a-production-secret-with-32-characters",
  NEXTAUTH_URL: "https://saltnpepper.ch",
  GOOGLE_CLIENT_ID: "client.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "google-secret",
  AWS_REGION: "eu-central-1",
  AWS_ACCESS_KEY_ID: "AKIAEXAMPLE",
  AWS_SECRET_ACCESS_KEY: "aws-secret",
  S3_BUCKET_NAME: "saltnpepper-production",
  S3_PUBLIC_BASE_URL: "https://assets.saltnpepper.ch",
  RESEND_API_KEY: "re_live_example",
  EMAIL_FROM: "SaltNPepper <no-reply@saltnpepper.ch>",
  APP_URL: "https://saltnpepper.ch",
  STRIPE_SECRET_KEY: "sk_live_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example",
};

test("production environment accepts managed TLS configuration with the resilient pool default", () => {
  const environment = assertProductionEnvironment(valid);
  assert.equal(environment.DATABASE_SSL, true);
  assert.equal(environment.DATABASE_CONNECTION_LIMIT, 10);
});

test("production environment rejects local, placeholder, and test payment values", () => {
  assert.throws(() => assertProductionEnvironment({
    ...valid,
    DATABASE_URL: "mysql://saltnpepper:change-me@127.0.0.1:3306/saltnpepper_dev",
    DATABASE_SSL: "false",
    STRIPE_SECRET_KEY: "sk_test_placeholder",
  }));
});
