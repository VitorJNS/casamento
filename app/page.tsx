import { Footer } from "@/component/Footer";
import { Hero } from "@/component/Hero";
import { LinkCard } from "@/component/LinkCard";
import { LocationCard } from "@/component/LocationCard";
import { PhotoGallery } from "@/component/PhotoGallery";
import { Section } from "@/component/Section";
import { TopSectionNav } from "@/component/TopSectionNav";
import { WeddingGiftList } from "@/component/WeddingGiftList";
import { siteContent } from "@/content/siteContent";

export default function Home() {
  const navItems = [
    { id: "inicio", label: "Inicio", mobileLabel: "Inicio" },
    { id: "boas-vindas", label: "Boas-vindas", mobileLabel: "Boas" },
    { id: "historia", label: "O casal", mobileLabel: "Casal" },
    { id: "fotos", label: "Pre-wedding", mobileLabel: "Fotos" },
    { id: "dresscode", label: "Dress Code", mobileLabel: "Traje" },
    { id: "localizacao", label: "Localizacao", mobileLabel: "Local" },
    { id: "pix", label: "Presentes", mobileLabel: "Lista" },
    { id: "fotos-casamento", label: "Fotos", mobileLabel: "Envio" },
  ];

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-10">
      <TopSectionNav items={navItems} />

      <section
        id="inicio"
        className="section-shell section-fullscreen mb-10 rounded-3xl"
      >
        <Hero dateText="20 • 06 • 2027" coupleName="Yasmim & Vitor" subtitle="" />
      </section>

      <Section id="boas-vindas" title={siteContent.welcomeTitle}>
        <p className="whitespace-pre-line">{siteContent.welcomeText}</p>
      </Section>

      <Section id="historia" title={siteContent.storyTitle}>
        <p>{siteContent.storyText}</p>
      </Section>

      <Section id="fotos" title="Pre-wedding">
        <p className="mb-4">Alguns registros desse momento especial.</p>
        <PhotoGallery photos={siteContent.preWeddingPhotos} />
      </Section>

      <Section id="dresscode" title={siteContent.dressCodeTitle}>
        <p className="whitespace-pre-line">{siteContent.dressCodeText}</p>
      </Section>

      <Section id="localizacao" title={siteContent.localizacaoTitle}>
        <p className="mb-4">{siteContent.localizacaoText}</p>

        <LocationCard
          address={siteContent.localizacaoAddress}
          mapsLink={siteContent.localizacaoMapsLink}
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white/70 shadow-sm">
          <iframe
            title="Mapa do local do evento"
            src="https://www.google.com/maps?q=Praca%20Antonio%20Keller%2C%2022%20-%20Monte%20Alegre%2C%20Piracicaba%20-%20SP%2C%2013415-020&output=embed"
            className="h-[260px] w-full sm:h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Section>

      <Section id="fotos-casamento" title="Fotos do casamento">
        <p className="mb-4">{siteContent.photosUploadText}</p>

        <LinkCard
          title={siteContent.photosUploadTitle}
          description="Clique para abrir a pasta e fazer upload das suas fotos."
          href={siteContent.photosUploadLink}
          buttonText="Enviar fotos"
        />
      </Section>

      <Section id="pix" title={siteContent.pixTitle}>
        <p className="mb-4">{siteContent.pixText}</p>
        <p className="mb-5 text-sm text-zinc-600">{siteContent.giftListIntro}</p>

        <WeddingGiftList gifts={siteContent.weddingGifts} />
      </Section>

      <Footer
        names="Yasmim & Vitor"
        dateText="20 • 06 • 2027"
        note="Esperamos voce no nosso grande dia."
      />
    </main>
  );
}
