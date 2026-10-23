import type { Locale, PageKey } from '../lib/i18n';

type NavItem = { label: string; page: PageKey };
type LinkItem = { label: string; detail: string; page: PageKey };

export type PageCopy = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  imageAlt: string;
  imageCaption: string;
};

export type SiteCopy = {
  localeLabel: string;
  otherLocaleLabel: string;
  nav: NavItem[];
  home: {
    title: string;
    description: string;
    heading: string;
    intro: string;
    primaryAction: string;
    secondaryAction: string;
    imageAlt: string;
    imageCaption: string;
    servicesTitle: string;
    services: Array<{ title: string; body: string }>;
    exploreTitle: string;
    exploreLinks: LinkItem[];
    galleryTitle: string;
    galleryNote: string;
    gallery: Array<{ src: string; alt: string }>;
    contactTitle: string;
    contactBody: string;
    contactAction: string;
  };
  about: PageCopy & {
    valuesTitle: string;
    values: Array<{ title: string; body: string }>;
  };
  food: PageCopy;
  cellar: PageCopy;
  contact: PageCopy & {
    formTitle: string;
    formNote: string;
    fields: { name: string; email: string; message: string; submit: string };
    detailsTitle: string;
    details: Array<{ label: string; value: string; href?: string }>;
  };
  footer: { statement: string; credit: string };
};

const sharedNavCa: NavItem[] = [
  { label: 'Inici', page: 'home' },
  { label: 'Aliments', page: 'food' },
  { label: 'Celler', page: 'cellar' },
  { label: 'Nosaltres', page: 'about' },
  { label: 'Contacte', page: 'contact' },
];

const sharedNavEs: NavItem[] = [
  { label: 'Inicio', page: 'home' },
  { label: 'Alimentos', page: 'food' },
  { label: 'Bodega', page: 'cellar' },
  { label: 'Nosotros', page: 'about' },
  { label: 'Contacto', page: 'contact' },
];

export const content: Record<Locale, SiteCopy> = {
  ca: {
    localeLabel: 'CA',
    otherLocaleLabel: 'ES',
    nav: sharedNavCa,
    home: {
      title: 'Distribució alimentària a Lleida i el Pirineu | Poblaliment',
      description:
        'Distribuïm vins, begudes i productes gourmet amb flota pròpia a Lleida, el Prepirineu i el Pirineu. Servei per a restauració, comerç i particulars.',
      heading: 'Distribuïm confiança.',
      intro:
        'Distribuïm aliments amb agilitat, proximitat i confiança perquè cada producte arribi on ha d’arribar.',
      primaryAction: 'Coneix-nos',
      secondaryAction: 'Parlem',
      imageAlt: 'Camió de Poblaliment repartint producte al capvespre',
      imageCaption: 'La distribució també forma part del producte.',
      servicesTitle: 'Els nostres serveis',
      services: [
        {
          title: 'Distribució local i nacional',
          body: 'Distribuïm a la província de Lleida, el Prepirineu i el Pirineu amb flota pròpia, rutes adaptades al territori i cura en cada lliurament.',
        },
        {
          title: 'Atenció personalitzada',
          body: 'Acompanyem bars, restaurants, càmpings, hotels, carnisseries, botigues especialitzades i particulars amb un tracte directe, àgil i de confiança.',
        },
      ],
      exploreTitle: 'Explora Poblaliment',
      exploreLinks: [
        { label: 'Nosaltres', detail: 'La base del projecte', page: 'about' },
        { label: 'Aliments', detail: 'Proveïdors per família de producte', page: 'food' },
        { label: 'Celler', detail: 'Vins, escumosos i cervesa', page: 'cellar' },
        { label: 'Contacte', detail: 'Obrim una conversa', page: 'contact' },
      ],
      galleryTitle: 'Una mirada al nostre dia a dia',
      galleryNote: 'Imatges de suport · galeria preparada per ampliar',
      gallery: [
        { src: '/images/truck-sunset.jpg', alt: 'Camió de Poblaliment en ruta al capvespre' },
        {
          src: '/images/truck-snow.jpg',
          alt: 'Camió de Poblaliment en una carretera d’alta muntanya',
        },
        { src: '/images/moritz-pirineus.jpg', alt: 'Cerveses Moritz al cor del Pirineu' },
      ],
      contactTitle: 'Tens una pregunta o una proposta?',
      contactBody: 'Escriu-nos i prepararem el següent pas.',
      contactAction: 'Anar a contacte',
    },
    about: {
      title: 'Poblaliment: distribuïdora des de 1999 | La Pobla de Segur',
      description:
        'Coneix Poblaliment S.L., distribuïdora nascuda l’abril de 1999 a la Pobla de Segur, amb flota pròpia i servei a Lleida, el Prepirineu i el Pirineu.',
      heading: '25 anys fent territori.',
      intro:
        'Vam néixer a la Pobla de Segur per acostar productes de qualitat als negocis i les persones del Pirineu.',
      imageAlt: 'Vehicle de Poblaliment en una carretera de muntanya del Pirineu',
      imageCaption: 'Rutes pròpies des de la Pobla de Segur, al cor del Pallars Jussà.',
      valuesTitle: 'La nostra manera de fer',
      values: [
        {
          title: 'Producte de qualitat',
          body: 'Seleccionem vins, begudes i productes gourmet de productors i marques de confiança.',
        },
        {
          title: 'Distribució pròpia',
          body: 'Cobrim la província de Lleida, el Prepirineu i el Pirineu amb els nostres vehicles i coneixement de cada ruta.',
        },
        {
          title: 'Servei personalitzat',
          body: 'Escoltem cada client i adaptem el servei a les necessitats de la restauració, el comerç especialitzat i els particulars.',
        },
      ],
    },
    food: {
      title: 'Aliments i proveïdors | Poblaliment',
      description:
        'Consulta els proveïdors de formatges, conserves, carns, peix, congelats, cafè, dolços, olis i condiments distribuïts per Poblaliment.',
      heading: 'Aliments per a cada servei.',
      intro:
        'Un assortiment ampli, ordenat per famílies, per trobar amb agilitat els productes que necessita cada negoci.',
      imageAlt: 'Selecció de productes d’alimentació distribuïts per Poblaliment',
      imageCaption: 'Proveïdors de confiança per a restauració, comerç i particulars.',
    },
    cellar: {
      title: 'Celler, vins i cervesa | Poblaliment',
      description:
        'Descobreix els cellers, vins, escumosos i la cervesa Moritz distribuïts per Poblaliment.',
      heading: 'Celler amb criteri propi.',
      intro:
        'Una selecció més concentrada de vins, escumosos i cervesa, presentada perquè cada productor tingui el seu espai.',
      imageAlt: 'Ampolles de vi del celler Sumarroca entre vinyes',
      imageCaption: 'Cellers escollits per origen, qualitat i continuïtat.',
    },
    contact: {
      title: 'Contacte amb Poblaliment | Distribució alimentària a Lleida',
      description:
        'Contacta amb Poblaliment per parlar de distribució alimentària, productes, marques i col·laboracions.',
      heading: 'Parlem del que necessites.',
      intro:
        'Som a la Pobla de Segur. Escriu-nos o truca’ns per consultar productes, distribució i disponibilitat.',
      imageAlt: 'Vehicle de distribució davant de les muntanyes',
      imageCaption: 'Quan hi ha camí, també hi ha una manera de començar.',
      formTitle: 'Escriu-nos',
      formNote: 'Explica’ns què necessites i ens posarem en contacte amb tu.',
      fields: {
        name: 'Nom',
        email: 'Correu electrònic',
        message: 'Missatge',
        submit: 'Enviar missatge',
      },
      detailsTitle: 'Contacte directe',
      details: [
        { label: 'Correu', value: 'info@poblaliment.com', href: 'mailto:info@poblaliment.com' },
        { label: 'Telèfon', value: '973 680 341', href: 'tel:+34973680341' },
        {
          label: 'Instagram',
          value: '@poblaliment',
          href: 'https://www.instagram.com/poblaliment/',
        },
        { label: 'Ubicació', value: 'Tros del Roi, s/n · 25500 La Pobla de Segur' },
      ],
    },
    footer: {
      statement: 'Producte, origen i criteri.',
      credit: 'Web desenvolupada per:',
    },
  },
  es: {
    localeLabel: 'ES',
    otherLocaleLabel: 'CA',
    nav: sharedNavEs,
    home: {
      title: 'Distribución alimentaria en Lleida y el Pirineo | Poblaliment',
      description:
        'Distribuimos vinos, bebidas y productos gourmet con flota propia en Lleida, el Prepirineo y el Pirineo. Servicio para hostelería, comercio y particulares.',
      heading: 'Distribuimos confianza.',
      intro:
        'Distribuimos alimentos con agilidad, cercanía y confianza para que cada producto llegue donde tiene que llegar.',
      primaryAction: 'Conócenos',
      secondaryAction: 'Hablemos',
      imageAlt: 'Camión de Poblaliment repartiendo producto al atardecer',
      imageCaption: 'La distribución también forma parte del producto.',
      servicesTitle: 'Nuestros servicios',
      services: [
        {
          title: 'Distribución local y nacional',
          body: 'Distribuimos en la provincia de Lleida, el Prepirineo y el Pirineo con flota propia, rutas adaptadas al territorio y cuidado en cada entrega.',
        },
        {
          title: 'Atención personalizada',
          body: 'Acompañamos a bares, restaurantes, campings, hoteles, carnicerías, tiendas especializadas y particulares con un trato directo, ágil y de confianza.',
        },
      ],
      exploreTitle: 'Explora Poblaliment',
      exploreLinks: [
        { label: 'Nosotros', detail: 'La base del proyecto', page: 'about' },
        { label: 'Alimentos', detail: 'Proveedores por familia de producto', page: 'food' },
        { label: 'Bodega', detail: 'Vinos, espumosos y cerveza', page: 'cellar' },
        { label: 'Contacto', detail: 'Abrimos una conversación', page: 'contact' },
      ],
      galleryTitle: 'Una mirada a nuestro día a día',
      galleryNote: 'Imágenes de apoyo · galería preparada para ampliar',
      gallery: [
        { src: '/images/truck-sunset.jpg', alt: 'Camión de Poblaliment en ruta al atardecer' },
        {
          src: '/images/truck-snow.jpg',
          alt: 'Camión de Poblaliment en una carretera de alta montaña',
        },
        { src: '/images/moritz-pirineus.jpg', alt: 'Cervezas Moritz en el corazón del Pirineo' },
      ],
      contactTitle: '¿Tienes una pregunta o una propuesta?',
      contactBody: 'Escríbenos y prepararemos el siguiente paso.',
      contactAction: 'Ir a contacto',
    },
    about: {
      title: 'Poblaliment: distribuidora desde 1999 | La Pobla de Segur',
      description:
        'Conoce Poblaliment S.L., distribuidora nacida en abril de 1999 en La Pobla de Segur, con flota propia y servicio en Lleida, el Prepirineo y el Pirineo.',
      heading: '25 años haciendo territorio.',
      intro:
        'Nacimos en La Pobla de Segur para acercar productos de calidad a los negocios y las personas del Pirineo.',
      imageAlt: 'Vehículo de Poblaliment en una carretera de montaña del Pirineo',
      imageCaption: 'Rutas propias desde La Pobla de Segur, en el corazón del Pallars Jussà.',
      valuesTitle: 'Nuestra manera de trabajar',
      values: [
        {
          title: 'Producto de calidad',
          body: 'Seleccionamos vinos, bebidas y productos gourmet de productores y marcas de confianza.',
        },
        {
          title: 'Distribución propia',
          body: 'Cubrimos la provincia de Lleida, el Prepirineo y el Pirineo con nuestros vehículos y el conocimiento de cada ruta.',
        },
        {
          title: 'Servicio personalizado',
          body: 'Escuchamos a cada cliente y adaptamos el servicio a las necesidades de la restauración, el comercio especializado y los particulares.',
        },
      ],
    },
    food: {
      title: 'Alimentos y proveedores | Poblaliment',
      description:
        'Consulta los proveedores de quesos, conservas, carnes, pescado, congelados, café, dulces, aceites y condimentos distribuidos por Poblaliment.',
      heading: 'Alimentos para cada servicio.',
      intro:
        'Un surtido amplio, ordenado por familias, para encontrar con agilidad los productos que necesita cada negocio.',
      imageAlt: 'Selección de productos de alimentación distribuidos por Poblaliment',
      imageCaption: 'Proveedores de confianza para hostelería, comercio y particulares.',
    },
    cellar: {
      title: 'Bodega, vinos y cerveza | Poblaliment',
      description:
        'Descubre las bodegas, vinos, espumosos y la cerveza Moritz distribuidos por Poblaliment.',
      heading: 'Bodega con criterio propio.',
      intro:
        'Una selección más concentrada de vinos, espumosos y cerveza, presentada para que cada productor tenga su espacio.',
      imageAlt: 'Botellas de vino de la bodega Sumarroca entre viñedos',
      imageCaption: 'Bodegas escogidas por origen, calidad y continuidad.',
    },
    contact: {
      title: 'Contacto con Poblaliment | Distribución alimentaria en Lleida',
      description:
        'Contacta con Poblaliment para hablar de distribución alimentaria, productos, marcas y colaboraciones.',
      heading: 'Hablemos de lo que necesitas.',
      intro:
        'Estamos en La Pobla de Segur. Escríbenos o llámanos para consultar productos, distribución y disponibilidad.',
      imageAlt: 'Vehículo de distribución frente a las montañas',
      imageCaption: 'Cuando hay camino, también hay una forma de empezar.',
      formTitle: 'Escríbenos',
      formNote: 'Cuéntanos qué necesitas y nos pondremos en contacto contigo.',
      fields: {
        name: 'Nombre',
        email: 'Correo electrónico',
        message: 'Mensaje',
        submit: 'Enviar mensaje',
      },
      detailsTitle: 'Contacto directo',
      details: [
        { label: 'Correo', value: 'info@poblaliment.com', href: 'mailto:info@poblaliment.com' },
        { label: 'Teléfono', value: '973 680 341', href: 'tel:+34973680341' },
        {
          label: 'Instagram',
          value: '@poblaliment',
          href: 'https://www.instagram.com/poblaliment/',
        },
        { label: 'Ubicación', value: 'Tros del Roi, s/n · 25500 La Pobla de Segur' },
      ],
    },
    footer: {
      statement: 'Producto, origen y criterio.',
      credit: 'Web desarrollada por:',
    },
  },
};
