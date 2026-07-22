import { AdminShell } from "@/component/AdminShell";
import { AdminPaidOrdersList } from "@/component/AdminPaidOrdersList";
import { requireAdminAuth } from "@/lib/admin-auth";
import * as adminDashboard from "@/lib/admin-dashboard";

export const preferredRegion = "gru1";

export default async function AdminGiftsPage() {
  await requireAdminAuth();
  const getGiftsData = (
    adminDashboard as typeof adminDashboard & {
      getAdminGiftsData?: typeof adminDashboard.getAdminGiftsData;
    }
  ).getAdminGiftsData;
  const data = getGiftsData
    ? await getGiftsData()
    : await adminDashboard.getAdminDashboardData();

  return (
    <AdminShell title="Area dos Noivos">
      <div>
        <h1 className="text-[2.8rem] font-semibold tracking-[-0.05em] text-zinc-950">
          Presentes
        </h1>
        <p className="mt-2 max-w-3xl text-xl text-zinc-700">
          Aqui voces acompanham os presentes pagos e o valor total recebido.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Presentes pagos"
          value={String(data.summary.paidOrders)}
          helper="Pedidos com pagamento confirmado."
        />
        <MetricCard
          label="Itens pagos"
          value={String(data.summary.paidGiftUnits)}
          helper="Quantidade total de itens presenteados."
        />
        <MetricCard
          label="Valor dos presentes"
          value={data.summary.totalReceivedLabel}
          helper="Soma dos valores dos presentes escolhidos."
        />
        <MetricCard
          label="Pago no checkout"
          value={data.summary.totalCheckoutPaidLabel}
          helper="Valor bruto pago pelos convidados na InfinitePay."
        />
      </div>

      <section className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Pedidos pagos
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Historico dos presentes que ja tiveram pagamento confirmado.
          </p>
        </div>

        <div className="mt-5">
          <AdminPaidOrdersList orders={data.paidOrders} />
        </div>
      </section>
    </AdminShell>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-1 text-sm text-zinc-600">{helper}</p>
    </div>
  );
}
