import { AdminShell } from "@/component/AdminShell";
import { requireAdminAuth } from "@/lib/admin-auth";
import * as adminDashboard from "@/lib/admin-dashboard";

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

      <div className="mt-8 grid gap-4 md:grid-cols-3">
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
          label="Valor recebido"
          value={data.summary.totalReceivedLabel}
          helper="Somatorio dos pedidos pagos."
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

        <div className="mt-5 max-h-[46rem] space-y-4 overflow-y-auto pr-2">
          {data.paidOrders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
              Nenhum presente pago ainda.
            </p>
          ) : (
            data.paidOrders.map((order) => (
              <article
                key={order.publicId}
                className="rounded-[22px] border border-zinc-200 bg-[rgb(var(--paper))] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {order.guestName}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">{order.guestEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-zinc-900">
                      {order.paidLabel}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {order.paymentMethod || "Metodo nao informado"}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-sm text-zinc-700"
                    >
                      <span>
                        {item.quantity}x {item.title}
                      </span>
                      <span className="font-medium text-zinc-900">
                        {item.lineTotalLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))
          )}
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
