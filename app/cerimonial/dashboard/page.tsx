import { CerimonialLogoutButton } from "@/component/CerimonialLogoutButton";
import { requireCerimonialAuth } from "@/lib/cerimonial-auth";
import { getPresenceDashboardData } from "@/lib/presence-dashboard";

export const dynamic = "force-dynamic";

function formatStatus(status: "confirmed" | "declined" | "pending") {
  if (status === "confirmed") return "Confirmado";
  if (status === "declined") return "Recusado";
  return "Falta confirmar";
}

function getStatusClasses(status: "confirmed" | "declined" | "pending") {
  if (status === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "declined") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default async function CerimonialDashboardPage() {
  await requireCerimonialAuth();
  const data = await getPresenceDashboardData();
  const pendingGuests = data.guests.filter((guest) => guest.status === "pending");
  const confirmedGuests = data.guests.filter((guest) => guest.status === "confirmed");
  const declinedGuests = data.guests.filter((guest) => guest.status === "declined");

  function renderGuestCard(guest: (typeof data.guests)[number]) {
    return (
      <article
        key={guest.id}
        className="rounded-[22px] border border-zinc-200 bg-[rgb(var(--paper))] p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {guest.guestName}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">{guest.whatsapp}</p>
          </div>

          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(guest.status)}`}
          >
            {formatStatus(guest.status)}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Status
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {formatStatus(guest.status)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Total
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {guest.countableGuestCount !== null
                  ? `${guest.countableGuestCount} ${
                      guest.countableGuestCount === 1
                        ? "pessoa contável"
                        : "pessoas contáveis"
                    }`
                  : "Sem resposta"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Crianças
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {guest.guestCount !== null ? guest.childCount : "Sem resposta"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Resposta
            </p>
            <p className="mt-1 break-words text-sm text-zinc-700">
              {guest.respondedAt
                ? new Date(guest.respondedAt).toLocaleString("pt-BR")
                : "Ainda nao respondeu"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Email
            </p>
            <p className="mt-1 break-all text-sm text-zinc-700">
              {guest.email || "Nao informado"}
            </p>
          </div>
        </div>

        {guest.companionNames.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-900">Acompanhantes</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {guest.companionNames.map((name) => (
                <li
                  key={`${guest.id}-${name}`}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {guest.responseNote || guest.note ? (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-700">
            {guest.responseNote || guest.note}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-10">
      <div className="rounded-[32px] border border-zinc-200 bg-white/88 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Area da cerimonialista
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              Confirmacao de presenca
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Acompanhe quem ja respondeu, quem recusou e quem ainda precisa de contato.
            </p>
          </div>

          <CerimonialLogoutButton />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Total de convidados
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.totalGuests}
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Ja confirmaram
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.confirmedGuests}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {data.summary.confirmedCountableGuests} pessoas contáveis
              {data.summary.confirmedChildren > 0
                ? ` + ${data.summary.confirmedChildren} ${
                    data.summary.confirmedChildren === 1 ? "crianca" : "criancas"
                  }`
                : ""}
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Nao comparecem
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.declinedGuests}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {data.summary.declinedCountableGuests} pessoas contáveis
              {data.summary.declinedChildren > 0
                ? ` + ${data.summary.declinedChildren} ${
                    data.summary.declinedChildren === 1 ? "crianca" : "criancas"
                  }`
                : ""}
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Faltam responder
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.pendingGuests}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Falta confirmar
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Convidados que ainda precisam de contato.
            </p>

            <div className="mt-5 max-h-[42rem] space-y-4 overflow-y-auto pr-2">
              {pendingGuests.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
                  Ninguem pendente no momento.
                </p>
              ) : (
                pendingGuests.map(renderGuestCard)
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Ja confirmaram
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Respostas positivas ja registradas.
            </p>

            <div className="mt-5 max-h-[42rem] space-y-4 overflow-y-auto pr-2">
              {confirmedGuests.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
                  Nenhuma confirmacao ainda.
                </p>
              ) : (
                confirmedGuests.map(renderGuestCard)
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Nao comparecem
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Respostas negativas ja registradas.
            </p>

            <div className="mt-5 max-h-[42rem] space-y-4 overflow-y-auto pr-2">
              {declinedGuests.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-300 bg-[rgb(var(--paper))] px-4 py-5 text-sm text-zinc-600">
                  Nenhuma recusa registrada.
                </p>
              ) : (
                declinedGuests.map(renderGuestCard)
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
