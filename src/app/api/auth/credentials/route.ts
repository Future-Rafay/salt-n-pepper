import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getEmailEnv } from "@/config/env";
import { createCredentialsSession } from "@/server/auth/credentials";
import { getSessionCookie } from "@/server/auth/session-cookie";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(getEmailEnv().APP_URL).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const result = await createCredentialsSession(await request.json());
    if (!result) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const sessionCookie = getSessionCookie();
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, result.sessionToken, {
      ...sessionCookie.options,
      expires: result.expires,
    });

    return NextResponse.json({ user: result.user });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }

    throw error;
  }
}
