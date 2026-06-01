import { CoupleStorySection } from "@/component/CoupleStorySection";
import { GiftRegistry } from "@/component/GiftRegistry";
import { Footer } from "@/component/Footer";
import { Hero } from "@/component/Hero";
import { LinkCard } from "@/component/LinkCard";
import { LocationCard } from "@/component/LocationCard";
import { PhotoGallery } from "@/component/PhotoGallery";
import { RsvpForm } from "@/component/RsvpForm";
import { Section } from "@/component/Section";
import { SectionDivider } from "@/component/SectionDivider";
import { TopSectionNav } from "@/component/TopSectionNav";
import { siteContent } from "@/content/siteContent";
import { getDisplayGiftCatalog } from "@/lib/gifts";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Home() {
  const giftCatalog = await getDisplayGiftCatalog();
  const dressCodeParagraphs = siteContent.dressCodeText.split("\n");
  const navItems = [
    { id: "home", label: "HOME" },
    { id: "bem-vindos", label: "BEM VINDOS" },
    { id: "o-casal", label: "O CASAL" },
    { id: "pre-wedding", label: "PRE-WEDDING" },
    { id: "dress-code", label: "DRESS CODE" },
    { id: "cerimonia", label: "CERIMONIA" },
    { id: "jantar", label: "JANTAR" },
    { id: "confirmar-presenca", label: "CONFIRME SUA PRESENCA" },
    { id: "lista-de-presentes", label: "LISTA DE PRESENTES" },
    { id: "momentos", label: "MOMENTOS" },
  ];

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 pb-10 pt-6">
      <TopSectionNav items={navItems} />

      <section
        id="home"
        className="section-shell section-fullscreen mb-10 rounded-3xl"
      >
        <Hero dateText="20 • 06 • 2027" coupleName="Yasmim & Vitor" subtitle="" />
      </section>

      <SectionDivider />

      <Section
        id="bem-vindos"
        title={siteContent.welcomeTitle}
        titleClassName="text-3xl tracking-[0.08em] sm:text-5xl"
      >
        <p className="whitespace-pre-line">{siteContent.welcomeText}</p>
      </Section>
      <SectionDivider />

      <CoupleStorySection
        id="o-casal"
        title={siteContent.storyTitle}
        text={siteContent.storyText}
        leftPortrait={siteContent.storyPortraitLeft}
        rightPortrait={siteContent.storyPortraitRight}
        timelineImage={siteContent.storyTimelineImage}
      />
      <SectionDivider />

      <Section id="pre-wedding" title="Pre-wedding">
        <p className="mb-4">Alguns registros desse momento especial.</p>
        <PhotoGallery photos={siteContent.preWeddingPhotos} />
      </Section>
      <SectionDivider />

      <Section id="dress-code" title={siteContent.dressCodeTitle}>
        <div className="space-y-3 text-zinc-700">
          {dressCodeParagraphs.map((paragraph, index) => {
            const trimmedParagraph = paragraph.trim();
            const nextTrimmedParagraph = dressCodeParagraphs[index + 1]?.trim() ?? "";

            if (!trimmedParagraph) {
              const isBeforeSpecialColors = nextTrimmedParagraph === "Cores especiais 🌿";

              return (
                <div
                  key={`dresscode-space-${index}`}
                  className={isBeforeSpecialColors ? "h-0.5" : "h-2"}
                />
              );
            }

            if (trimmedParagraph === "Para elas ✨" || trimmedParagraph === "Para eles 🤎") {
              return (
                <p key={trimmedParagraph} className="font-semibold text-zinc-900">
                  {trimmedParagraph}
                </p>
              );
            }

            if (trimmedParagraph === "Cores especiais 🌿") {
              return (
                <div key={trimmedParagraph} className="pt-1">
                  <div className="mb-3">
                    <div className="relative h-[14rem] w-full overflow-hidden sm:h-[19rem]">
                      <Image
                        src="/dresscode/dresscode.png?v=20260526-2244"
                        alt="Referencia visual para o dress code do casamento"
                        fill
                        quality={100}
                        priority
                        sizes="(max-width: 640px) 100vw, 960px"
                        className="object-contain object-center"
                        style={{ transform: "translateY(-5%) scale(1.0)" }}
                      />
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-zinc-900">
                    {trimmedParagraph}
                  </p>
                </div>
              );
            }

            return <p key={`${trimmedParagraph}-${index}`}>{trimmedParagraph}</p>;
          })}
        </div>

      </Section>
      <SectionDivider />

      <Section id="cerimonia" title={siteContent.ceremonyTitle}>
        <p className="mb-4">{siteContent.ceremonyText}</p>

        <LocationCard
          address={siteContent.ceremonyAddress}
          mapsLink={siteContent.ceremonyMapsLink}
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white/55 shadow-sm">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/locations/capela.jpg"
              alt="Capela da cerimonia"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 960px"
              className="object-cover"
            />
          </div>
        </div>
      </Section>
      <SectionDivider />

      <Section id="jantar" title={siteContent.dinnerTitle}>
        <p className="mb-4">{siteContent.dinnerText}</p>

        <LocationCard
          address={siteContent.dinnerAddress}
          mapsLink={siteContent.dinnerMapsLink}
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white/55 shadow-sm">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src="/locations/casa-lucca.png"
              alt="Casa Lucca, local do jantar"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, 960px"
              className="object-cover"
            />
          </div>
        </div>

        {/* <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 shadow-sm">
          <iframe
            title="Mapa do jantar"
            src={siteContent.dinnerMapEmbedUrl}
            className="h-[260px] w-full sm:h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div> */}
      </Section>
      <SectionDivider />

      <Section id="confirmar-presenca" title={siteContent.rsvpTitle}>
        <p className="mb-3">{siteContent.rsvpText}</p>
        <p className="mb-5 text-sm text-zinc-600">{siteContent.rsvpNote}</p>
        <RsvpForm />
      </Section>
      <SectionDivider />

      <Section id="lista-de-presentes" title={siteContent.pixTitle}>
        <p className="mb-4">{siteContent.pixText}</p>
        <p className="mb-5 text-sm text-zinc-600">{siteContent.giftListIntro}</p>

        <GiftRegistry gifts={giftCatalog} />
      </Section>
      <SectionDivider />

      <Section id="momentos" title="Momentos" fullScreen={false}>
        <p className="mb-4 whitespace-pre-line">{siteContent.photosUploadText}</p>

        <LinkCard
          title={siteContent.photosUploadTitle}
          description="Clique para abrir a pasta e fazer upload das suas fotos."
          href={siteContent.photosUploadLink}
          buttonText="Enviar fotos"
        />
      </Section>
      <SectionDivider />

      <Footer
        names="Yasmim & Vitor"
        dateText="20 • 06 • 2027"
        note="Esperamos voce no nosso grande dia."
      />
    </main>
  );
}
