import { getPublicConfig } from "@/server/services/catalog";

export async function GET() {
  return Response.json(await getPublicConfig());
}
