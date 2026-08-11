import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { getS3Env } from "@/config/env";

const uploadInputSchema = z.object({
  contentType: z.enum(["image/avif", "image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().positive().max(10 * 1024 * 1024),
  scope: z.enum(["brand", "menu", "products"]),
});

const extensions = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

let client: S3Client | undefined;

function getS3Client() {
  if (!client) {
    const env = getS3Env();
    client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return client;
}

export async function createImageUploadUrl(input: z.input<typeof uploadInputSchema>) {
  const values = uploadInputSchema.parse(input);
  const env = getS3Env();
  const key = `${values.scope}/${randomUUID()}.${extensions[values.contentType]}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: values.contentType,
    ContentLength: values.size,
  });

  return {
    key,
    publicUrl: `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`,
    uploadUrl: await getSignedUrl(getS3Client(), command, { expiresIn: 300 }),
  };
}

export function resolvePublicImageUrl(key: string | null | undefined) {
  if (!key) return null;
  if (/^https?:\/\//i.test(key) || key.startsWith("/")) return key;
  return `${getS3Env().S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}
