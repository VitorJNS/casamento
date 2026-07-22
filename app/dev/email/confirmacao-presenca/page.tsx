const previewResponses = [
  { guestName: "Vitor", attendance: "confirmed" },
  { guestName: "Yasmim", attendance: "confirmed" },
  { guestName: "Iara", attendance: "declined" },
] as const;

export default function RsvpEmailPreviewPage() {
  return (
    <main className="relative z-10 mx-auto min-h-dvh max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Esta e uma previa visual do e-mail de confirmacao de presenca. Ainda nao envia nada.
      </div>

      <article className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.10)]">
        <div
          className="bg-[#fbfaf8] px-6 py-8 text-center text-zinc-950 sm:px-10"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, rgb(var(--lavender) / 0.28), transparent 38%), radial-gradient(circle at 88% 18%, rgb(var(--olive) / 0.18), transparent 34%), linear-gradient(135deg, #fbfaf8, #ffffff)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Yasmim & Vitor
          </p>
          <h1 className="display-font mt-3 text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
            Confirmacao registrada
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            Obrigado por responder. Isso nos ajuda muito na organizacao do nosso
            grande dia.
          </p>
        </div>

        <div className="px-6 py-7 sm:px-10">
          <p className="text-base leading-7 text-zinc-700">
            Ola, <span className="font-semibold text-zinc-950">Vitor</span>!
            {" "}Recebemos sua confirmacao de presenca.
          </p>

          <section className="mt-6 rounded-[26px] border border-zinc-200 bg-[rgb(var(--paper))] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Resumo
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[rgb(var(--olive))]">
                  Resposta salva
                </h2>
                <p className="mt-2 text-sm text-zinc-500">Grupo: Familia Vitor</p>
              </div>

              <div className="rounded-full border border-[rgb(var(--olive)/0.25)] bg-white px-4 py-2 text-sm font-semibold text-[rgb(var(--olive))]">
                2 confirmados
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-600">
              Guardamos abaixo todos os nomes respondidos neste envio.
            </p>
          </section>

          <section className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Nomes respondidos
            </p>

            <div className="mt-3 space-y-3">
              {previewResponses.map((response) => (
                <div
                  key={response.guestName}
                  className="flex items-center justify-between gap-4 rounded-[22px] border border-zinc-200 bg-white px-4 py-4 shadow-sm"
                >
                  <p className="font-semibold text-zinc-950">{response.guestName}</p>
                  <span
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                      response.attendance === "confirmed"
                        ? "border-emerald-200 bg-emerald-50 text-[rgb(var(--olive))]"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {response.attendance === "confirmed" ? "Irei" : "Nao irei"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-7 rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p className="text-sm leading-6 text-zinc-600">
              Se precisar alterar alguma resposta depois, fale diretamente com os
              noivos ou com a cerimonialista.
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
