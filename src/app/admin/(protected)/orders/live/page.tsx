import { AdminQueue } from "@/components/admin/admin-queue";
import { getAdminOrders } from "@/server/services/ordering";

export default async function LiveQueuePage() {
  return <AdminQueue orders={await getAdminOrders()} />;
}
