import { GiftRegistry } from "@/component/GiftRegistry";
import { LinkCard } from "@/component/LinkCard";
import { RsvpForm } from "@/component/RsvpForm";
import { Countdown } from "@/component/Countdown";
import { PreviewNavScrollController } from "@/component/PreviewNavScrollController";
import { PreviewTopNav } from "@/component/PreviewTopNav";
import { TimelineImagePreview } from "@/component/TimelineImagePreview";
import { getDisplayGiftCatalog } from "@/lib/gifts";
import Image from "next/image";

export const revalidate = 300;

export const metadata = {
  title: "Prévia do design | Yasmim & Vitor",
  description: "Prévia visual do novo design do site de casamento.",
};

const weddingDate = "20 de Junho de 2027";

const fullNavItems = [
  // { href: "#home", label: "Início" },
  { href: "#bem-vindos", label: "Bem-vindos" },
  { href: "#o-casal", label: "Nossa Historia" },
  { href: "#dress-code", label: "Dress Code" },
  { href: "#cerimonia-jantar", label: "Cerimônia & Jantar" },
  // { href: "#rsvp", label: "Confirmar presença" },
  { href: "#presentes", label: "Presentes" },
  { href: "#momentos", label: "Momentos" },
];

const richContent = {
  hero:
    "Depois de tantos capítulos juntos, chegou o momento do nosso para sempre. Queremos compartilhar este sonho com quem mais amamos.",
  welcome:
    "Estamos muito felizes em compartilhar este momento tão especial com pessoas que fazem parte da nossa história. Depois de tantos anos caminhando juntos, chegou o dia de celebrarmos o nosso amor diante de Deus e ao lado de quem amamos.",
  welcomeDetails: [
    "Criamos este espaço para compartilhar um pouco da nossa trajetória e reunir todas as informações importantes sobre o casamento.",
    "Cada presença será extremamente importante para nós. Esperamos que este dia seja leve, emocionante e inesquecível, não apenas para nós, mas também para todos que estarão vivendo esse sonho conosco.",
  ],
  story:
    "Alguns encontros mudam completamente o rumo da nossa vida, e o nosso começou lá em 2020.",
  storyDetails: [
    "Desde então, crescemos juntos, amadurecemos, realizamos sonhos, enfrentamos mudanças e construímos, dia após dia, a nossa família e o nosso lar.",
    "Entre conquistas, recomeços, quilômetros de distância e muitos planos compartilhados, entendemos que o amor está justamente nos pequenos momentos vividos lado a lado.",
    "E agora, depois de tantos capítulos especiais, estamos prontos para viver o mais importante deles: o nosso casamento.",
  ],
  dressCodeIntro:
    "Escolhemos com muito carinho o traje esporte fino para celebrar este momento tão especial ao nosso lado. O casamento acontecerá ao final da tarde, em junho, uma época em que as temperaturas costumam ser mais frias.",
  dressCodeGroups: [
    {
      title: "Para eles",
      text: "Camisa, calça de alfaiataria e sapatos sociais são ótimas escolhas para a ocasião. Blazers e sobreposições sofisticadas também combinam com o clima do casamento.",
      avoidItems: ["Jeans", "Bermudas", "Tênis esportivos"],
    },
    {
      title: "Para elas",
      text: "Vestidos midi ou longos, tecidos fluidos e tons suaves combinarão perfeitamente com a atmosfera do nosso grande dia. Casacos delicados e mangas longas também serão muito bem-vindos.",
      avoidItems: [
        "Jeans",
        "Roupas muito curtas",
        "Decotes excessivos",
        "Salto desconfortável",
      ],
    }
  ],
  dressCodeColors:
    "Nossos padrinhos usarão tons de chumbo, nossas madrinhas estarão em lavanda, e o branco será reservado para a noiva. Pedimos, com carinho, que evitem essas tonalidades para que cada um tenha seu destaque especial neste dia tão importante.",
  rsvp:
    "Para nos auxiliar na organização do casamento, pedimos que confirme sua presença através do formulário abaixo. Informe seu nome, contato e se estará presente. Caso venha acompanhado, nos conte quantas pessoas serão ao todo.",
  gifts:
    "A presença de cada um de vocês já torna este dia ainda mais especial para nós. Criamos nossa lista de presentes apenas para aqueles que desejarem participar, de alguma forma, da construção do nosso novo lar e do início desta nova fase das nossas vidas.",
  giftListIntro:
    "Agora você pode juntar vários presentes em uma única compra, preencher seus dados e concluir tudo em um checkout único.",
  moments: [
    "Cada sorriso, abraço e momento vivido neste dia será extremamente especial para nós. Criamos este espaço para que vocês possam compartilhar todas as fotos e vídeos registrados durante o casamento.",
    "Todos os arquivos enviados serão salvos diretamente em nossa pasta do Google Drive. Não deixe nenhum momento passar despercebido: queremos guardar cada memória deste dia inesquecível ao lado de vocês.",
  ],
};

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
  { href: "#o-casal", label: "Nossa Historia" },
  { href: "#cerimonia", label: "Cerimônia" },
  { href: "#rsvp", label: "Confirmar presença" },
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
  const ornamentSrc = isLeft
    ? "/ornaments/lavanda-preto-branco.png"
    : "/ornaments/oliveira-preto-branco.png";

  return (
    <div
      className={`pointer-events-none fixed top-20 z-0 hidden h-[calc(100vh-5rem)] w-36 opacity-35 lg:block ${
        isLeft ? "left-0" : "right-0"
      }`}
      aria-hidden="true"
    >
      {isLeft ? (
        <>
          <Image
            src={ornamentSrc}
            alt=""
            fill
            sizes="144px"
            className="object-contain object-left"
          />
          <Image
            src={ornamentSrc}
            alt=""
            fill
            sizes="144px"
            className="translate-x-8 translate-y-28 scale-90 object-contain object-left opacity-70"
          />
        </>
      ) : (
        <Image
          src={ornamentSrc}
          alt=""
          fill
          sizes="144px"
          className="object-contain object-right"
        />
      )}
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  subtitle,
  text,
  titleClassName = "",
  subtitleClassName = "",
  textClassName = "",
  titleStyle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  text?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  textClassName?: string;
  titleStyle?: React.CSSProperties;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {kicker ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#b89543]">
          {kicker}
        </p>
      ) : null}
      <h2
        className={`display-font text-4xl font-semibold text-[#4f6146] sm:text-5xl ${titleClassName}`.trim()}
        style={titleStyle}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`display-font mt-2 text-2xl font-semibold text-[#b19cd9] sm:text-3xl ${subtitleClassName}`.trim()}
        >
          {subtitle}
        </p>
      ) : null}
      {text ? (
        <p className={`mt-4 leading-7 text-[#66745c] ${textClassName}`.trim()}>{text}</p>
      ) : null}
    </div>
  );
}

function GiftRegistryHeading() {
  return (
    <div className="mx-auto mb-11 max-w-3xl text-center">
      <Image
        src="/ornaments/presentes-top-ornament.png"
        alt=""
        width={360}
        height={120}
        className="mx-auto mb-[-0.35rem] h-20 w-[18rem] object-contain sm:h-24 sm:w-[24rem]"
        priority
      />
      <h2 className="display-font text-[4.7rem] font-semibold leading-[0.86] text-[#4f6146] sm:text-[6.2rem]">
        Presentes
      </h2>
      <p className="display-font mt-5 text-[2.25rem] font-semibold leading-none text-[#b19cd9] sm:text-[3.15rem]">
        Lista de presentes
      </p>
      <div className="mt-5 flex items-center justify-center gap-4" aria-hidden="true">
        <span className="h-px w-36 bg-[#c9a65a] sm:w-44" />
        <span className="display-font -mt-1 text-2xl leading-none text-[#b89543]">
          ♥
        </span>
        <span className="h-px w-36 bg-[#c9a65a] sm:w-44" />
      </div>
    </div>
  );
}

function InfoPanel({
  id,
  kicker,
  title,
  description,
  text,
  imageSrc,
  imageAlt,
  href,
}: {
  id?: string;
  kicker: string;
  title: string;
  description?: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}) {
  return (
    <article
      id={id}
      className="grid scroll-mt-[-65px] overflow-hidden rounded-lg border border-[#d8ddcf] bg-[#fffefa]/80 shadow-sm md:grid-cols-[0.95fr_1.05fr]"
    >
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
        {description ? (
          <p className="mt-4 text-sm leading-7 text-[#66745c]">
            {description}
          </p>
        ) : null}
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
    <main className="design-preview-shell relative isolate min-h-screen overflow-hidden bg-[#fffdf3] text-[#2f302d]">
      {/* <Ornament side="left" />
      <Ornament side="right" /> */}

      <PreviewNavScrollController />
      <PreviewTopNav items={fullNavItems} />
      <nav
        data-preview-top-nav
        className="hidden"
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-6">
          <a
            href="#home"
            className="relative h-14 w-14 shrink-0 rounded-full border border-[#d8ddcf] bg-white/65 shadow-sm transition hover:bg-white"
            aria-label="Ir para o inicio"
          >
            <Image
              src="/brand/monograma.png"
              alt=""
              fill
              priority
              sizes="56px"
              className="object-contain p-1.5"
            />
          </a>
          <div className="hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#66745c] xl:flex">
            {fullNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-[#b89543]"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin"
              className="hidden rounded-full border border-[#d8ddcf] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4f6146] transition hover:bg-white md:inline-flex"
            >
              Noivos
            </a>
            <a
              href="#rsvp"
              className="rounded-full bg-[#4f6146] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#fffdf3] transition hover:bg-[#b89543]"
            >
              Confirmar presença
            </a>
          </div>
        </div>
      </nav>
      <div className="h-20" aria-hidden="true" />

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
            {richContent.hero}
          </p>
          <div className="max-w-lg pt-5">
            <Countdown
              targetISO="2027-06-20T16:00:00-03:00"
              label="Faltam"
            />
          </div>
          {/* <div className="flex flex-wrap gap-3">
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
          </div> */}
          {/* <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
            <a
              href="/admin"
              className="text-[#4f6146] underline decoration-[#b89543]/50 underline-offset-4 transition hover:text-[#b89543]"
            >
              Área dos noivos
            </a>
            <a
              href="/cerimonial"
              className="text-[#4f6146] underline decoration-[#b89543]/50 underline-offset-4 transition hover:text-[#b89543]"
            >
              Cerimonialista
            </a>
          </div> */}
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

      <section id="bem-vindos" className="relative z-10 px-5 py-20 sm:px-6">
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
          <div className="mt-6 space-y-5 leading-8 text-[#66745c]">
            <p>{richContent.welcome}</p>
            {richContent.welcomeDetails.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-6 display-font text-2xl italic text-[#b89543]">
            Com amor, Yas &amp; Vitor
          </p>
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section
        id="o-casal"
        className="relative z-10 scroll-mt-24 bg-white/45 px-5 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            title="Nossa Historia"
            text={richContent.story}
            textClassName="whitespace-nowrap text-[clamp(0.69rem,2.45vw,1rem)] sm:text-base"
          />
          <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-[#d8ddcf] bg-[#fffefa]/82 p-5 text-sm leading-7 text-[#66745c] shadow-sm sm:p-6">
            <div className="space-y-4">
              {richContent.storyDetails.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="my-6 h-px bg-[#d8ddcf]/80" />

            <TimelineImagePreview
              src="/story/timeline-full.png"
              alt="Nossa historia"
            />
          </div>
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section
        id="cerimonia-jantar"
        className="relative z-10 scroll-mt-24 px-5 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            title="Cerimônia & Jantar"
            text="Abaixo, disponibilizamos o endereço completo e o link para acesso pelo Google Maps, para facilitar sua chegada a cerimonia e ao jantat"
          />
          <div className="grid gap-8">
            <InfoPanel
              kicker="Cerimônia"
              id="cerimonia"
              title="Capela Monte Alegre - São Pedro"
              text={cleanContent.ceremonyAddress}
              imageSrc="/locations/capela.jpg"
              imageAlt="Capela da cerimônia"
              href="https://maps.app.goo.gl/fXMbsrVRAooaDbXQ9"
            />
            <InfoPanel
              kicker="Jantar"
              id="jantar"
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

      <section
        id="dress-code"
        className="relative z-10 scroll-mt-[-40px] bg-white/45 px-5 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            kicker="Dress code"
            title="Traje esporte fino"
            titleClassName="dress-code-title text-5xl sm:text-6xl"
            titleStyle={{
              fontFamily: "var(--font-great-vibes), cursive",
              fontWeight: 400,
              letterSpacing: 0,
            }}
            text={richContent.dressCodeIntro}
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
            <div className="grid gap-4 px-6 pb-6 md:grid-cols-2">
              {richContent.dressCodeGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-lg border border-[#d8ddcf] bg-white/70 p-5 text-left"
                >
                  <h3 className="display-font text-2xl font-semibold text-[#4f6146]">
                    {group.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#66745c]">
                    {group.text}
                  </p>
                  <div className="mt-4 text-sm font-semibold leading-7 text-[#4f6146]">
                    <p>Evitem:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {group.avoidItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <p className="px-6 pb-6 font-semibold text-center leading-7 text-[#66745c]">
              {richContent.dressCodeColors}
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
            text={richContent.rsvp}
          />
          <RsvpForm />
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section id="presentes" className="relative z-10 overflow-hidden bg-[#fffefa]/55 px-5 py-20 sm:px-6">
        {/* <Image
          src="/ornaments/lavanda-preto-branco.png"
          alt=""
          width={260}
          height={420}
          className="pointer-events-none absolute left-0 top-0 hidden -translate-x-16 -translate-y-8 rotate-[-10deg] opacity-25 lg:block"
        /> */}
        <Image
          src="/ornaments/oliveira-preto-branco.png"
          alt=""
          width={220}
          height={420}
          className="pointer-events-none absolute right-0 bottom-10 hidden translate-x-14 opacity-[0.18] lg:block"
        />
        <div className="relative mx-auto max-w-7xl">
          <GiftRegistryHeading />
          <GiftRegistry gifts={giftCatalog} introText={richContent.giftListIntro} />
        </div>
      </section>

      <PreviewDivider className="relative z-10 py-6" />

      <section id="momentos" className="relative z-10 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeader
            title="Momentos"
            text={richContent.moments[0]}
          />
          <p className="mb-6 leading-7 text-[#66745c]">
            {richContent.moments[1]}
          </p>
          <LinkCard
            title="Envie suas fotos do casamento"
            description="Clique para abrir a pasta e fazer upload das suas fotos."
            href={cleanContent.photosUploadLink}
            buttonText="Enviar fotos"
            actionsAlign="center"
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
