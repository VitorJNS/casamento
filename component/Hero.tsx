import Image from "next/image";
import { Countdown } from "./Countdown";

type HeroProps = {
  dateText: string;
  coupleName: string;
  subtitle: string;
  heroPhotoSrc?: string;
  heroPhotoAlt?: string;
};

export function Hero({
  dateText,
  coupleName,
  subtitle,
  heroPhotoSrc = "/prewedding/03.jpg",
  heroPhotoAlt = "Foto do casal",
}: HeroProps) {
  return (
    <div className="relative flex min-h-[calc(100svh-7.75rem)] w-full flex-col justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 px-5 py-[clamp(1.25rem,3svh,2.5rem)] text-center shadow-sm backdrop-blur sm:px-8 lg:min-h-[calc(100svh-8.25rem)] lg:px-10">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: "rgb(var(--lavender) / 0.25)" }}
      />

      <div className="pointer-events-none absolute inset-2 rounded-3xl border border-white/40" />

      <div className="relative mx-auto mb-[clamp(1rem,2.2svh,2rem)] aspect-[3/4] w-[min(68vw,clamp(11rem,31svh,17.25rem))] lg:w-[clamp(12rem,32svh,18rem)]">
        <Image
          src="/ornaments/topo-decoracao.png"
          alt=""
          fill
          priority
          className="pointer-events-none z-0 object-contain opacity-95"
        />

        <div className="absolute left-[10.5%] right-[10.5%] top-[6%] bottom-[10.5%] z-10 overflow-hidden rounded-[47%] shadow-[0_20px_45px_rgba(0,0,0,0.12)]">
          <Image
            src={heroPhotoSrc}
            alt={heroPhotoAlt}
            fill
            priority
            className="object-cover"
            style={{
              objectPosition: "50% 50%",
              transform: "scale(1.52) translateY(-8%)",
              transformOrigin: "center",
            }}
          />
        </div>

        {/* <div className="pointer-events-none absolute left-[0%] top-[9%] z-20 h-24 w-24 sm:left-[-3%] sm:top-[1%] sm:h-32 sm:w-32">
          <Image
            src="/ornaments/flor-topo.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        <div className="pointer-events-none absolute bottom-[13%] right-[4%] z-20 h-24 w-24 rotate-[8deg] sm:bottom-[5%] sm:right-[8%] sm:h-32 sm:w-32">
          <Image
            src="/ornaments/flor-bottom.png"
            alt=""
            fill
            className="object-contain"
          />
        </div> */}

        <div className="pointer-events-none absolute left-12 top-0 h-1.5 w-1.5 rounded-full bg-[rgb(198_168_90_/_0.7)]" />
        <div className="pointer-events-none absolute left-[4.8rem] top-3 h-1 w-1 rounded-full bg-[rgb(198_168_90_/_0.6)]" />
        <div className="pointer-events-none absolute left-[5.6rem] top-1.5 h-1.5 w-1.5 rounded-full bg-[rgb(198_168_90_/_0.65)]" />
        <div className="pointer-events-none absolute bottom-10 left-3 h-1.5 w-1.5 rounded-full bg-[rgb(198_168_90_/_0.55)]" />
        <div className="pointer-events-none absolute bottom-6 left-6 h-1 w-1 rounded-full bg-[rgb(198_168_90_/_0.55)]" />
        <div className="pointer-events-none absolute bottom-7 left-10 h-1.5 w-1.5 rounded-full bg-[rgb(198_168_90_/_0.45)]" />
      </div>

      <p
        className="text-sm tracking-[0.25em] uppercase"
        style={{ color: "rgb(var(--olive))" }}
      >
        {dateText}
      </p>

      <h1 className="display-font mt-[clamp(0.5rem,1.2svh,1rem)] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
        {coupleName}
      </h1>

      {subtitle ? (
        <p className="mx-auto mt-3 max-w-prose text-zinc-700">{subtitle}</p>
      ) : null}

      <div className="mt-[clamp(1rem,2.4svh,2rem)]">
        <Countdown targetISO="2027-06-20T16:00:00-03:00" />
      </div>
    </div>
  );
}
