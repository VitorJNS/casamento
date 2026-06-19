import { CerimonialDashboard } from "@/component/CerimonialDashboard";
import { requireCerimonialAuth } from "@/lib/cerimonial-auth";
import { getPresenceDashboardData } from "@/lib/presence-dashboard";

export const dynamic = "force-dynamic";

export default async function CerimonialDashboardPage() {
  await requireCerimonialAuth();
  const data = await getPresenceDashboardData();

  return <CerimonialDashboard guests={data.guests} summary={data.summary} />;
}
