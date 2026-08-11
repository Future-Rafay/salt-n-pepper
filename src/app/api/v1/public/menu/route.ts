import { getPublicMenu } from "@/server/services/catalog";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "EN" : "DE";
  return Response.json({ categories: await getPublicMenu(locale) });
}
