import { AdminShell } from "@/component/AdminShell";
import { GuestListManager } from "@/component/GuestListManager";
import { requireAdminAuth } from "@/lib/admin-auth";
import * as adminDashboard from "@/lib/admin-dashboard";

function formatAttendance(value: string) {
  return value === "confirmed" ? "Confirmado" : "Recusado";
}

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
          Acompanhem as respostas do RSVP e mantenham a lista-base de convidados sempre atualizada.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="RSVPs confirmados"
          value={String(data.summary.confirmedRsvps)}
          helper={`${data.summary.confirmedGuests} pessoas contaveis${
            data.summary.confirmedChildren > 0
              ? ` + ${data.summary.confirmedChildren} criancas`
              : ""
          }`}
        />
        <MetricCard
          label="RSVPs recusados"
          value={String(data.summary.declinedRsvps)}
          helper={`${data.summary.declinedGuests} pessoas contaveis${
            data.summary.declinedChildren > 0
              ? ` + ${data.summary.declinedChildren} criancas`
              : ""
          }`}
        />
        <MetricCard
          label="Pendentes"
          value={String(data.guestPresence.summary.pendingGuests)}
          helper="Convidados que ainda nao responderam."
        />
        <MetricCard
          label="Total na lista"
          value={String(data.guestList.length)}
          helper="Base ativa de convidados."
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

        <div className="mt-5 max-h-[42rem] space-y-4 overflow-y-auto pr-2">
          {data.rsvps.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
              Nenhuma confirmacao registrada ainda.
            </p>
          ) : (
            data.rsvps.map((rsvp) => (
              <article
                key={rsvp.id}
                className="rounded-[22px] border border-zinc-200 bg-[rgb(var(--paper))] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {rsvp.guestName}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      {formatAttendance(rsvp.attendance)} • {rsvp.countableGuestCount} pessoas contaveis
                      {rsvp.childCount > 0 ? ` + ${rsvp.childCount} criancas` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(rsvp.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">WhatsApp:</span>{" "}
                    {rsvp.whatsapp}
                  </p>
                  <p className="text-sm text-zinc-700">
                    <span className="font-medium text-zinc-900">Email:</span>{" "}
                    {rsvp.email || "Nao informado"}
                  </p>
                </div>
              </article>
            ))
          )}
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
