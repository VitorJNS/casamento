import { OrderStatusCard } from "@/component/OrderStatusCard";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; order_nsu?: string; transaction_nsu?: string; slug?: string }>;
}) {
  const params = await searchParams;
  const autoCheck = Boolean(params.transaction_nsu || params.slug || params.order_nsu);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="rounded-[32px] border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Retorno do pagamento</p>
        <h1 className="display-font mt-2 text-3xl font-semibold" style={{ color: "rgb(var(--olive))" }}>
          Estamos acompanhando seu presente
        </h1>
        <p className="mt-3 text-zinc-700">Se o pagamento ja tiver sido aprovado, ele aparecera aqui em alguns instantes. Caso contrario, voce pode atualizar o status manualmente.</p>
        <div className="mt-6">
          <OrderStatusCard orderId={params.orderId} orderNsu={params.order_nsu} autoCheck={autoCheck} />
        </div>
      </div>
    </main>
  );
}
