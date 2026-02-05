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
        <div className="mx-auto mb-3 flex justify-center">
            <div
                className="monogram-mask"
                style={{
                width: 70,
                height: 70,
                backgroundColor: "rgb(var(--olive))",
                }}
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
