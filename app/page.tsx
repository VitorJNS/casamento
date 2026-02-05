
import { Footer } from "@/component/Footer";
import { Hero } from "@/component/Hero";
import { LinkCard } from "@/component/LinkCard";
import { PhotoGallery } from "@/component/PhotoGallery";
import { PixCard } from "@/component/PixCard";
import { Section } from "@/component/Section";
import { siteContent } from "@/content/siteContent";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <Hero
          dateText="20 • 06 • 2027"
          coupleName="Yasmim & Vitor"
          subtitle="Bem-vindos ao nosso site! Aqui você encontra informações rápidas e fotos"
        />

        <nav className="mt-6 flex flex-wrap gap-2">
          {[
            ["#boas-vindas", "Boas-vindas"],
            ["#historia", "Nossa história"],
            ["#dresscode", "Dress code"],
            ["#fotos", "Pré-wedding"],
            ["#fotos-casamento", "Fotos do casamento"],
            ["#pix", "Pix"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="nav-chip">
              {label}
            </a>
          ))}
        </nav>

      </div>

      <div className="my-10 h-px w-full bg-zinc-200/70" />


      <Section id="boas-vindas" title={siteContent.welcomeTitle}>
        <p>{siteContent.welcomeText}</p>
      </Section>

      <Section id="historia" title={siteContent.storyTitle}>
        <p>{siteContent.storyText}</p>
      </Section>

      <Section id="dresscode" title={siteContent.dressCodeTitle}>
        <p>{siteContent.dressCodeText}</p>
      </Section>

      <Section id="fotos" title="Fotos do pré-wedding">
        <p className="mb-4">Alguns registros desse momento especial ❤️</p>
        <PhotoGallery photos={siteContent.preWeddingPhotos} />
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
          title="Chave Pix"
          description="Você pode copiar a chave ou escanear o QR."
          pixKey={siteContent.pixKey}
        />
      </Section>

      <Footer
        names="Yasmim & Vitor"
        dateText="20 • 06 • 2027"
        note="Com carinho, esperamos você no nosso grande dia."
      />

    </main>
  );
}
