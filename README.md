# Poblaliment web

Scaffolding estàtic amb Astro, React, Tailwind CSS i Motion.

## Desenvolupament

```bash
pnpm install
pnpm dev
```

Comprovacions locals:

```bash
pnpm run check
pnpm run build
pnpm run format
pnpm run format:check
pnpm run lint
pnpm test
```

## Desplegament a Cloudflare

El projecte publica el directori estàtic `dist/` a Cloudflare Workers Static Assets amb Wrangler.
No necessita l'adapter `@astrojs/cloudflare` perquè totes les pàgines es generen durant el build.

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

Els textos i les rutes d’idioma estan separats a `src/data/content.ts` i `src/lib/i18n.ts`, perquè afegir una tercera llengua no obligui a reescriure els components.
