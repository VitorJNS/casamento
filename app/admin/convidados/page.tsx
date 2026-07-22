import { AdminShell } from "@/component/AdminShell";
import { AdminRsvpList } from "@/component/AdminRsvpList";
import { GuestListManager } from "@/component/GuestListManager";
import { requireAdminAuth } from "@/lib/admin-auth";
import * as adminDashboard from "@/lib/admin-dashboard";

export default async function AdminGuestsPage() {
  await requireAdminAuth();
  const getGuestsData = (
    adminDashboard as typeof adminDashboard & {
      getAdminGuestsData?: typeof adminDashboard.getAdminGuestsData;
    }
  ).getAdminGuestsData;
  const data = getGuestsData
    ? await getGuestsData()
    : await adminDashboard.getAdminDashboardData();

  return (
    <AdminShell title="Area dos Noivos">
      <div>
        <h1 className="text-[2.8rem] font-semibold tracking-[-0.05em] text-zinc-950">
          Lista de Convidados
        </h1>
        <p className="mt-2 max-w-3xl text-xl text-zinc-700">
          Cadastrem cada pessoa individualmente, organizem por familia ou grupo e acompanhem
          as respostas enviadas pelo formulario de confirmacao de presenca.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pessoas confirmadas"
          value={String(data.summary.confirmedGuests + data.summary.confirmedChildren)}
          helper={`${data.summary.confirmedGuests} adultos${
            data.summary.confirmedChildren > 0
              ? ` + ${data.summary.confirmedChildren} criancas`
              : ""
          }`}
        />
        <MetricCard
          label="Pessoas recusadas"
          value={String(data.summary.declinedGuests + data.summary.declinedChildren)}
          helper={`${data.summary.declinedRsvps} resposta${
            data.summary.declinedRsvps === 1 ? "" : "s"
          } negativa${data.summary.declinedRsvps === 1 ? "" : "s"} registrada${
            data.summary.declinedChildren > 0
              ? `s e ${data.summary.declinedChildren} criancas recusadas`
              : ""
          }`}
        />
        <MetricCard
          label="Pessoas pendentes"
          value={String(
            data.guestPresence.summary.pendingCountableGuests +
              data.guestPresence.summary.pendingChildren,
          )}
          helper={
            data.guestPresence.summary.pendingGuests > 0
              ? `${data.guestPresence.summary.pendingCountableGuests} adultos${
                  data.guestPresence.summary.pendingChildren > 0
                    ? ` + ${data.guestPresence.summary.pendingChildren} criancas`
                    : ""
                }`
              : "Sem convidados pendentes no momento."
          }
        />
        <MetricCard
          label="Total de respostas"
          value={String(data.summary.totalRsvps)}
          helper="Confirmacoes e recusas registradas."
        />
      </div>

      <section className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Confirmacoes de presenca
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Lista das respostas enviadas pelos convidados.
          </p>
        </div>

        <div className="mt-5">
          <AdminRsvpList rsvps={data.rsvps} />
        </div>
      </section>

      <div className="mt-6">
        <GuestListManager initialGuests={data.guestList} />
      </div>
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
