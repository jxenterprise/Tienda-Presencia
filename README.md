# PRESENCIA — Tienda de Ropa · Cartagena

Landing page oficial de **PRESENCIA**, tienda de ropa en el barrio Nuevo Campestre,
Cartagena de Indias (Colombia). Moda con colecciones exclusivas: buzos, camisetas,
gorras y pantalonetas. Contacto directo por WhatsApp, Instagram
([@presenciamodacartagena](https://www.instagram.com/presenciamodacartagena/)),
[Facebook](https://www.facebook.com/profile.php?id=61591960711304) y
[TikTok](https://www.tiktok.com/@presenciamodacartagena).

Diseño y desarrollo: **JX Company**.

## Características

- Diseño 100% basado en la identidad del logo oficial: paleta dorado/negro, tipografía
  tipo insignia (Cinzel) y caligrafía para los lemas (Great Vibes).
- Catálogo real por categorías (Buzos, Camisetas, Gorras, Pantalonetas, Conjuntos —
  Conjuntos como "Próximamente" hasta que lleguen las fotos) sobre la textura
  de pared de piedra del logo: carrusel de fotos por categoría (scroll horizontal nativo,
  swipe en móvil, contador de posición, numerito visible en cada foto) con lightbox al
  ampliar (navegar, transición de crossfade) y botón de WhatsApp por categoría y por foto: abre
  el chat de la tienda con mensaje pre-rellenado, descarga la foto que se estaba viendo y muestra
  un modal de confirmación antes de redirigir, para que el cliente pueda adjuntarla en el chat.
- Menú móvil como panel deslizante desde la derecha (mismo lado que el botón hamburguesa),
  con bloqueo de scroll robusto (a prueba del bug clásico de iOS Safari).
- 100% responsive (móvil pequeño → escritorio grande), mobile-first.
- SEO on-page completo: title/description optimizados, canonical, Open Graph + Twitter
  Card con imagen 1080×1080, geo tags y datos estructurados JSON-LD
  (`WebSite` + `ClothingStore`).
- Rendimiento: imágenes WebP, imagen LCP con `fetchpriority="high"`, Google Fonts sin
  bloquear el render, JS con `defer`.
- Accesibilidad: HTML semántico, un solo `h1`, menú accesible con teclado,
  `prefers-reduced-motion`, áreas táctiles ≥48px, safe-areas de iPhone.
- Sin frameworks: HTML + CSS + JavaScript puros. Cero dependencias, cero build.

## Estructura del proyecto

```
presencia-tienda/
├── index.html          # Página completa (única página)
├── CLAUDE.md           # Contexto del proyecto y pendientes (uso interno)
├── README.md           # Este archivo
├── _headers            # Cache-Control para Cloudflare Pages
├── robots.txt          # Indexación + referencia al sitemap
├── sitemap.xml         # Mapa del sitio
├── css/
│   └── styles.css      # Todos los estilos (mobile-first + breakpoints)
├── js/
│   └── script.js       # Menú, header al hacer scroll, animaciones, año automático, lightbox
└── img/
    ├── logos/                  # Arte de marca
    │   ├── logo-presencia.webp    # Arte completo del logo (hero)
    │   ├── pared-piedra.webp      # Textura de fondo del catálogo
    │   ├── favicon.png            # Ícono del sitio (insignia)
    │   ├── apple-touch-icon.png   # Ícono iOS
    │   └── og-image.jpg           # Imagen al compartir por WhatsApp/redes
    ├── buzos/           buzo-01.webp … buzo-10.webp
    ├── camisetas/       camiseta-01.webp … camiseta-09.webp
    ├── gorras/          gorra-01.webp … gorra-21.webp
    ├── pantalonetas/    pantaloneta-01.webp … pantaloneta-25.webp
    └── conjuntos/       (vacía por ahora — categoría "Próximamente")
```

## Ver la página en tu compu

No necesita instalación. Dos opciones:

1. **Doble clic** en `index.html` (se abre en el navegador).
2. Servidor local (recomendado para probar igual que en producción):

```bash
# Con Python
python3 -m http.server 8000
# Abrir http://localhost:8000
```

## Publicar (deploy)

### Hosting actual: Cloudflare Pages

El sitio se publica en **Cloudflare Pages** (proyecto `tienda-presencia`, dashboard → Workers y
Pages), conectado directo a este repo de GitHub con **implementaciones automáticas**: cada
`git push` a `main` dispara un deploy nuevo solo, sin pasos manuales. Framework preset `Ninguno`,
sin build command, output en la raíz (`/`) — es HTML/CSS/JS puro, no hay nada que compilar.

El dominio real, **`presenciamodactg.com`** (y `www.presenciamodactg.com`), se compró directo en
**Cloudflare Registrar** y está conectado como dominio personalizado del proyecto — ambos
Activos con SSL. Como el dominio y el hosting están en la misma cuenta de Cloudflare, no hace
falta tocar nameservers ni archivos `CNAME` a mano.

> ⚠️ **`_headers` (Cache-Control para CSS/JS) no está aplicando el `no-cache` esperado en
> producción** (verificado con `curl -I`) — no se investigó a fondo el porqué porque no importa
> en la práctica. El cache-busting real de este proyecto sigue siendo el **query string de
> versión** en `index.html`:
> ```html
> <link rel="stylesheet" href="css/styles.css?v=1">
> <script src="js/script.js?v=1" defer></script>
> ```
> **Cada vez que publiques un cambio en `css/styles.css` o `js/script.js`, sube ese número
> (`?v=2`, `?v=3`, …) en `index.html`.** Si no lo subes, los celulares (que cachean el CSS/JS de
> forma agresiva) pueden seguir mostrando la versión vieja después de publicar el cambio.

### Alternativas / hosting anterior

El proyecto sigue funcionando en cualquier otro hosting estático (Netlify, Hostinger, GitHub
Pages…) — basta con subir todos los archivos manteniendo las carpetas. **GitHub Pages** fue el
hosting usado antes de migrar a Cloudflare Pages; puede seguir activo en paralelo sin conflicto
(nunca tuvo el dominio propio conectado), o desactivarse en Settings → Pages del repo cuando se
quiera, no es urgente.

## Después de publicar

1. ✅ Ya hecho: propiedad verificada en **Google Search Console** (dominio `presenciamodactg.com`,
   verificación automática vía la integración de Google con Cloudflare) y `sitemap.xml` enviado.
2. **Pendiente:** crear/optimizar el **Google Business Profile** (business.google.com) — es lo
   que más ayuda a aparecer en el mapa/búsquedas locales tipo "tienda de ropa en cartagena". Ver
   la checklist completa en `CLAUDE.md`, sección "SEO y descubribilidad en Google".

## Cómo editar contenidos

| Quiero cambiar… | Voy a… |
|---|---|
| Número de WhatsApp | Ya puesto: `+57 300 820 7862`. Si cambia: `index.html` y `js/script.js`, buscar `573008207862` y reemplazar **todas** las apariciones |
| Textos de secciones | `index.html`: cada sección está marcada con comentarios `====` |
| Fotos del catálogo | `index.html` → sección `#catalogo`; fotos en `img/buzos/`, `img/camisetas/`, `img/gorras/`, `img/pantalonetas/`, `img/conjuntos/` (sin precios ni tallas — decisión del dueño, siempre se preguntan por WhatsApp) |
| Dirección y horario | `index.html` → sección `#ubicacion` (y JSON-LD del `<head>`) |
| Colores o tipografías | `css/styles.css` → bloque `:root` |
| Imágenes | Carpeta `img/` (subcarpetas en minúsculas, ver `CLAUDE.md`) |

Los datos que aún no están confirmados por la tienda aparecen marcados en la página
como `{POR CONFIRMAR}` — la lista completa está en `CLAUDE.md`.

**Importante:** después de publicar cualquier cambio en `css/styles.css` o `js/script.js`, subir
el número de versión (`?v=1` → `?v=2`, etc.) en los `<link>`/`<script>` de `index.html` — ver la
sección "Publicar (deploy)" arriba. Sin eso, los celulares pueden seguir viendo la versión vieja.

---

© 2026 PRESENCIA · Tienda de Ropa — Cartagena, Colombia.
Diseño y desarrollo: **JX Company**.
