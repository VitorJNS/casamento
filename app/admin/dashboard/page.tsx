import { AdminLogoutButton } from "@/component/AdminLogoutButton";
import { GuestListManager } from "@/component/GuestListManager";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

function formatAttendance(value: string) {
  return value === "confirmed" ? "Confirmado" : "Recusado";
}

export default async function AdminDashboardPage() {
  await requireAdminAuth();
  const data = await getAdminDashboardData();

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-10">
      <div className="rounded-[32px] border border-zinc-200 bg-white/88 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Area dos noivos
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
              Painel do casamento
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Aqui voces acompanham as confirmacoes de presenca, gerenciam a lista-base de convidados e veem o resumo dos presentes pagos.
            </p>
          </div>

          <AdminLogoutButton />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              RSVPs confirmados
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.confirmedRsvps}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {data.summary.confirmedGuests} pessoas contáveis
              {data.summary.confirmedChildren > 0
                ? ` + ${data.summary.confirmedChildren} ${
                    data.summary.confirmedChildren === 1 ? "crianca" : "criancas"
                  }`
                : ""}
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              RSVPs recusados
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.declinedRsvps}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {data.summary.declinedGuests}{" "}
              {data.summary.declinedGuests === 1
                ? "pessoa contável não irá"
                : "pessoas contáveis não irão"}
              {data.summary.declinedChildren > 0
                ? ` + ${data.summary.declinedChildren} ${
                    data.summary.declinedChildren === 1 ? "crianca" : "criancas"
                  }`
                : ""}
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Presentes pagos
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.paidOrders}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {data.summary.paidGiftUnits} itens pagos
            </p>
          </div>

          <div className="rounded-[24px] border border-zinc-200 bg-[rgb(var(--paper))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Valor recebido
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              {data.summary.totalReceivedLabel}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Pedidos com status pago
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Confirmacoes de presenca
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Lista das respostas enviadas pelos convidados.
                </p>
              </div>
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
                          {formatAttendance(rsvp.attendance)} • {rsvp.countableGuestCount}{" "}
                          {rsvp.countableGuestCount === 1
                            ? "pessoa contável"
                            : "pessoas contáveis"}
                          {rsvp.childCount > 0
                            ? ` + ${rsvp.childCount} ${
                                rsvp.childCount === 1 ? "crianca" : "criancas"
                              }`
                            : ""}
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
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Total informado:</span>{" "}
                        {rsvp.guestCount} {rsvp.guestCount === 1 ? "pessoa" : "pessoas"}
                      </p>
                      <p className="text-sm text-zinc-700">
                        <span className="font-medium text-zinc-900">Crianças até 8 anos:</span>{" "}
                        {rsvp.childCount}
                      </p>
                    </div>

                    {rsvp.companionNames.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-zinc-900">
                          Acompanhantes
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {rsvp.companionNames.map((name) => (
                            <li
                              key={name}
                              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {rsvp.note ? (
                      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-700">
                        {rsvp.note}
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Presentes pagos
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Pedidos que ja tiveram pagamento confirmado.
              </p>
            </div>

            <div className="mt-5 max-h-[42rem] space-y-4 overflow-y-auto pr-2">
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
                        <p className="mt-1 text-sm text-zinc-600">
                          {order.guestEmail}
                        </p>
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
        </div>

        <div className="mt-6">
          <GuestListManager initialGuests={data.guestList} />
        </div>
      </div>
    </main>
  );
}
