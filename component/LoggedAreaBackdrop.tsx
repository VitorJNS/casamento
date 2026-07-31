import Image from "next/image";

type LoggedAreaBackdropProps = {
  variant?: "full" | "subtle";
};

export function LoggedAreaBackdrop({
  variant = "subtle",
}: LoggedAreaBackdropProps) {
  const opacity = variant === "full" ? "opacity-40" : "opacity-25";
  const showOrnaments = variant === "full";

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_10%_5%,rgba(177,156,217,0.26),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(79,97,70,0.18),transparent_32%),linear-gradient(180deg,#fffdf3,#fbfaf4)]"
      />
      {showOrnaments ? (
        <>
          <div
            aria-hidden="true"
            className={`pointer-events-none fixed left-0 top-20 z-0 hidden h-[calc(100dvh-5rem)] w-32 ${opacity} lg:block`}
          >
            <Image
              src="/ornaments/lavanda-preto-branco.png"
              alt=""
              fill
              sizes="128px"
              className="object-contain object-left"
            />
            <Image
              src="/ornaments/lavanda-preto-branco.png"
              alt=""
              fill
              sizes="128px"
              className="translate-x-7 translate-y-28 scale-90 object-contain object-left opacity-70"
            />
          </div>
          <div
            aria-hidden="true"
            className={`pointer-events-none fixed right-0 top-20 z-0 hidden h-[calc(100dvh-5rem)] w-32 ${opacity} lg:block`}
          >
            <Image
              src="/ornaments/oliveira-preto-branco.png"
              alt=""
              fill
              sizes="128px"
              className="object-contain object-right"
            />
          </div>
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed right-4 top-24 z-0 hidden h-56 w-40 opacity-[0.11] xl:block"
          >
            <Image
              src="/ornaments/oliveira-preto-branco.png"
              alt=""
              fill
              sizes="160px"
              className="object-contain object-right-top"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed bottom-10 left-[310px] z-0 hidden h-48 w-28 opacity-[0.08] xl:block"
          >
            <Image
              src="/ornaments/lavanda-preto-branco.png"
              alt=""
              fill
              sizes="112px"
              className="object-contain object-left-bottom"
            />
          </div>
        </>
      )}
    </>
  );
}
