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
    { id: "inicio", label: "HOME" },
    { id: "boas-vindas", label: "BEM VINDOS" },
    { id: "historia", label: "O CASAL" },
    { id: "fotos", label: "PRE-WEDDING" },
    { id: "dresscode", label: "DRESS CODE" },
    { id: "cerimonia", label: "CERIMONIA" },
    { id: "jantar", label: "JANTAR" },
    { id: "rsvp", label: "CONFIRME SUA PRESENCA" },
    { id: "pix", label: "LISTA DE PRESENTES" },
    { id: "fotos-casamento", label: "MOMENTOS" },
  ];

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 pb-10 pt-6">
      <TopSectionNav items={navItems} />

      <section
        id="inicio"
        className="section-shell section-fullscreen mb-10 rounded-3xl"
      >
        <Hero dateText="20 • 06 • 2027" coupleName="Yasmim & Vitor" subtitle="" />
      </section>

      <SectionDivider />

      <Section
        id="boas-vindas"
        title={siteContent.welcomeTitle}
        titleClassName="text-3xl tracking-[0.08em] sm:text-5xl"
      >
        <p className="whitespace-pre-line">{siteContent.welcomeText}</p>
      </Section>
      <SectionDivider />

      <CoupleStorySection
        id="historia"
        title={siteContent.storyTitle}
        text={siteContent.storyText}
        leftPortrait={siteContent.storyPortraitLeft}
        rightPortrait={siteContent.storyPortraitRight}
        timelineImage={siteContent.storyTimelineImage}
      />
      <SectionDivider />

      <Section id="fotos" title="Pre-wedding">
        <p className="mb-4">Alguns registros desse momento especial.</p>
        <PhotoGallery photos={siteContent.preWeddingPhotos} />
      </Section>
      <SectionDivider />

      <Section id="dresscode" title={siteContent.dressCodeTitle}>
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
                    <div className="relative h-[13rem] w-full overflow-hidden sm:h-[18rem]">
                      <Image
                        src="/dresscode/dresscode.png?v=20260526-2244"
                        alt="Referencia visual para o dress code do casamento"
                        fill
                        quality={100}
                        priority
                        sizes="(max-width: 640px) 100vw, 960px"
                        className="object-contain object-center"
                        style={{ transform: "translateY(-42%) scale(1.4)" }}
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

      <Section id="rsvp" title={siteContent.rsvpTitle}>
        <p className="mb-3">{siteContent.rsvpText}</p>
        <p className="mb-5 text-sm text-zinc-600">{siteContent.rsvpNote}</p>
        <RsvpForm />
      </Section>
      <SectionDivider />

      <Section id="pix" title={siteContent.pixTitle}>
        <p className="mb-4">{siteContent.pixText}</p>
        <p className="mb-5 text-sm text-zinc-600">{siteContent.giftListIntro}</p>

        <GiftRegistry gifts={giftCatalog} />
      </Section>
      <SectionDivider />

      <Section id="fotos-casamento" title="Fotos do casamento">
        <p className="mb-4">{siteContent.photosUploadText}</p>

        <LinkCard
          title={siteContent.photosUploadTitle}
          description="Clique para abrir a pasta e fazer upload das suas fotos."
          href={siteContent.photosUploadLink}
          buttonText="Enviar fotos"
        />
      </Section>

      <Footer
        names="Yasmim & Vitor"
        dateText="20 • 06 • 2027"
        note="Esperamos voce no nosso grande dia."
      />
    </main>
  );
}
