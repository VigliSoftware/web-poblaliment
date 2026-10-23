# Poblaliment web

Web amb Astro, React, Tailwind CSS i Motion, renderitzada sota demanda a Cloudflare Workers.
Els textos, els proveïdors i els logos s’editen des de `/admin/` i es desen a Neon.

## Desenvolupament

```bash
pnpm install
cp .env.example .env        # omple-hi les credencials
cp .env .dev.vars           # Wrangler llegeix .dev.vars en local
pnpm db:setup               # crea les taules i carrega el catàleg inicial
pnpm admin:create <usuari> <contrasenya>
pnpm dev
```

Sense `DATABASE_URL`, la web pública funciona igualment amb els textos i proveïdors de
`src/data/content.ts` i `src/data/suppliers.ts`, però l’admin no.

Comprovacions locals:

```bash
pnpm run check
pnpm run build
pnpm run format
pnpm run format:check
pnpm run lint
PUBLIC_SITE_URL=https://www.example.com pnpm test
```

`pnpm test` comprova les pàgines a través d’`astro preview`. Si hi ha `.dev.vars`, les pàgines
mostren els textos desats a la base de dades.

## Desplegament a Cloudflare

El projecte fa servir l’adapter `@astrojs/cloudflare`: les pàgines es renderitzen al Worker i els
fitxers de `public/` es serveixen com a Static Assets. Cada isolate del Worker guarda les dades
30 segons, així que els canvis de l’admin es veuen a la web en menys d’un minut.

Abans del primer desplegament, desa els secrets del Worker (no van a `wrangler.jsonc`):

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put SESSION_SECRET        # mínim 32 caràcters: openssl rand -base64 32
npx wrangler secret put S3_ACCESS_KEY_ID
npx wrangler secret put S3_SECRET_ACCESS_KEY
```

`S3_ENDPOINT`, `S3_REGION` i `S3_BUCKET` són a `vars` de `wrangler.jsonc`.

Per connectar el repositori perquè Cloudflare desplegui cada push a `main`:

1. A Cloudflare, obre **Workers & Pages**, crea un Worker connectat a un repositori Git i selecciona
   `VigliSoftware/web-poblaliment`.
2. Fes servir `web-poblaliment` com a nom del Worker. Ha de coincidir exactament amb `name` a
   `wrangler.jsonc`.
3. Configura `main` com a branca de producció i `/` com a directori arrel.
4. Configura `pnpm build` com a build command i `pnpm deploy:cloudflare` com a deploy command.
   Cloudflare instal·la les dependències a partir de `pnpm-lock.yaml`. La versió de Node.js es fixa
   a `24.18.0` amb `.node-version`; defineix `PNPM_VERSION=11.5.3` a les variables de build.
5. A les variables de build, defineix `PUBLIC_SITE_URL` amb l'origen HTTPS públic del lloc. Astro
   l'utilitza per generar les URL canòniques, els alternates d'idioma, Open Graph, `robots.txt` i el
   sitemap.
6. Connecta el domini personalitzat des de la configuració del Worker, si ja està disponible.

Un push a `main` inicia el build i el desplegament a producció. Per desplegar manualment des del
terminal, executa `pnpm build` i després `pnpm deploy:cloudflare`.

## Rutes

Català és l’idioma per defecte:

- `/` — Inici
- `/nosaltres/` — Nosaltres
- `/aliments/` — Aliments i proveïdors
- `/celler/` — Cellers, vins i cervesa
- `/contacte/` — Contacte

Castellà viu sota `/es/`:

- `/es/`
- `/es/nosotros/`
- `/es/alimentos/`
- `/es/bodega/`
- `/es/contacto/`

## Administració

- `/admin/proveidors/` — afegir, editar i eliminar proveïdors, canviar-los de categoria i pujar-ne el
  logo (PNG, JPG, WebP o SVG fins a 1 MB). Sense logo propi es mostra la icona del seu web.
- `/admin/categories/` — noms en català i castellà, ordre i a quina pàgina es mostren (Aliments,
  Celler o el bloc de cervesa del Celler).
- `/admin/inici/` — quines marques surten a la portada i en quin ordre.
- `/admin/textos/` — tots els textos de la web en els dos idiomes. Un camp buit recupera el text
  original.

Els logos es desen al bucket privat de Neon Object Storage i el Worker els serveix a
`/media/logo/?k=…`. Els usuaris de l’admin es creen o se’n canvia la contrasenya amb
`pnpm admin:create`.

Els textos per defecte i les rutes d’idioma estan separats a `src/data/content.ts` i `src/lib/i18n.ts`, perquè afegir una tercera llengua no obligui a reescriure els components.
