const giftDisplayOrder = [
  "gift-teste-cartao",
  "gift-fogao-inducao",
  "gift-air-fryer",
  "gift-jogo-toalhas",
  "gift-passeio-vaticano",
  "gift-proximos-capitulos",
  "gift-filhos-quatro-patas",
  "gift-mini-nos",
  "gift-micro-ondas",
  "gift-cafeteira-casamento",
  "gift-jogo-tacas",
  "gift-maquina-lavar",
  "gift-date-night",
  "gift-jantar-romantico",
  "gift-passeios",
  "gift-noites-frias",
  "gift-ifood",
  "gift-cozinha-imaginaria",
  "gift-sobrevivencia-pos-mudanca",
  "gift-moveis-improvisados",
  "gift-home-office",
  "gift-romaria-recem-casados",
  "gift-lua-de-mel",
];

function orderWeddingGifts<T extends { id: string }>(gifts: T[]) {
  const displayRank = new Map(
    giftDisplayOrder.map((giftId, index) => [giftId, index]),
  );

  return [...gifts].sort(
    (firstGift, secondGift) =>
      (displayRank.get(firstGift.id) ?? Number.MAX_SAFE_INTEGER) -
      (displayRank.get(secondGift.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

export const siteContent = {
  coupleName: "Yasmim & Vitor",
  welcomeTitle: "Sejam bem-vindos",
  welcomeText: `Estamos muito felizes em compartilhar este momento tão especial com pessoas que fazem parte da nossa história.

Depois de tantos anos caminhando juntos, chegou o dia de celebrarmos o nosso amor diante de Deus e ao lado de quem amamos.

Criamos este espaço para compartilhar um pouco da nossa trajetória e reunir todas as informações importantes sobre o casamento.

Cada presença será extremamente importante para nós.
Esperamos que este dia seja leve, emocionante e inesquecível — não apenas para nós, mas também para todos que estarão vivendo esse sonho conosco.

Com amor,
Yas & Vitor`,

  storyTitle: "Nossa História",
  storyText: `Alguns encontros mudam completamente o rumo da nossa vida — e o nosso começou lá em 2020.

Desde então, crescemos juntos, amadurecemos, realizamos sonhos, enfrentamos mudanças e construímos, dia após dia, a nossa família e o nosso lar.

Entre conquistas, recomeços, quilômetros de distância e muitos planos compartilhados, entendemos que o amor está justamente nos pequenos momentos vividos lado a lado.

E agora, depois de tantos capítulos especiais, estamos prontos para viver o mais importante deles: o nosso casamento. ✨`,
  storyPortraitLeft: {
    src: "/prewedding/01.jpg",
    alt: "Retrato da noiva",
  },
  storyPortraitRight: {
    src: "/prewedding/02.jpg",
    alt: "Retrato do noivo",
  },
  storyTimelineImage: {
    src: "/story/timeline-full.png",
    alt: "Linha do tempo da história do casal",
  },

  dressCodeTitle: "Dress Code",
  dressCodeText: `Escolhemos com muito carinho o traje esporte fino para celebrar este momento tão especial ao nosso lado.
Nosso casamento acontecerá ao final da tarde, em junho — uma época em que as temperaturas costumam ser mais frias. Por isso, sugerimos looks elegantes, confortáveis e adequados para o clima da estação.

Para elas ✨
Vestidos midi ou longos, tecidos fluidos e tons suaves combinarão perfeitamente com a atmosfera do nosso grande dia.
Sugerimos evitar:
  - Jeans
  - Roupas muito curtas
  - Decotes excessivos
  - Salto desconfortável

Casacos delicados e mangas longas também serão muito bem-vindos.

Para eles 🤎
Camisa, calça de alfaiataria e sapatos sociais são ótimas escolhas para a ocasião.
Blazers e sobreposições sofisticadas também combinarão perfeitamente com o clima do casamento.
Sugerimos evitar:
  - Jeans
  - Bermudas
  - Tênis esportivos

Cores especiais 🌿
Nossos padrinhos usarão tons de chumbo, nossas madrinhas estarão em lavanda, e o branco será reservado para a noiva.
Pedimos, com carinho, que evitem essas tonalidades para que cada um tenha seu destaque especial neste dia tão importante.`,

  ceremonyTitle: "Cerimonia",
  ceremonyText:
    "Abaixo, disponibilizamos o endereço completo e o link para acesso pelo Google Maps, para facilitar sua chegada à cerimônia.",
  ceremonyAddress:
    "Av. Comendador Pedro Morganti, s/n - Monte Alegre, Piracicaba - SP, 13415-001",
  ceremonyMapsLink: "https://maps.app.goo.gl/fXMbsrVRAooaDbXQ9",
  ceremonyMapEmbedUrl: "",

  dinnerTitle: "Jantar",
  dinnerAddress:
    "Praca Antonio Keller, 22 - Monte Alegre, Piracicaba - SP, 13415-020",
  dinnerMapsLink:
    "https://www.google.com/maps/search/?api=1&query=Praca%20Antonio%20Keller%2C%2022%20-%20Monte%20Alegre%2C%20Piracicaba%20-%20SP%2C%2013415-020",
  dinnerMapEmbedUrl:
    "https://www.google.com/maps?q=Praca%20Antonio%20Keller%2C%2022%20-%20Monte%20Alegre%2C%20Piracicaba%20-%20SP%2C%2013415-020&output=embed",
  dinnerText:
    "Abaixo, disponibilizamos o endereço completo e o link para acesso pelo Google Maps, para facilitar sua chegada ao jantar.",

  rsvpTitle: "Confirmação de presença",
  rsvpText: `
Para nos auxiliar na organização do casamento, pedimos que confirme sua presença através do formulário abaixo.
Agradecemos imensamente por fazer parte deste momento tão especial. 🤍`,
  rsvpNote:
    "Informe seu nome, contato e se estará presente. Caso venha acompanhado, nos conte quantas pessoas serão ao todo.",

  photosTitle: "Pre-wedding",
  photosText: "Vamos colocar uma galeria aqui (na próxima etapa).",

  qrTitle: "QR Code",
  qrText:
    "Aponte a câmera para acessar rapidamente o site, álbum ou local do evento.",

  preWeddingPhotos: [
    { src: "/prewedding/01.jpg", alt: "Pre-wedding 1" },
    { src: "/prewedding/02.jpg", alt: "Pre-wedding 2" },
    { src: "/prewedding/03.jpg", alt: "Pre-wedding 3" },
  ],

  photosUploadTitle: "Envie suas fotos do casamento",
  photosUploadText: `Compartilhar memórias 🤍
Cada sorriso, abraço e momento vivido neste dia será extremamente especial para nós.
Criamos este espaço para que vocês possam compartilhar todas as fotos e vídeos registrados durante o casamento. Assim, poderemos reviver cada detalhe através do olhar de pessoas tão importantes em nossa história. ✨

📸 Compartilhe seus registros
Clique no botão abaixo para acessar nossa pasta compartilhada no Google Drive e enviar suas fotos.

☁️ Armazenamento das fotos
Todos os arquivos enviados serão salvos diretamente em nossa pasta do Google Drive.

🤍 Nosso pedido especial
Não deixe nenhum momento passar despercebido — queremos guardar cada memória deste dia inesquecível ao lado de vocês.`,
  photosUploadLink:
    "https://drive.google.com/drive/folders/1AeLG19cg5cFsDOj0DJwHgvfh6dLpQAK8?usp=sharing",

  pixTitle: "Lista de presentes",
  pixText:
    "A presença de cada um de vocês já torna este dia ainda mais especial para nós.\nCriamos nossa lista de presentes apenas para aqueles que desejarem participar, de alguma forma, da construção do nosso novo lar e do início desta nova fase das nossas vidas. ✨\nCada gesto será recebido com muita gratidão e carinho, e certamente fará parte da nossa história e do nosso futuro juntos.",
  giftListIntro:
    "Agora você pode juntar vários presentes em uma única compra, preencher seus dados e concluir tudo em um checkout único.",
  weddingGifts: orderWeddingGifts([
    {
      id: "gift-teste-cartao",
      category: "Teste",
      title: "Presente teste",
      description: "Item temporário para testar pagamento com cartão.",
      priceLabel: "R$ 5,00",
      infinityPay: "",
    },
    {
      id: "gift-moveis-improvisados",
      category: "Casa nova",
      title: "Projeto 'adeus móveis improvisados'",
      description:
        "Ajude os noivos a construírem um lar bonito, aconchegante e digno de adultos funcionais 🛋️",
      priceLabel: "R$ 350,00",
      infinityPay: "",
      imageSrc: "/presents/Projeto%20%E2%80%9Cadeus%20m%C3%B3veis%20improvisados%E2%80%9D.png",
    },
    {
      id: "gift-sobrevivencia-pos-mudanca",
      category: "Casa nova",
      title: "Kit sobrevivência pós mudança",
      description:
        "Ajude os noivos a enfrentarem caixas, montagem de móveis e dores nas costas hahaha",
      priceLabel: "R$ 290,00",
      infinityPay: "",
      imageSrc: "/presents/Kit%20sobreviv%C3%AAncia%20p%C3%B3s%20mudan%C3%A7a.png",
    },
    {
      id: "gift-ifood",
      category: "Experiências",
      title: "Fundo 'vamos pedir iFood hoje mesmo'",
      description:
        "Nem só de amor vive um casal moderno.",
      priceLabel: "R$ 200,00",
      infinityPay: "",
      imageSrc: "/presents/Fundo%20%E2%80%9Cvamos%20pedir%20iFood%20hoje%20mesmo%E2%80%9D.png",
    },
    {
      id: "gift-passeios",
      category: "Experiências",
      title: "Passeios aleatórios de mãos dadas",
      description:
        "Contribuição oficial para aventuras, caminhadas e momentos inesquecíveis juntos.",
      priceLabel: "R$ 250,00",
      infinityPay: "",
      imageSrc: "/presents/Passeios%20aleat%C3%B3rios%20de%20m%C3%A3os%20dadas.png",
    },
    {
      id: "gift-lua-de-mel",
      category: "Lua de mel",
      title: "Fundo 'vamos sumir do mapa por alguns dias'",
      description: "Ajude os noivos a viverem a tão sonhada lua de mel.",
      priceLabel: "R$ 1.500,00",
      infinityPay: "",
      imageSrc: "/presents/Fundo%20%E2%80%9Cvamos%20sumir%20do%20mapa%20por%20alguns%20dias%E2%80%9D.png",
    },
    {
      id: "gift-home-office",
      category: "Casa nova",
      title: "Conta de energia do home office",
      description:
        "Dois computadores, café o dia inteiro e muitos boletos.",
      priceLabel: "R$ 320,00",
      infinityPay: "",
      imageSrc: "/presents/Conta%20de%20energia%20do%20home%20office.png",
    },
    {
      id: "gift-filhos-quatro-patas",
      category: "Pets",
      title: "Contribuição oficial dos filhos de quatro patas",
      description:
        "Aurora, Amanda, Theo, Valentina e Lua agradecem hahaha",
      priceLabel: "R$ 600,00",
      infinityPay: "",
      imageSrc: "/presents/Contribui%C3%A7%C3%A3o%20oficial%20dos%20filhos%20de%20quatro%20patas.png",
    },
    {
      id: "gift-date-night",
      category: "Experiências",
      title: "Kit date night dos recém-casados",
      description:
        "Ajude os noivos a continuarem saindo juntos depois do casamento 😭",
      priceLabel: "R$ 180,00",
      infinityPay: "",
      imageSrc: "/presents/Kit%20date%20night%20dos%20rec%C3%A9m-casados.png",
    },
    {
      id: "gift-noites-frias",
      category: "Experiencias",
      title: "Contribuição para noites frias de junho",
      description:
        "Ajude os noivos a investirem em mantinhas, conforto e chocolate quente.",
      priceLabel: "R$ 250,00",
      infinityPay: "",
      imageSrc: "/presents/Contribui%C3%A7%C3%A3o%20para%20noites%20frias%20de%20junho.png",
    },
    {
      id: "gift-cozinha-imaginaria",
      category: "Casa nova",
      title: "Kit cozinha gourmet imaginária",
      description:
        "Porque na nossa cabeça cozinhamos igual programa culinário.",
      priceLabel: "R$ 200,00",
      infinityPay: "",
      imageSrc: "/presents/Kit%20cozinha%20gourmet%20imagin%C3%A1ria.png",
    },
    {
      id: "gift-jantar-romantico",
      category: "Lua de mel",
      title: "Jantar romântico patrocinado",
      description:
        "Ajude os noivos a viverem uma noite especial durante a viagem.",
      priceLabel: "R$ 380,00",
      infinityPay: "",
      imageSrc: "/presents/Jantar%20rom%C3%A2ntico%20patrocinado.png",
    },
    {
      id: "gift-mini-nos",
      category: "Família",
      title: "Fundo 'talvez venha um mini nós por aí'",
      description:
        "Ajude os noivos a começarem o futuro quartinho, as roupinhas minúsculas e os sonhos da nossa futura família hahaha",
      priceLabel: "R$ 450,00",
      infinityPay: "",
      imageSrc: "/presents/Fundo%20%E2%80%9Ctalvez%20venha%20um%20mini%20n%C3%B3s%20por%20a%C3%AD%E2%80%9D.png",
    },
    {
      id: "gift-romaria-recem-casados",
      category: "Experiências",
      title: "Projeto 'mini romaria dos recém-casados'",
      description:
        "Porque depois do casamento também queremos agradecer cada benção recebida juntinhos 🤍",
      priceLabel: "R$ 450,00",
      infinityPay: "",
      imageSrc: "/presents/Projeto%20%E2%80%9Cmini%20romaria%20dos%20rec%C3%A9m-casados%E2%80%9D.png",
    },
    {
      id: "gift-fogao-inducao",
      category: "Casa nova",
      title: "Fogão por indução — início oficial da nossa era MasterChef 🍳🔥",
      description:
        "Patrocine nossas futuras aventuras culinárias — as receitas podem dar errado, mas pelo menos o fogão será bonito. 😂",
      priceLabel: "R$ 1.800,00",
      infinityPay: "",
      imageSrc: "/presents/fogao-inducao.png",
    },
    {
      id: "gift-jogo-toalhas",
      category: "Casa nova",
      title: "Jogo de toalhas para nossa casa 🛁🤍",
      description:
        "Para começarmos a vida de casados com toalhas bonitas, macias e oficialmente combinando hahaha",
      priceLabel: "R$ 200,00",
      infinityPay: "",
      imageSrc: "/presents/jogo-toalhas.png",
    },
    {
      id: "gift-maquina-lavar",
      category: "Casa nova",
      title: "Máquina de lavar — patrocinando nossa independência doméstica 🧺😂",
      description:
        "Para que a pilha de roupas nunca mais vença a gente. Liberdade, praticidade e mais tempo juntos! 🤍",
      priceLabel: "R$ 4.500,00",
      infinityPay: "",
      imageSrc: "/presents/Maquina%20de%20Lavar.png",
    },
    {
      id: "gift-cafeteira-casamento",
      category: "Casa nova",
      title: "Cafeteira — combustível oficial deste casamento ☕🤎",
      description:
        "Para abastecer nossos dias, as conversas, os planos e, principalmente, a paciência um com o outro 😂🤍",
      priceLabel: "R$ 400,00",
      infinityPay: "",
      imageSrc: "/presents/Cafeteira.png",
    },
    {
      id: "gift-proximos-capitulos",
      category: "Experiências",
      title: "Fundo para os próximos capítulos da nossa história 📖🤍",
      description:
        "Para realizarmos sonhos, vivermos pequenas e grandes aventuras e continuarmos colecionando memórias inesquecíveis juntos. ✨",
      priceLabel: "R$ 390,00",
      infinityPay: "",
      imageSrc: "/presents/Fundo%20para%20os%20proximos%20capitulos.png",
    },
    {
      id: "gift-micro-ondas",
      category: "Casa nova",
      title: "Micro-ondas — para salvar os dias corridos ⏰🍝",
      description:
        "Para esquentar refeições, ganhar tempo e ter mais momentos para o que realmente importa: nós dois! 🤍",
      priceLabel: "R$ 500,00",
      infinityPay: "",
      imageSrc: "/presents/Micro-ondas.png",
    },
    {
      id: "gift-jogo-tacas",
      category: "Casa nova",
      title: "Jogo de taças — porque a noiva é a louca das taças 🥂😂",
      description:
        "Para brindarmos cada conquista, cada novo capítulo e, claro, justificar a necessidade de ter uma taça diferente para cada ocasião hahaha.",
      priceLabel: "R$ 250,00",
      infinityPay: "",
      imageSrc: "/presents/Jogo%20de%20tacas.png",
    },
    {
      id: "gift-passeio-vaticano",
      category: "Lua de mel",
      title: "Passeio na lua de mel — Vaticano & Basílica de São Pedro ⛪VA🤍",
      description:
        "Ajude os noivos a viverem um dos momentos mais especiais da viagem: conhecer o Vaticano, visitar a Basílica de São Pedro e agradecer por esse novo capítulo da nossa história.",
      priceLabel: "R$ 500,00",
      infinityPay: "",
      imageSrc: "/presents/Passeio%20lua%20de%20mel.png",
    },
  ]),
};
