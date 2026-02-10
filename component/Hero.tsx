import Image from "next/image";
import { Countdown } from "./Countdown";

type HeroProps = {
  dateText: string;
  coupleName: string;
  subtitle: string;
};

export function Hero({ dateText, coupleName, subtitle }: HeroProps) {
  return (
    <div className="relative rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-10 shadow-sm text-center overflow-hidden">
      {/* Monograma central */}

      {/* detalhe lavanda suave */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "rgb(var(--lavender) / 0.25)" }}
      />

      {/* borda interna (efeito papelaria) */}
      <div className="pointer-events-none absolute inset-2 rounded-3xl border border-white/40" />

      <div className="relative mx-auto mb-6 h-36 w-36 sm:h-44 sm:w-44">
        <Image
          src="/brand/monograma.png"
          alt="Monograma Yasmim & Vitor"
          fill
          priority
          className="object-contain drop-shadow-sm"
        />
      </div>

      <p
        className="text-sm tracking-[0.25em] uppercase"
        style={{ color: "rgb(var(--olive))" }}
      >
        {dateText}
      </p>

      <h1 className="display-font mt-3 text-4xl sm:text-6xl font-semibold leading-tight">
        {coupleName}
      </h1>

      <p className="mt-4 text-zinc-700 mx-auto max-w-prose">{subtitle}</p>

      <Countdown targetISO="2027-06-20T16:00:00-03:00" />

      

      {/* O CODIGO ABAIXO COMENTA OS BOTOES NESSA INTERFACE PRINCIPAL */}
      {/* <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <a
          href="#fotos"
          className="rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
          style={{ backgroundColor: "rgb(var(--olive))" }}
        >
          Pré-wedding
        </a>

        <a
          href="#pix"
          className="rounded-full px-6 py-2.5 text-sm font-medium border transition hover:bg-white/60"
          style={{
            borderColor: "rgb(var(--lavender) / 0.55)",
            backgroundColor: "rgb(var(--lavender) / 0.18)",
            color: "rgb(var(--olive))",
          }}
        >
          Pix
        </a>
      </div> */}
    </div>
  );
}
