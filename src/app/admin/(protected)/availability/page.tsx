import { adminAction } from "@/app/admin/(protected)/actions";
import { AdminPage, Empty, Notice } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMenuAdminData } from "@/server/services/admin";

export default async function AvailabilityPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ products }, feedback] = await Promise.all([getMenuAdminData(), searchParams]);
  const returnTo = "/admin/availability";
  return <AdminPage title="Product availability" description="Quickly update sold-out status."><Notice {...feedback} />{products.length === 0 ? <Empty>No products.</Empty> : <Card className="overflow-hidden p-0"><ul className="divide-y divide-border">{products.map((product) => <li key={product.id} className="flex min-h-16 items-center gap-3 px-4 py-3"><div className="min-w-0 flex-1"><h2 className="truncate font-semibold">{product.nameEn}</h2><p className={`text-sm ${product.available ? "text-success" : "text-destructive"}`}>{product.available ? "Available" : "Sold out"}</p></div><form action={adminAction}><input type="hidden" name="intent" value="product_availability" /><input type="hidden" name="id" value={product.id} /><input type="hidden" name="available" value={String(!product.available)} /><input type="hidden" name="returnTo" value={returnTo} /><Button type="submit" variant={product.available ? "outline" : "secondary"}>{product.available ? "Mark sold out" : "Mark available"}</Button></form></li>)}</ul></Card>}</AdminPage>;
}
