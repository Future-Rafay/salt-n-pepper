import { createHash, randomBytes } from "node:crypto";

import { hash } from "bcryptjs";
import type { z } from "zod";

import { getEmailEnv } from "@/config/env";
import { prisma } from "@/server/db";
import { sendEmail } from "@/server/email/client";
import { staffInvitationEmail } from "@/server/email/templates";
import { acceptStaffInvitationSchema, inviteStaffSchema } from "@/server/validators/staff-invitation";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function inviteStaff(ownerId: string, input: z.input<typeof inviteStaffSchema>) {
  const { email } = inviteStaffSchema.parse(input);
  const owner = await prisma.user.findFirst({ where: { id: ownerId, role: "OWNER", active: true }, select: { id: true } });
  if (!owner) throw new Error("FORBIDDEN");
  const existingUser = await prisma.user.findUnique({ where: { email }, select: { role: true } });
  if (existingUser?.role === "OWNER") throw new Error("OWNER_CANNOT_BE_INVITED_AS_STAFF");

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await prisma.$transaction(async (tx) => {
    await tx.staffInvitation.deleteMany({ where: { email, acceptedAt: null } });
    const invitation = await tx.staffInvitation.create({ data: { email, tokenHash: hashToken(token), invitedByUserId: owner.id, expiresAt } });
    await tx.auditLog.create({ data: { actorUserId: owner.id, action: "STAFF_INVITED", entityType: "StaffInvitation", entityId: invitation.id, metadata: { email } } });
  });

  const invitationUrl = `${getEmailEnv().APP_URL}/admin/invitations/accept?token=${encodeURIComponent(token)}`;
  try {
    await sendEmail({ to: email, ...staffInvitationEmail({ invitationUrl }) });
    return { email, expiresAt, emailSent: true };
  } catch (error) {
    console.warn("Staff invitation saved but email delivery failed:", error instanceof Error ? error.message : "Unknown email error");
    return { email, expiresAt, emailSent: false };
  }
}

export async function acceptStaffInvitation(input: z.input<typeof acceptStaffInvitationSchema>) {
  const values = acceptStaffInvitationSchema.parse(input);
  const tokenHash = hashToken(values.token);
  const passwordHash = await hash(values.password, 12);
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.staffInvitation.findUnique({ where: { tokenHash } });
    if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) throw new Error("INVALID_OR_EXPIRED_INVITATION");
    const existingUser = await tx.user.findUnique({ where: { email: invitation.email }, select: { role: true } });
    if (existingUser?.role === "OWNER") throw new Error("OWNER_CANNOT_BE_CONVERTED_TO_STAFF");
    const user = await tx.user.upsert({
      where: { email: invitation.email },
      create: { email: invitation.email, name: values.name, passwordHash, role: "STAFF", active: true },
      update: { name: values.name, passwordHash, role: "STAFF", active: true },
      select: { id: true, email: true, name: true, role: true },
    });
    await tx.staffInvitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });
    await tx.auditLog.create({ data: { actorUserId: user.id, action: "STAFF_INVITATION_ACCEPTED", entityType: "StaffInvitation", entityId: invitation.id } });
    return user;
  });
}
