import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireRole } from "@/server/auth/current-user";
import { apiError, assertSameOrigin } from "@/server/http";
import { inviteStaff } from "@/server/services/staff-invitations";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const owner = await requireRole("OWNER");
    const invitation = await inviteStaff(owner.id, await request.json());
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "OWNER_CANNOT_BE_INVITED_AS_STAFF") {
      return NextResponse.json({ error: "This owner account cannot be invited as staff." }, { status: 409 });
    }

    return apiError(error);
  }
}
