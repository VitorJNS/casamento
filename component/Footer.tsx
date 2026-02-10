import Image from "next/image";

type FooterProps = {
  names: string;
  dateText: string;
  note?: string;
};

export function Footer({ names, dateText, note }: FooterProps) {
  return (
    <footer className="mt-12 pb-10">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur p-6 shadow-sm text-center">
        <div className="relative mx-auto mb-6 h-36 w-36 sm:h-44 sm:w-44">
            <Image
              src="/brand/monograma.png"
              alt="Monograma Yasmim & Vitor"
              fill
              priority
              className="object-contain drop-shadow-sm"
            />
        </div>


        <div className="display-font text-2xl font-semibold">{names}</div>
        <div
          className="mt-1 text-sm tracking-[0.2em] uppercase"
          style={{ color: "rgb(var(--olive))" }}
        >
          {dateText}
        </div>

        {note && <p className="mt-3 text-zinc-700">{note}</p>}
      </div>
    </footer>
  );
}
