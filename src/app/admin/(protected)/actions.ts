"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError, z } from "zod";

import { requireRole } from "@/server/auth/current-user";
import {
  AdminError, cancelOrder, deleteAvailabilityWindow, deletePostalCode, deleteScheduleEntity, refundOrder,
  saveAvailabilityWindow, saveCategory, saveFulfillment, saveOpeningWindow, saveOptionChoice, saveOptionGroup,
  savePostalCode, savePromo, saveServiceException, saveSiteSettings, saveZone, setStaffActive,
} from "@/server/services/admin";
import { deleteManagedMenuEntity, saveManagedProduct, saveManagedVariant } from "@/server/services/menu-admin";
import { setProductAvailability } from "@/server/services/ordering";
import { inviteStaff } from "@/server/services/staff-invitations";
import {
  availabilityWindowSchema, cancelOrderSchema, categorySchema, fulfillmentSchema, openingWindowSchema,
  optionChoiceSchema, optionGroupSchema, postalCodeSchema, productSchema, promoSchema, refundSchema,
  serviceExceptionSchema, siteSettingsSchema, variantSchema, zoneSchema,
} from "@/server/validators/admin";
import { inviteStaffSchema } from "@/server/validators/staff-invitation";

const idSchema = z.string().trim().min(1).max(191);
const menuKindSchema = z.enum(["category", "product", "variant", "optionGroup", "optionChoice"]);

function values(formData: FormData) {
  const input = Object.fromEntries([...formData.entries()].filter(([, value]) => typeof value === "string"));
  const selectedAllergens = formData.getAll("allergen-checkbox").filter((value): value is string => typeof value === "string");
  if (selectedAllergens.length) input.allergenIds = selectedAllergens.join(",");
  return input;
}

function safeReturnTo(formData: FormData) {
  const value = formData.get("returnTo");
  return typeof value === "string" && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

function errorCode(error: unknown) {
  if (error instanceof AdminError) return error.code;
  if (error instanceof ZodError) return error.issues[0]?.message || "INVALID_INPUT";
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "ALREADY_EXISTS";
    if (error.code === "P2025") return "NOT_FOUND";
    if (error.code === "P2003") return "IN_USE";
  }
  if (error instanceof Error && ["OWNER_CANNOT_BE_INVITED_AS_STAFF", "FORBIDDEN"].includes(error.message)) return error.message;
  return "ACTION_FAILED";
}

export async function adminAction(formData: FormData) {
  const returnTo = safeReturnTo(formData);
  let warning = "";
  try {
    const input = values(formData);
    const intent = z.string().min(1).parse(input.intent);
    const ownerOnly = !["product_availability", "cancel_order", "refund"].includes(intent);
    const actor = await requireRole(...(ownerOnly ? ["OWNER" as const] : ["OWNER" as const, "STAFF" as const]));
    switch (intent) {
      case "category": await saveCategory(actor.id, categorySchema.parse(input)); break;
      case "product": await saveManagedProduct(actor.id, productSchema.parse(input)); break;
      case "variant": await saveManagedVariant(actor.id, variantSchema.parse(input)); break;
      case "option_group": await saveOptionGroup(actor.id, optionGroupSchema.parse(input)); break;
      case "option_choice": await saveOptionChoice(actor.id, optionChoiceSchema.parse(input)); break;
      case "availability_window": await saveAvailabilityWindow(actor.id, availabilityWindowSchema.parse(input)); break;
      case "delete_menu": await deleteManagedMenuEntity(actor.id, menuKindSchema.parse(input.kind), idSchema.parse(input.id)); break;
      case "delete_availability_window": await deleteAvailabilityWindow(actor.id, idSchema.parse(input.id)); break;
      case "product_availability": await setProductAvailability(idSchema.parse(input.id), input.available === "true", actor.id); break;
      case "fulfillment": await saveFulfillment(actor.id, fulfillmentSchema.parse(input)); break;
      case "opening_window": await saveOpeningWindow(actor.id, openingWindowSchema.parse(input)); break;
      case "service_exception": await saveServiceException(actor.id, serviceExceptionSchema.parse(input)); break;
      case "delete_schedule": await deleteScheduleEntity(actor.id, z.enum(["window", "exception"]).parse(input.kind), idSchema.parse(input.id)); break;
      case "zone": await saveZone(actor.id, zoneSchema.parse(input)); break;
      case "postal_code": await savePostalCode(actor.id, postalCodeSchema.parse(input)); break;
      case "delete_postal_code": await deletePostalCode(actor.id, idSchema.parse(input.id)); break;
      case "site_settings": await saveSiteSettings(actor.id, siteSettingsSchema.parse(input)); break;
      case "promo": await savePromo(actor.id, promoSchema.parse(input)); break;
      case "invite_staff": { const result = await inviteStaff(actor.id, inviteStaffSchema.parse(input)); if (!result.emailSent) warning = "INVITATION_SAVED_EMAIL_FAILED"; break; }
      case "staff_active": await setStaffActive(actor.id, idSchema.parse(input.id), input.active === "true"); break;
      case "cancel_order": { const parsed = cancelOrderSchema.parse(input); await cancelOrder(actor.id, parsed.orderNumber, parsed.reason); break; }
      case "refund": await refundOrder(actor.id, refundSchema.parse(input)); break;
      default: throw new AdminError("UNKNOWN_ACTION");
    }
    revalidatePath("/admin", "layout");
  } catch (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(errorCode(error))}`);
  }
  redirect(`${returnTo}?saved=1${warning ? `&warning=${warning}` : ""}`);
}
