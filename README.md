# PRESENCIA — Tienda de Ropa · Cartagena

Landing page oficial de **PRESENCIA**, tienda de ropa en el barrio Nuevo Campestre,
Cartagena de Indias (Colombia). Moda con colecciones exclusivas: buzos, camisetas y
pantalonetas. Contacto directo por WhatsApp e Instagram
([@presenciamodacartagena](https://www.instagram.com/presenciamodacartagena/)).

Diseño y desarrollo: **JX Company**.

## Características

- Diseño 100% basado en la identidad del logo oficial: paleta dorado/negro, tipografía
  tipo insignia (Cinzel) y caligrafía para los lemas (Great Vibes).
- Catálogo real por categorías (Buzos, Camisetas, Suéteres, Pantalonetas, Conjuntos —
  Suéteres y Conjuntos como "Próximamente" hasta que lleguen las fotos) sobre la textura
  de pared de piedra del logo: cuadrícula de fotos con lightbox (ampliar, navegar, deslizar
  en móvil, transición de crossfade entre fotos) y botón de WhatsApp por categoría y por
  foto, con mensaje pre-rellenado.
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
    ├── sueteres/        (vacía por ahora — categoría "Próximamente")
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

### Hosting actual: GitHub Pages

El sitio se publica desde este mismo repositorio de GitHub, con **GitHub Pages** (Settings →
Pages del repo → elegir la rama/carpeta a publicar). No necesita build ni configuración extra.

> ⚠️ **`_headers` no funciona en GitHub Pages** (ese archivo es un mecanismo propio de Cloudflare
> Pages/Netlify; GitHub Pages lo ignora por completo). El cache-busting real en este proyecto es
> el **query string de versión** en `index.html`:
> ```html
> <link rel="stylesheet" href="css/styles.css?v=1">
> <script src="js/script.js?v=1" defer></script>
> ```
> **Cada vez que publiques un cambio en `css/styles.css` o `js/script.js`, sube ese número
> (`?v=2`, `?v=3`, …) en `index.html`.** Si no lo subes, los celulares (que cachean el CSS/JS de
> forma agresiva) pueden seguir mostrando la versión vieja después de publicar el cambio.

> El dominio final del proyecto es **`tiendapresencia.com`** (ya configurado en canonical,
> Open Graph, `robots.txt`, `sitemap.xml` y JSON-LD). Para conectarlo sobre GitHub Pages: agregar
> un archivo **`CNAME`** en la raíz del repo con `tiendapresencia.com` adentro, y configurar los
> DNS del dominio apuntando a GitHub Pages. Ver detalles en `CLAUDE.md`.

### Alternativas

También funciona en cualquier otro hosting estático (Cloudflare Pages, Netlify, Hostinger…):
basta con subir todos los archivos manteniendo las carpetas. Si se migra a Cloudflare Pages, el
archivo `_headers` que ya está en el repo empezaría a funcionar tal cual, sin cambios.

## Después de publicar

1. Verificar la propiedad del sitio en **Google Search Console**.
2. Enviar el `sitemap.xml` desde Search Console para acelerar la indexación.

## Cómo editar contenidos

| Quiero cambiar… | Voy a… |
|---|---|
| Número de WhatsApp | Ya puesto: `+57 300 820 7862`. Si cambia: `index.html` y `js/script.js`, buscar `573008207862` y reemplazar **todas** las apariciones |
| Textos de secciones | `index.html`: cada sección está marcada con comentarios `====` |
| Fotos / precios del catálogo | `index.html` → sección `#catalogo`; fotos en `img/buzos/`, `img/camisetas/`, `img/sueteres/`, `img/pantalonetas/`, `img/conjuntos/` |
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
