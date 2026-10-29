import type { Locale } from '../lib/i18n';

export type LegalCopy = {
  title: string;
  description: string;
  heading: string;
  intro: string;
  indexLabel: string;
  notice: {
    heading: string;
    owner: string;
    contactLabel: string;
    email: { value: string; href: string };
    contactJoin: string;
    phone: { value: string; href: string };
    conditions: string;
    intellectualProperty: string;
  };
  privacy: {
    heading: string;
    intro: string;
    purposeHeading: string;
    purposeBody: string;
    retentionHeading: string;
    retentionBody: string;
    rightsHeading: string;
    rightsBody: string;
  };
  cookies: {
    heading: string;
    usage: string;
    externalServices: string;
    lastUpdated: string;
  };
};

// Initial legal copy is preserved; the administrator can edit every value in Neon.
export const legalContent: Record<Locale, LegalCopy> = {
  ca: {
    title: 'Informació legal i privacitat | Poblaliment',
    description: 'Avís legal, política de privacitat i política de cookies de Poblaliment.',
    heading: 'Informació legal i privacitat.',
    intro:
      'Informació sobre el titular del lloc web, el tractament de dades personals i l’ús de cookies.',
    indexLabel: 'Índex legal',
    notice: {
      heading: 'Avís legal',
      owner:
        'Aquest lloc web és titularitat de POBLALIMENT, S.L., amb NIF B25433939 i domicili a Tros del Roi, s/n, 25500 La Pobla de Segur (Lleida).',
      contactLabel: 'Contacte:',
      email: {
        value: 'info@poblaliment.com',
        href: 'mailto:info@poblaliment.com',
      },
      contactJoin: 'i',
      phone: {
        value: '973 680 341',
        href: 'tel:+34973680341',
      },
      conditions:
        'L’accés i ús del lloc implica l’acceptació d’aquestes condicions. Els continguts són informatius i es poden actualitzar sense avís previ. POBLALIMENT, S.L. no respon del contingut o disponibilitat dels llocs externs enllaçats des d’aquest web.',
      intellectualProperty:
        'Els textos, imatges, marques i altres continguts estan protegits per la normativa de propietat intel·lectual i industrial. No se’n permet l’explotació sense autorització, excepte els usos legalment permesos.',
    },
    privacy: {
      heading: 'Política de privacitat',
      intro:
        'POBLALIMENT, S.L. és responsable de les dades personals que facilitis en contactar per correu electrònic, telèfon o formulari.',
      purposeHeading: 'Finalitat i base jurídica',
      purposeBody:
        'Les dades s’utilitzen per atendre consultes, preparar propostes i gestionar relacions comercials. La base jurídica és el consentiment, l’aplicació de mesures precontractuals o l’execució d’una relació contractual.',
      retentionHeading: 'Conservació i destinataris',
      retentionBody:
        'Les dades es conservaran durant el temps necessari per atendre la sol·licitud i complir les obligacions legals. No se cediran excepte per obligació legal o a proveïdors necessaris que actuïn per compte de POBLALIMENT, S.L.',
      rightsHeading: 'Els teus drets',
      rightsBody:
        'Pots sol·licitar l’accés, rectificació, supressió, oposició, limitació o portabilitat escrivint a info@poblaliment.com. També pots reclamar davant l’Agència Espanyola de Protecció de Dades.',
    },
    cookies: {
      heading: 'Política de cookies',
      usage:
        'En la configuració actual, aquest lloc no utilitza cookies analítiques, publicitàries ni de seguiment. Únicament pot emprar emmagatzematge tècnic imprescindible per al funcionament i la seguretat del servei.',
      externalServices:
        'Els enllaços a serveis externs queden subjectes a les seves polítiques en visitar-los. Si s’incorporen eines que requereixin consentiment, s’oferiran opcions equivalents per acceptar o rebutjar abans d’instal·lar-les.',
      lastUpdated: 'Última actualització: octubre de 2026.',
    },
  },
  es: {
    title: 'Información legal y privacidad | Poblaliment',
    description: 'Aviso legal, política de privacidad y política de cookies de Poblaliment.',
    heading: 'Información legal y privacidad.',
    intro:
      'Información sobre el titular del sitio web, el tratamiento de datos personales y el uso de cookies.',
    indexLabel: 'Índice legal',
    notice: {
      heading: 'Aviso legal',
      owner:
        'Este sitio web es titularidad de POBLALIMENT, S.L., con NIF B25433939 y domicilio en Tros del Roi, s/n, 25500 La Pobla de Segur (Lleida).',
      contactLabel: 'Contacto:',
      email: {
        value: 'info@poblaliment.com',
        href: 'mailto:info@poblaliment.com',
      },
      contactJoin: 'y',
      phone: {
        value: '973 680 341',
        href: 'tel:+34973680341',
      },
      conditions:
        'El acceso y uso del sitio implica la aceptación de estas condiciones. Los contenidos son informativos y pueden actualizarse sin previo aviso. POBLALIMENT, S.L. no responde del contenido o disponibilidad de sitios externos enlazados desde esta web.',
      intellectualProperty:
        'Los textos, imágenes, marcas y demás contenidos están protegidos por la normativa de propiedad intelectual e industrial. No se permite su explotación sin autorización, salvo los usos legalmente permitidos.',
    },
    privacy: {
      heading: 'Política de privacidad',
      intro:
        'POBLALIMENT, S.L. es responsable de los datos personales que facilites al contactar por correo electrónico, teléfono o formulario.',
      purposeHeading: 'Finalidad y base jurídica',
      purposeBody:
        'Los datos se utilizan para atender consultas, preparar propuestas y gestionar relaciones comerciales. La base jurídica es el consentimiento, la aplicación de medidas precontractuales o la ejecución de una relación contractual.',
      retentionHeading: 'Conservación y destinatarios',
      retentionBody:
        'Los datos se conservarán durante el tiempo necesario para atender la solicitud y cumplir las obligaciones legales. No se cederán salvo obligación legal o a proveedores necesarios que actúen por cuenta de POBLALIMENT, S.L.',
      rightsHeading: 'Tus derechos',
      rightsBody:
        'Puedes solicitar el acceso, rectificación, supresión, oposición, limitación o portabilidad escribiendo a info@poblaliment.com. También puedes reclamar ante la Agencia Española de Protección de Datos.',
    },
    cookies: {
      heading: 'Política de cookies',
      usage:
        'En su configuración actual, este sitio no utiliza cookies analíticas, publicitarias ni de seguimiento. Únicamente puede emplear almacenamiento técnico imprescindible para el funcionamiento y la seguridad del servicio.',
      externalServices:
        'Los enlaces a servicios externos quedan sujetos a sus propias políticas al visitarlos. Si se incorporan herramientas que requieran consentimiento, se ofrecerán opciones equivalentes para aceptar o rechazar antes de instalarlas.',
      lastUpdated: 'Última actualización: octubre de 2026.',
    },
  },
};
