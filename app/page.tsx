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

export const dynamic = "force-dynamic";

export default async function Home() {
  const giftCatalog = await getDisplayGiftCatalog();
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
        <p className="whitespace-pre-line">{siteContent.dressCodeText}</p>
      </Section>
      <SectionDivider />

      <Section id="cerimonia" title={siteContent.ceremonyTitle}>
        <p className="mb-4">{siteContent.ceremonyText}</p>

        <LocationCard
          address={siteContent.ceremonyAddress}
          mapsLink={siteContent.ceremonyMapsLink}
        />
      </Section>
      <SectionDivider />

      <Section id="jantar" title={siteContent.dinnerTitle}>
        <p className="mb-4">{siteContent.dinnerText}</p>

        <LocationCard
          address={siteContent.dinnerAddress}
          mapsLink={siteContent.dinnerMapsLink}
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 shadow-sm">
          <iframe
            title="Mapa do jantar"
            src={siteContent.dinnerMapEmbedUrl}
            className="h-[260px] w-full sm:h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
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
