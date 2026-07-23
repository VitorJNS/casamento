export function AdminDataError({
  title = "Nao foi possivel carregar os dados",
  description = "A conexao com o banco demorou mais do que o esperado. Aguarde alguns segundos e tente novamente.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
        Instabilidade temporaria
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6">{description}</p>
      <a
        href=""
        className="mt-4 inline-flex rounded-full border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
      >
        Tentar novamente
      </a>
    </div>
  );
}
