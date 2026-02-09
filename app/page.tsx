
import { Footer } from "@/component/Footer";
import { Hero } from "@/component/Hero";
import { LinkCard } from "@/component/LinkCard";
import { LocationCard } from "@/component/LocationCard";
import { PhotoGallery } from "@/component/PhotoGallery";
import { PixCard } from "@/component/PixCard";
import { Section } from "@/component/Section";
import { siteContent } from "@/content/siteContent";

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <Hero
          dateText="20 • 06 • 2027"
          coupleName="Yasmim & Vitor" subtitle={""}          
        />

        <nav className="mt-6 flex flex-wrap gap-2">
          {[
            ["#boas-vindas", "Boas-vindas"],
            ["#historia", "Nossa história"],
            ["#fotos", "Pré-wedding"],
            ["#dresscode", "Dress Code"],
            ["#localizacao", "Localização"],
            ["#pix", "Pix"],
            ["#fotos-casamento", "Fotos do casamento"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="nav-chip">
              {label}
            </a>
          ))}
        </nav>

      </div>

      <div className="my-10 h-px w-full bg-zinc-200/70" />

      <Section id="boas-vindas" title={siteContent.welcomeTitle}>
        <p className="whitespace-pre-line">{siteContent.welcomeText}</p>
      </Section>

      <Section id="historia" title={siteContent.storyTitle}>
        <p>{siteContent.storyText}</p>
      </Section>

      <Section id="fotos" title="Fotos do pré-wedding">
        <p className="mb-4">Alguns registros desse momento especial ❤️</p>
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
            className="h-[260px] sm:h-[360px] w-full"
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

        <PixCard
          title="Pix"
          description="Você pode escanear o QR ou copiar o código Pix."
          pixKey={siteContent.pixKey}
          pixCopiaECola={siteContent.pixCopiaECola}
        />
      </Section>

      <Footer
        names="Yasmim & Vitor"
        dateText="20 • 06 • 2027"
        note="Esperamos você no nosso grande dia."
      />

    </main>
  );
}
