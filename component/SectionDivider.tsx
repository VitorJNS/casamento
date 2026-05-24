import Image from "next/image";

export function SectionDivider() {
  return (
    <div className="pointer-events-none mb-10 flex items-center justify-center gap-3 px-4">
      <div
        className="h-px min-w-[72px] max-w-[180px] flex-1"
        style={{ backgroundColor: "rgb(var(--olive) / 0.24)" }}
      />
      <div className="relative h-20 w-20 shrink-0 opacity-75">
        <Image
          src="/brand/monograma.png"
          alt=""
          fill
          sizes="80px"
          className="object-contain"
        />
      </div>
      <div
        className="h-px min-w-[72px] max-w-[180px] flex-1"
        style={{ backgroundColor: "rgb(var(--olive) / 0.24)" }}
      />
    </div>
  );
}
