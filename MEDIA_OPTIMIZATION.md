# Optimización de medios

Las imágenes conservan el logo, la composición y los archivos originales. Los componentes
sirven variantes WebP mediante `srcset` y `sizes`, con dimensiones explícitas para evitar
saltos de diseño. SVG y URLs externas mantienen su formato.

Los derivados se guardan en `public/images/optimized/` y `public/media-static/` con una huella
del original en el nombre. Se versionan junto con `src/data/optimized-media.json`: el build
de Cloudflare no necesita ImageMagick ni FFmpeg.

Para regenerar los archivos del repositorio, con ImageMagick 7 y FFmpeg con libx264 instalados:

```bash
pnpm media:optimize
```

Para incluir también las imágenes actualmente publicadas desde el CMS:

```bash
pnpm media:optimize --cms
```

Este segundo comando lee las referencias de Neon y descarga los objetos necesarios del bucket
privado usando las credenciales locales de `.env`. No modifica la DB ni el bucket. Los archivos
temporales se eliminan al terminar. Sin `--cms` se conservan las variantes del CMS ya generadas.

Una imagen nueva subida desde el panel se muestra inmediatamente mediante su URL original;
para generar sus variantes hay que ejecutar el comando con `--cms`, hacer build y publicar
los nuevos derivados. Las claves de cada subida son únicas, por lo que una sustitución nunca
recibe las variantes de una imagen anterior.

El favicon utiliza el logo original en PNG de 96 px y añade una versión de 180 px para Apple.
El logo de la cabecera tiene sus propios tamaños WebP pequeños. Las sustituciones del logo
desde el panel siguen funcionando.

El vídeo tiene versiones H.264 de 768 × 432 y 1280 × 720, con faststart y sin audio. Se muestra
primero un póster y se inicia la descarga después de la carga inicial. Con movimiento reducido
o ahorro de datos se conserva solo el póster. El control de pausa es accesible con teclado.

Verificación: `pnpm test`, `pnpm lint` y `pnpm format:check`. Los tests comprueban el formato,
las dimensiones, los tamaños de entrega, el favicon, los assets servidos y los metadatos.
