import Link from "next/link";

export default function PaymentCanceledPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <div className="rounded-[32px] border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Pagamento nao concluido</p>
        <h1 className="display-font mt-2 text-3xl font-semibold" style={{ color: "rgb(var(--olive))" }}>
          Voce pode tentar novamente quando quiser
        </h1>
        <p className="mt-3 text-zinc-700">Se quiser, volte para a lista de presentes e monte o carrinho outra vez.</p>
        <Link href="/" className="btn-primary mt-6 rounded-full px-5 py-3">Voltar ao site</Link>
      </div>
    </main>
  );
}
