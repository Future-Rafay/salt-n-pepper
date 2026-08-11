import { getAuthEnv } from "@/config/env";

export const sessionMaxAgeSeconds = 30 * 24 * 60 * 60;

export function getSessionCookie() {
  const secure = new URL(getAuthEnv().NEXTAUTH_URL).protocol === "https:";

  return {
    name: secure ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
      maxAge: sessionMaxAgeSeconds,
    },
  };
}
