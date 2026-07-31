import { GiftRegistry } from "@/component/GiftRegistry";
import { LinkCard } from "@/component/LinkCard";
import { RsvpForm } from "@/component/RsvpForm";
import { getDisplayGiftCatalog } from "@/lib/gifts";
import Image from "next/image";

export const revalidate = 300;

export const metadata = {
  title: "Prévia do design | Yasmim & Vitor",
  description: "Prévia visual do novo design do site de casamento.",
};

const weddingDate = "20 de Junho de 2027";

const cleanContent = {
  welcome:
    "Estamos muito felizes em compartilhar este momento tão especial com pessoas que fazem parte da nossa história. Depois de tantos anos caminhando juntos, chegou o dia de celebrarmos o nosso amor diante de Deus e ao lado de quem amamos.",
  story:
    "Alguns encontros mudam completamente o rumo da nossa vida, e o nosso começou lá em 2020. Desde então, crescemos juntos, amadurecemos, realizamos sonhos e construímos, dia após dia, a nossa família e o nosso lar.",
  ceremonyAddress:
    "Av. Comendador Pedro Morganti, s/n - Monte Alegre, Piracicaba - SP, 13415-001",
  dinnerAddress:
    "Praça Antonio Keller, 22 - Monte Alegre, Piracicaba - SP, 13415-020",
  photosUploadLink:
    "https://drive.google.com/drive/folders/1AeLG19cg5cFsDOj0DJwHgvfh6dLpQAK8?usp=sharing",
};

const navItems = [
  { href: "#o-casal", label: "O casal" },
  { href: "#cerimonia", label: "Cerimônia" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#presentes", label: "Presentes" },
  { href: "#momentos", label: "Momentos" },
];

function PreviewDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex items-center justify-center gap-4 ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-[#b19cd9]/45 sm:w-24" />
      <span className="relative h-16 w-16 opacity-80">
        <Image
          src="/brand/monograma.png"
          alt=""
          fill
          sizes="64px"
          className="object-contain"
        />
      </span>
      <span className="h-px w-16 bg-[#b19cd9]/45 sm:w-24" />
    </div>
  );
}

function Ornament({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div
      className={`pointer-events-none fixed top-20 z-0 hidden h-[calc(100vh-5rem)] w-36 opacity-35 lg:block ${
        isLeft ? "left-0" : "right-0"
      }`}
      aria-hidden="true"
    >
      <Image
        src={
          isLeft
            ? "/ornaments/lavanda-preto-branco.png"
            : "/ornaments/oliveira-preto-branco.png"
        }
        alt=""
        fill
        sizes="144px"
        className={`object-contain ${isLeft ? "object-left" : "object-right"}`}
      />
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  text,
}: {
  kicker?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {kicker ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#b89543]">
          {kicker}
        </p>
      ) : null}
      <h2 className="display-font text-4xl font-semibold text-[#4f6146] sm:text-5xl">
        {title}
      </h2>
      {text ? (
        <p className="mt-4 leading-7 text-[#66745c]">{text}</p>
      ) : null}
    </div>
  );
}

function InfoPanel({
  kicker,
  title,
  text,
  imageSrc,
  imageAlt,
  href,
}: {
  kicker: string;
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}) {
  return (
    <article className="grid overflow-hidden rounded-lg border border-[#d8ddcf] bg-[#fffefa]/80 shadow-sm md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative min-h-64">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 520px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b89543]">
          {kicker}
        </p>
        <h3 className="display-font mt-3 text-3xl font-semibold text-[#4f6146]">
          {title}
        </h3>
        <p className="mt-4 leading-7 text-[#66745c]">{text}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-fit items-center justify-center rounded-full border border-[#4f6146] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#4f6146] transition hover:bg-[#4f6146] hover:text-[#fffdf3]"
        >
          Abrir no Google Maps
        </a>
      </div>
    </article>
  );
}

export default async function PreviewDesignPage() {
  const giftCatalog = await getDisplayGiftCatalog();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#fffdf3] text-[#2f302d]">
      <Ornament side="left" />
      <Ornament side="right" />

      <nav className="sticky top-0 z-40 border-b border-[#d8ddcf]/70 bg-[#fffdf3]/88 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-6">
          <a
            href="#home"
            className="display-font text-2xl font-semibold italic text-[#4f6146]"
          >
            Y &amp; V
          </a>
          <div className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#66745c] md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-[#b89543]"
              >
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="#rsvp"
            className="rounded-full bg-[#4f6146] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#fffdf3] transition hover:bg-[#b89543]"
          >
            RSVP
          </a>
        </div>
      </nav>

      <section
        id="home"
        className="relative z-10 mx-auto grid min-h-[calc(100svh-5rem)] max-w-6xl items-center gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-16"
      >
        <div className="order-2 space-y-8 lg:order-1">
          <div>
            <p className="display-font text-xl italic text-[#b89543]">
              {weddingDate}
            </p>
            <h1 className="display-font mt-3 text-6xl font-semibold leading-[0.9] text-[#4f6146] sm:text-7xl lg:text-8xl">
              Yasmim
              <br />
              &amp; Vitor
            </h1>
          </div>
          <p className="max-w-md text-lg leading-8 text-[#66745c]">
            Depois de tantos capítulos juntos, chegou o momento do nosso para
            sempre. Queremos compartilhar este sonho com quem mais amamos.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#rsvp"
              className="rounded-full bg-[#4f6146] px-7 py-3.5 text-sm font-semibold text-[#fffdf3] transition hover:bg-[#b89543]"
            >
              Confirmar presença
            </a>
            <a
              href="#cerimonia"
              className="rounded-full border border-[#4f6146] px-7 py-3.5 text-sm font-semibold text-[#4f6146] transition hover:bg-white"
            >
              Ver detalhes
            </a>
          </div>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[18rem] sm:max-w-sm lg:order-2 lg:max-w-md">
          <div className="absolute inset-0 -rotate-6 scale-105 rounded-full bg-[#4f6146]/10" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-full shadow-2xl shadow-[#4f6146]/20 outline outline-1 -outline-offset-1 outline-black/5">
            <Image
              src="/prewedding/03.jpg"
              alt="Yasmim e Vitor"
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 448px"
              className="object-cover"
              style={{
                objectPosition: "50% 50%",
                transform: "scale(1.24) translateY(-5%)",
                transformOrigin: "center",
              }}
            />
          </div>
          <div className="absolute -bottom-3 -right-2 flex h-24 w-24 items-center justify-center rounded-full border border-[#b89543]/40 bg-[#fffdf3]/75 text-center backdrop-blur sm:-bottom-6 sm:-right-6 sm:h-40 sm:w-40">
            <p className="display-font px-4 text-base italic text-[#b89543] sm:text-lg">
              Save the Date
            </p>
          </div>
        </div>
      </section>

      <section id="o-casal" className="relative z-10 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex items-center justify-center gap-4">
            <Image
              src="/ornaments/lavanda-preto-branco.png"
              alt=""
              width={54}
              height={90}
              className="h-20 w-auto opacity-55"
            />
            <Image
              src="/ornaments/oliveira-preto-branco.png"
              alt=""
              width={92}
              height={82}
              className="h-14 w-auto opacity-45"
            />
          </div>
          <h2 className="display-font text-5xl font-semibold text-[#4f6146]">
            Sejam bem-vindos
          </h2>
          <p className="mt-6 leading-8 text-[#66745c]">{cleanContent.welcome}</p>
          <p className="mt-6 display-font text-2xl italic text-[#b89543]">
            Com amor, Yas &amp; Vitor
          </p>
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section className="relative z-10 bg-white/45 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            kicker="Nossa história"
            title="O Casal"
            text={cleanContent.story}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {["/prewedding/01.jpg", "/prewedding/02.jpg", "/story/timeline.png"].map(
              (src, index) => (
                <div
                  key={src}
                  className="relative aspect-[4/5] overflow-hidden rounded-lg border border-[#d8ddcf] bg-white shadow-sm"
                >
                  <Image
                    src={src}
                    alt={`Momento do casal ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section id="cerimonia" className="relative z-10 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            kicker="Onde celebrar"
            title="Cerimônia & Jantar"
            text="Reunimos os endereços completos para facilitar sua chegada."
          />
          <div className="grid gap-8">
            <InfoPanel
              kicker="Cerimônia"
              title="Monte Alegre"
              text={cleanContent.ceremonyAddress}
              imageSrc="/locations/capela.jpg"
              imageAlt="Capela da cerimônia"
              href="https://maps.app.goo.gl/fXMbsrVRAooaDbXQ9"
            />
            <InfoPanel
              kicker="Jantar"
              title="Casa Lucca"
              text={cleanContent.dinnerAddress}
              imageSrc="/locations/casa-lucca.png"
              imageAlt="Casa Lucca, local do jantar"
              href="https://www.google.com/maps/search/?api=1&query=Praca%20Antonio%20Keller%2C%2022%20-%20Monte%20Alegre%2C%20Piracicaba%20-%20SP%2C%2013415-020"
            />
          </div>
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section className="relative z-10 bg-white/45 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            kicker="Dress code"
            title="Traje esporte fino"
            text="O casamento acontece no fim da tarde, em junho. Sugerimos looks elegantes e confortáveis para o clima frio."
          />
          <div className="overflow-hidden rounded-lg border border-[#d8ddcf] bg-[#fffefa]/85 shadow-sm">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/dresscode/dresscode.png?v=20260526-2244"
                alt="Referência visual para o dress code"
                fill
                quality={100}
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-contain"
              />
            </div>
            <p className="px-6 pb-6 text-center leading-7 text-[#66745c]">
              Pedimos, com carinho, que evitem tons de chumbo, lavanda e branco,
              reservados aos padrinhos, madrinhas e à noiva.
            </p>
          </div>
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section id="rsvp" className="relative z-10 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionHeader
            kicker="Confirme sua presença"
            title="Vamos celebrar?"
            text="Sua confirmação é essencial para planejarmos cada detalhe com carinho."
          />
          <RsvpForm />
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section id="presentes" className="relative z-10 bg-white/45 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            kicker="Lista de presentes"
            title="Presentes"
            text="Sua presença é o nosso maior presente, mas se desejar nos presentear, selecionamos algumas sugestões com carinho."
          />
          <GiftRegistry gifts={giftCatalog} />
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section id="momentos" className="relative z-10 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeader
            kicker="Memorias"
            title="Momentos"
            text="Depois do casamento, vocês poderão compartilhar fotos e vídeos na nossa pasta."
          />
          <LinkCard
            title="Envie suas fotos do casamento"
            description="Clique para abrir a pasta e fazer upload das suas fotos."
            href={cleanContent.photosUploadLink}
            buttonText="Enviar fotos"
          />
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#d8ddcf]/70 px-5 py-12 text-center">
        <PreviewDivider className="mb-5" />
        <p className="display-font text-2xl italic text-[#4f6146]">
          Yasmim &amp; Vitor
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#66745c]">
          2027 - Piracicaba, Brasil
        </p>
      </footer>
    </main>
  );
}
