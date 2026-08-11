import { cookies } from "next/headers";
import { ZodError } from "zod";

import { createCredentialsSession } from "@/server/auth/credentials";
import { registerCustomer } from "@/server/auth/customer";
import { getSessionCookie } from "@/server/auth/session-cookie";
import { assertSameOrigin } from "@/server/http";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const input = await request.json();
    await registerCustomer(input);
    const session = await createCredentialsSession(input);
    if (!session) throw new Error("SESSION_FAILED");
    (await cookies()).set(getSessionCookie().name, session.sessionToken, { ...getSessionCookie().options, expires: session.expires });
    return Response.json({ user: session.user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
    if (error instanceof Error && error.message === "EMAIL_IN_USE") return Response.json({ error: "EMAIL_IN_USE" }, { status: 409 });
    throw error;
  }
}
