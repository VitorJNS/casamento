import Link from "next/link";

type PreviewOrder = {
  title: string;
  guestName: string;
  guestEmail: string;
  introText: string;
  statusLabel: string;
  statusDescription: string;
  orderUrl: string;
  subtotalLabel: string;
  paymentMethod: string | null;
  receiptUrl: string | null;
  items: Array<{
    title: string;
    quantity: number;
    lineTotalLabel: string;
  }>;
};

const paidPreviewOrder = {
  title: "E-mail enviado apos pagamento confirmado",
  guestName: "Vitor",
  guestEmail: "vitorjosedonascimento2002@gmail.com",
  introText: "Seu pagamento foi confirmado com sucesso.",
  statusLabel: "Pagamento confirmado",
  statusDescription:
    "Seu presente foi confirmado com sucesso. Obrigado por fazer parte desse momento tao especial.",
  orderUrl: "/pagamento/sucesso?orderId=ord_EXEMPLO",
  subtotalLabel: "R$ 5,22",
  paymentMethod: "credit_card",
  receiptUrl: "https://recibo.infinitepay.io/exemplo",
  items: [
    {
      title: "Presente teste",
      quantity: 1,
      lineTotalLabel: "R$ 5,00",
    },
  ],
};

export default function GiftConfirmationEmailPreviewPage() {
  return (
    <main className="relative z-10 mx-auto min-h-dvh max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Esta e uma previa visual do e-mail. Ainda nao envia nada.
      </div>

      <div className="space-y-8">
        <EmailFrame previewOrder={paidPreviewOrder} />
      </div>
    </main>
  );
}

function EmailFrame({
  previewOrder,
}: {
  previewOrder: PreviewOrder;
}) {
  return (
    <section>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[rgb(var(--olive))]">
        {previewOrder.title}
      </p>

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
          Recebemos seu presente
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          Obrigado por fazer parte da nossa historia e por celebrar esse momento
          tao especial com a gente.
        </p>
      </div>

      <div className="px-6 py-7 sm:px-10">
        <p className="text-base leading-7 text-zinc-700">
          Ola, <span className="font-semibold text-zinc-950">{previewOrder.guestName}</span>!
          {" "}{previewOrder.introText}
        </p>

        <section className="mt-6 rounded-[26px] border border-zinc-200 bg-[rgb(var(--paper))] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Status
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[rgb(var(--olive))]">
                {previewOrder.statusLabel}
              </h2>
              {previewOrder.paymentMethod ? (
                <p className="mt-2 text-sm text-zinc-500">
                  Metodo: {previewOrder.paymentMethod}
                </p>
              ) : null}
            </div>

            <div className="rounded-full border border-[rgb(var(--olive)/0.25)] bg-white px-4 py-2 text-sm font-semibold text-[rgb(var(--olive))]">
              {previewOrder.subtotalLabel}
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-600">
            {previewOrder.statusDescription}
          </p>
        </section>

        <section className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Resumo do presente
          </p>

          <div className="mt-3 space-y-3">
            {previewOrder.items.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-4 rounded-[22px] border border-zinc-200 bg-white px-4 py-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-zinc-900">{item.lineTotalLabel}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7 rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            E-mail usado na compra
          </p>
          <p className="mt-1 break-all text-sm font-medium text-zinc-800">
            {previewOrder.guestEmail}
          </p>
        </div>

        <div className="mt-7 text-center">
          <Link
            href={previewOrder.orderUrl}
            className="inline-flex rounded-full bg-[rgb(var(--olive))] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Acompanhar meu presente
          </Link>
          {previewOrder.receiptUrl ? (
            <div className="mt-4">
              <a
                href={previewOrder.receiptUrl}
                className="text-sm font-semibold text-[rgb(var(--olive))] underline"
              >
                Abrir recibo da InfinitePay
              </a>
            </div>
          ) : null}
          <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-zinc-500">
            Se o pagamento ja foi aprovado, pode levar alguns instantes para o
            status aparecer como confirmado.
          </p>
        </div>
      </div>
    </article>
    </section>
  );
}
