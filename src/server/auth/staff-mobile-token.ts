import { createHmac, timingSafeEqual } from "node:crypto";

import type { UserRole } from "@/generated/prisma/enums";

const accessTokenTtlSeconds = 15 * 60;

type StaffTokenPayload = {
  typ: "staff_access";
  sid: string;
  sub: string;
  role: Extract<UserRole, "OWNER" | "STAFF">;
  exp: number;
};

export class StaffMobileAuthError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createStaffAccessToken(payload: Omit<StaffTokenPayload, "typ" | "exp">, secret: string, now = Date.now()) {
  const body: StaffTokenPayload = {
    ...payload,
    typ: "staff_access",
    exp: Math.floor(now / 1000) + accessTokenTtlSeconds,
  };
  const encoded = b64url(JSON.stringify(body));
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifyStaffAccessToken(token: string, secret: string, now = Date.now()) {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) throw new StaffMobileAuthError("TOKEN_INVALID");
  const expected = sign(encoded, secret);
  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) throw new StaffMobileAuthError("TOKEN_INVALID");
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as StaffTokenPayload;
  if (payload.typ !== "staff_access" || payload.exp <= Math.floor(now / 1000)) {
    throw new StaffMobileAuthError("TOKEN_EXPIRED");
  }
  return payload;
}

export { accessTokenTtlSeconds };
