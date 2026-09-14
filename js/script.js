/* ============================================================
   PRESENCIA · Tienda de Ropa — js/script.js
   Diseño y desarrollo: JX Company
   Vanilla JS · Sin dependencias
   ============================================================ */
(function () {
  'use strict';

  /* Marca que JS está activo (habilita animaciones .reveal) */
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  var header = document.getElementById('header');
  var btnMenu = document.getElementById('btnMenu');
  var nav = document.getElementById('menuPrincipal');
  var navFondo = document.getElementById('navFondo');

  /* ---------- Bloqueo de scroll compartido (menú y lightbox) ----------
     overflow:hidden solo en <body> no basta en iOS Safari: la página igual
     rebota/se desplaza con el overlay abierto ("se expande la pantalla").
     Fijar el body en su posición actual y restaurarla al cerrar evita eso. */
  var scrollGuardado = 0;
  var bloqueosActivos = 0;

  function bloquearScroll() {
    if (bloqueosActivos === 0) {
      scrollGuardado = window.scrollY || window.pageYOffset || 0;
      /* Compensar el ancho de la barra de scroll: al bloquear el scroll esa
         barra desaparece y el contenido se corre unos px hacia la derecha
         ("se mueven las letras"). Sumar ese ancho como padding lo evita. */
      var anchoScrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.top = (-scrollGuardado) + 'px';
      if (anchoScrollbar > 0) {
        document.body.style.paddingRight = anchoScrollbar + 'px';
      }
      document.body.classList.add('scroll-bloqueado');
    }
    bloqueosActivos++;
  }

  function desbloquearScroll() {
    bloqueosActivos = Math.max(0, bloqueosActivos - 1);
    if (bloqueosActivos === 0) {
      document.body.classList.remove('scroll-bloqueado');
      document.body.style.top = '';
      document.body.style.paddingRight = '';
      /* behavior:'instant' es obligatorio aquí: con scroll-behavior:smooth
         (html) este scrollTo se vería como una animación no deseada. */
      window.scrollTo({ top: scrollGuardado, left: 0, behavior: 'instant' });
    }
  }

  /* ---------- Menú hamburguesa (móvil) ---------- */
  function cerrarMenu() {
    /* Solo liberar el bloqueo si el menú estaba realmente abierto: en escritorio
       este mismo manejador corre al pulsar cualquier enlace del nav (incluido el
       botón de WhatsApp), y desbloquear de más disparaba el window.scrollTo de
       abajo con una posición vieja, haciendo saltar la página al inicio. */
    var estabaAbierto = nav.classList.contains('abierto');
    nav.classList.remove('abierto');
    btnMenu.classList.remove('activo');
    btnMenu.setAttribute('aria-expanded', 'false');
    btnMenu.setAttribute('aria-label', 'Abrir menú de navegación');
    if (navFondo) navFondo.classList.remove('visible');
    if (estabaAbierto) desbloquearScroll();
  }

  function abrirMenu() {
    nav.classList.add('abierto');
    btnMenu.classList.add('activo');
    btnMenu.setAttribute('aria-expanded', 'true');
    btnMenu.setAttribute('aria-label', 'Cerrar menú de navegación');
    if (navFondo) navFondo.classList.add('visible');
    bloquearScroll();
  }

  if (btnMenu && nav) {
    btnMenu.addEventListener('click', function () {
      nav.classList.contains('abierto') ? cerrarMenu() : abrirMenu();
    });

    /* Cerrar al tocar el fondo oscuro */
    if (navFondo) navFondo.addEventListener('click', cerrarMenu);

    /* Cerrar al tocar un enlace del menú */
    nav.querySelectorAll('a').forEach(function (enlace) {
      enlace.addEventListener('click', cerrarMenu);
    });

    /* Cerrar con la tecla Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('abierto')) {
        cerrarMenu();
        btnMenu.focus();
      }
    });

    /* Si se agranda la pantalla con el menú abierto, resetear */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && nav.classList.contains('abierto')) cerrarMenu();
    });
  }

  /* ---------- Header sólido al hacer scroll ---------- */
  function alScrollear() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add('scrolleado');
    } else {
      header.classList.remove('scrolleado');
    }
  }
  window.addEventListener('scroll', alScrollear, { passive: true });
  alScrollear();

  /* ---------- Animaciones de aparición (.reveal) ---------- */
  var prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');

  if (prefiereMenosMovimiento || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' });

    reveals.forEach(function (el) { observador.observe(el); });
  }

  /* ---------- Orden de aparición escalonada de las fotos ----------
     Solo a las primeras de cada categoría: son las únicas visibles antes de
     desplazar el carrusel, y el resto entraría con un retardo absurdo. */
  document.querySelectorAll('.cat-categoria').forEach(function (categoria) {
    var slides = categoria.querySelectorAll('.carousel-slide');
    for (var i = 0; i < slides.length && i < 6; i++) {
      slides[i].style.setProperty('--orden', i);
    }
  });

  /* ---------- Sección activa en el menú ---------- */
  var enlacesNav = document.querySelectorAll('.nav-link');

  if (enlacesNav.length && 'IntersectionObserver' in window) {
    var enlacePorId = {};
    enlacesNav.forEach(function (enlace) {
      var destino = enlace.getAttribute('href') || '';
      if (destino.charAt(0) === '#') enlacePorId[destino.slice(1)] = enlace;
    });

    /* La franja del centro de la pantalla decide cuál sección está "activa":
       con secciones tan altas como el catálogo, mirar solo el borde superior
       marcaría la siguiente demasiado pronto. */
    var observadorSecciones = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var enlace = enlacePorId[entrada.target.id];
        if (!enlace) return;
        enlacesNav.forEach(function (a) { a.classList.remove('activo'); });
        enlace.classList.add('activo');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(enlacePorId).forEach(function (id) {
      var seccion = document.getElementById(id);
      if (seccion) observadorSecciones.observe(seccion);
    });
  }

  /* ---------- Botón "volver arriba" ----------
     La página mide ~14.000px por el catálogo: desde el footer volver al inicio
     a puro dedo es incómodo. Aparece pasada una pantalla de scroll. */
  var btnArriba = document.getElementById('irArriba');

  if (btnArriba) {
    var arribaVisible = false;

    function revisarBotonArriba() {
      var debeVerse = window.scrollY > window.innerHeight * 0.9;
      if (debeVerse === arribaVisible) return;
      arribaVisible = debeVerse;

      if (debeVerse) {
        btnArriba.hidden = false;
        btnArriba.classList.add('entrando');
        void btnArriba.offsetWidth;           /* reflujo: si no, no se ve la transición */
        btnArriba.classList.remove('entrando');
      } else {
        btnArriba.classList.add('entrando');
        window.setTimeout(function () {
          if (!arribaVisible) btnArriba.hidden = true;
        }, 300);
      }
    }

    window.addEventListener('scroll', revisarBotonArriba, { passive: true });
    revisarBotonArriba();

    btnArriba.addEventListener('click', function () {
      window.scrollTo({ top: 0, left: 0, behavior: prefiereMenosMovimiento ? 'instant' : 'smooth' });
      /* Devolver el foco al principio para quien navega con teclado */
      var marca = document.querySelector('.marca');
      if (marca) marca.focus({ preventScroll: true });
    });
  }

  /* ---------- Año automático en el footer ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());

  /* ---------- Cómo se nombra cada prenda ----------
     Lo comparten el lightbox y la selección múltiple, para que el cliente lea
     exactamente el mismo nombre en la foto ampliada y en el mensaje que envía. */
  var numeroWhatsApp = '573008207862';

  var nombreSingular = {
    'Buzos': 'Buzo',
    'Camisetas': 'Camiseta',
    'Gorras': 'Gorra',
    'Pantalonetas': 'Pantaloneta'
  };

  /* Género de cada categoría, para el artículo del mensaje ("el Buzo" / "la Camiseta") */
  var articuloSingular = {
    'Buzos': 'el',
    'Camisetas': 'la',
    'Gorras': 'la',
    'Pantalonetas': 'la'
  };

  /* Todas las fotos tienen `data-descripcion` (color/marca real, revisada una por
     una) y el pie de foto la muestra completa. El mensaje de WhatsApp sí distingue:
     cuando la descripción identifica UNA prenda, queda natural usarla ("me interesa
     el Buzo blanco Tommy Hilfiger"). Pero varias fotos de Gorras son de un estante o
     vitrina con muchas gorras juntas, y encadenar esa lista daba un mensaje ilegible
     ("me interesa la Gorra estante MLB: NY, Diamondbacks, Saints, Dodgers LA, ..."),
     así que esas se mandan por número de foto.

     El número sale del `.cat-numero` que se ve sobre la imagen, no de la posición en
     el carrusel: con el filtro de marca puesto la posición cambia, pero el numerito
     que el cliente tiene delante —y que la tienda busca después— es siempre el mismo. */
  function datosDeFoto(boton) {
    var categoria = boton.closest('.cat-categoria');
    var nombreCategoria = categoria ? (categoria.getAttribute('data-categoria') || '') : '';
    var singular = nombreSingular[nombreCategoria] || nombreCategoria;
    var descripcion = boton.getAttribute('data-descripcion') || '';
    var numeroEl = boton.querySelector('.cat-numero');
    var numero = numeroEl ? numeroEl.textContent.trim() : '';
    var esEstante = nombreCategoria === 'Gorras' && /^(estante|vitrina)\b/i.test(descripcion);

    var etiqueta;
    if (!descripcion) etiqueta = singular + ' #' + numero;
    else if (esEstante) etiqueta = 'Gorras en ' + descripcion;
    else etiqueta = singular + ' ' + descripcion;

    return {
      categoria: nombreCategoria,
      etiqueta: etiqueta,
      numero: numero,
      articulo: articuloSingular[nombreCategoria] || 'el',
      esEstante: esEstante,
      id: nombreCategoria + '-' + numero
    };
  }

  /* Frase para UNA prenda, la misma en el lightbox y en la lista del pedido */
  function frasePrenda(datos) {
    return datos.esEstante
      ? 'una gorra de la foto #' + datos.numero
      : datos.articulo + ' ' + datos.etiqueta + ' (foto ' + datos.numero + ')';
  }

  /* ---------- Lightbox del catálogo (fotos por categoría) ---------- */
  var lightbox = document.getElementById('lightbox');

  if (lightbox) {
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var lightboxWa = document.getElementById('lightboxWa');
    var lightboxCerrar = document.getElementById('lightboxCerrar');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var lightboxFondo = document.getElementById('lightboxFondo');

    var grupoActual = [];
    var indiceActual = 0;
    var disparador = null;

    /* Solo las fotos a la vista: con un filtro de marca puesto, pasar de foto
       no debe llevar a prendas que el cliente acaba de filtrar. */
    function fotosDe(categoria) {
      return Array.prototype.slice.call(categoria.querySelectorAll('.cat-foto'))
        .filter(function (foto) {
          var slide = foto.closest('.carousel-slide');
          return !slide || !slide.hidden;
        });
    }

    function actualizarLightbox() {
      reiniciarZoom();
      var boton = grupoActual[indiceActual];
      var img = boton.querySelector('img');
      var datos = datosDeFoto(boton);

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = datos.etiqueta + ' — ' + (indiceActual + 1) + ' de ' + grupoActual.length;

      var mensaje = 'Hola, me interesa ' + frasePrenda(datos) + ' que vi en la página de PRESENCIA';
      lightboxWa.href = 'https://wa.me/' + numeroWhatsApp + '?text=' + encodeURIComponent(mensaje);

      var haySoloUna = grupoActual.length <= 1;
      lightboxPrev.hidden = haySoloUna;
      lightboxNext.hidden = haySoloUna;
    }

    function elementosEnfocables() {
      return [lightboxCerrar, lightboxPrev, lightboxNext, lightboxWa].filter(function (el) {
        return el && !el.hidden;
      });
    }

    function alTeclear(e) {
      if (modalDescarga && !modalDescarga.hidden) return;

      if (e.key === 'Escape') {
        cerrarLightbox();
        return;
      }
      if (e.key === 'ArrowRight') {
        siguienteFoto();
        return;
      }
      if (e.key === 'ArrowLeft') {
        anteriorFoto();
        return;
      }
      if (e.key === 'Tab') {
        var enfocables = elementosEnfocables();
        var primero = enfocables[0];
        var ultimo = enfocables[enfocables.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    }

    function abrirLightbox(boton) {
      var categoria = boton.closest('.cat-categoria');
      if (!categoria) return;

      grupoActual = fotosDe(categoria);
      indiceActual = grupoActual.indexOf(boton);
      disparador = boton;

      actualizarLightbox();
      lightbox.hidden = false;
      bloquearScroll();
      lightboxCerrar.focus();
      document.addEventListener('keydown', alTeclear);
    }

    function cerrarLightbox() {
      reiniciarZoom();
      lightbox.hidden = true;
      desbloquearScroll();
      document.removeEventListener('keydown', alTeclear);
      if (disparador) disparador.focus();
    }

    function cambiarFoto(avanzarIndice) {
      reiniciarZoom();          /* si no, el crossfade arrancaría con la foto ampliada */
      if (prefiereMenosMovimiento) {
        avanzarIndice();
        actualizarLightbox();
        return;
      }
      lightboxImg.classList.add('cambiando');
      window.setTimeout(function () {
        avanzarIndice();
        actualizarLightbox();
        lightboxImg.classList.remove('cambiando');
      }, 280);
    }

    function siguienteFoto() {
      cambiarFoto(function () {
        indiceActual = (indiceActual + 1) % grupoActual.length;
      });
    }

    function anteriorFoto() {
      cambiarFoto(function () {
        indiceActual = (indiceActual - 1 + grupoActual.length) % grupoActual.length;
      });
    }

    /* Al preguntar por un modelo: abrir WhatsApp SIEMPRE al número correcto de
       la tienda (garantizado, funciona con cualquier comprador aunque sea la
       primera vez que le escribe) y, de paso, descargar la foto que estaba
       viendo para que la adjunte con un toque extra en el chat que se abrió.
       No se usa la Web Share API aquí a propósito: el menú nativo de
       compartir abre la lista de chats/contactos DE WHATSAPP, no puede
       apuntar a un número fijo — un comprador nuevo que no tenga guardado el
       número de la tienda no lo vería en esa lista y el mensaje no llegaría
       (WhatsApp no expone esa función a una página web). `wa.me` sí está
       hecho justo para esto (abrir un chat con un número fijo sin tenerlo
       guardado), pero solo admite texto — de ahí el combo texto + descarga.

       Para poder avisarle primero al comprador ("¡foto guardada!") y RECIÉN
       ahí mandarlo a WhatsApp, hay que reservar la pestaña nueva en el mismo
       clic (los navegadores bloquean cualquier `window.open` que no pase
       dentro del gesto directo del usuario) y navegarla después, cuando se
       cierra el modal — por eso `window.open('about:blank', ...)` se llama
       ANTES de mostrar el modal, no después. */
    var modalDescarga = document.getElementById('modalDescarga');
    var modalDescargaFondo = document.getElementById('modalDescargaFondo');
    var modalDescargaContinuar = document.getElementById('modalDescargaContinuar');
    var temporizadorModal = null;
    var pestanaWaPendiente = null;

    function irAWhatsApp() {
      if (pestanaWaPendiente) {
        pestanaWaPendiente.location.href = lightboxWa.href;
      } else {
        window.open(lightboxWa.href, '_blank', 'noopener');
      }
      pestanaWaPendiente = null;
    }

    function cerrarModalDescarga(irAWa) {
      window.clearTimeout(temporizadorModal);
      modalDescarga.hidden = true;
      desbloquearScroll();
      if (irAWa) irAWhatsApp();
    }

    function abrirModalDescarga() {
      modalDescarga.hidden = false;
      bloquearScroll();
      modalDescargaContinuar.focus();
      temporizadorModal = window.setTimeout(function () {
        cerrarModalDescarga(true);
      }, 1800);
    }

    modalDescargaContinuar.addEventListener('click', function () { cerrarModalDescarga(true); });
    modalDescargaFondo.addEventListener('click', function () { cerrarModalDescarga(true); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalDescarga.hidden) cerrarModalDescarga(true);
    });

    function alClicWa(e) {
      e.preventDefault();

      pestanaWaPendiente = window.open('about:blank', '_blank');

      var enlaceDescarga = document.createElement('a');
      enlaceDescarga.href = lightboxImg.src;
      enlaceDescarga.download = lightboxImg.src.split('/').pop().split('?')[0] || 'presencia.webp';
      enlaceDescarga.target = '_blank';
      enlaceDescarga.rel = 'noopener';
      document.body.appendChild(enlaceDescarga);
      enlaceDescarga.click();
      enlaceDescarga.remove();

      abrirModalDescarga();
    }
    lightboxWa.addEventListener('click', alClicWa);

    document.querySelectorAll('.cat-foto').forEach(function (boton) {
      boton.addEventListener('click', function () { abrirLightbox(boton); });
    });

    lightboxCerrar.addEventListener('click', cerrarLightbox);
    lightboxFondo.addEventListener('click', cerrarLightbox);
    lightboxPrev.addEventListener('click', anteriorFoto);
    lightboxNext.addEventListener('click', siguienteFoto);

    /* ---------- Zoom de la foto ampliada ----------
       En ropa el detalle es lo que vende: la costura, el logo, la textura.
       Doble toque (o doble clic) para acercar, pellizco para ajustar y
       arrastre para recorrer la foto.

       Mientras está ampliada se desactiva el deslizar-para-cambiar: si no,
       mover la foto para mirar una esquina saltaría a la prenda siguiente. */
    var ZOOM_MAX = 3;
    var zoomEscala = 1;
    var zoomX = 0;
    var zoomY = 0;

    function aplicarZoom() {
      var ampliada = zoomEscala > 1.01;
      lightboxImg.style.transform = ampliada
        ? 'translate(' + zoomX + 'px, ' + zoomY + 'px) scale(' + zoomEscala + ')'
        : '';
      lightboxImg.classList.toggle('ampliada', ampliada);
    }

    function reiniciarZoom() {
      zoomEscala = 1;
      zoomX = 0;
      zoomY = 0;
      lightboxImg.classList.remove('zoom-directo');
      aplicarZoom();
    }

    /* No dejar que la foto se arrastre fuera de su propio marco */
    function limitarDesplazamiento() {
      var maxX = Math.max(0, (lightboxImg.offsetWidth * (zoomEscala - 1)) / 2);
      var maxY = Math.max(0, (lightboxImg.offsetHeight * (zoomEscala - 1)) / 2);
      zoomX = Math.min(maxX, Math.max(-maxX, zoomX));
      zoomY = Math.min(maxY, Math.max(-maxY, zoomY));
    }

    function alternarZoom() {
      if (zoomEscala > 1.01) {
        reiniciarZoom();
      } else {
        zoomEscala = 2.2;
        zoomX = 0;
        zoomY = 0;
        aplicarZoom();
      }
    }

    lightboxImg.addEventListener('dblclick', alternarZoom);

    /* ---------- Gestos táctiles ---------- */
    var toqueInicioX = null;
    var toqueInicioY = null;
    var arrastreBaseX = 0;
    var arrastreBaseY = 0;
    var pellizcoInicial = 0;
    var escalaAlEmpezar = 1;
    var instanteToqueAnterior = 0;

    function distanciaDedos(a, b) {
      var dx = a.clientX - b.clientX;
      var dy = a.clientY - b.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    lightbox.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        pellizcoInicial = distanciaDedos(e.touches[0], e.touches[1]);
        escalaAlEmpezar = zoomEscala;
        toqueInicioX = null;                  /* dos dedos nunca es un deslizamiento */
        lightboxImg.classList.add('zoom-directo');
        return;
      }
      toqueInicioX = e.touches[0].clientX;
      toqueInicioY = e.touches[0].clientY;
      arrastreBaseX = zoomX;
      arrastreBaseY = zoomY;
    }, { passive: true });

    lightbox.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && pellizcoInicial) {
        var proporcion = distanciaDedos(e.touches[0], e.touches[1]) / pellizcoInicial;
        zoomEscala = Math.min(ZOOM_MAX, Math.max(1, escalaAlEmpezar * proporcion));
        limitarDesplazamiento();
        aplicarZoom();
        return;
      }

      if (zoomEscala > 1.01 && toqueInicioX !== null) {
        lightboxImg.classList.add('zoom-directo');
        zoomX = arrastreBaseX + (e.touches[0].clientX - toqueInicioX);
        zoomY = arrastreBaseY + (e.touches[0].clientY - toqueInicioY);
        limitarDesplazamiento();
        aplicarZoom();
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      lightboxImg.classList.remove('zoom-directo');

      if (pellizcoInicial) {
        pellizcoInicial = 0;
        if (zoomEscala <= 1.05) reiniciarZoom();
        return;
      }

      var ahora = Date.now();
      var esDobleToque = (ahora - instanteToqueAnterior) < 300;
      instanteToqueAnterior = ahora;

      if (toqueInicioX === null) return;

      var deltaX = e.changedTouches[0].clientX - toqueInicioX;
      var deltaY = e.changedTouches[0].clientY - toqueInicioY;
      var casiQuieto = Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12;
      toqueInicioX = null;

      if (esDobleToque && casiQuieto && e.target === lightboxImg) {
        alternarZoom();
        return;
      }

      /* Con la foto ampliada, arrastrar sirve para mirar, no para cambiar */
      if (zoomEscala > 1.01) return;
      if (grupoActual.length <= 1 || Math.abs(deltaX) < 40) return;
      if (deltaX < 0) siguienteFoto(); else anteriorFoto();
    }, { passive: true });
  }

  /* ---------- Carrusel de fotos por categoría ----------
     Scroll horizontal NATIVO (overflow-x + scroll-snap) en vez de mover un
     flex track a mano con transform: ese enfoque daba un bug real donde las
     fotos se volvían invisibles al navegar varias veces (glitch de pintado
     del navegador con overflow:hidden + transform + muchas imágenes). Con
     scroll nativo el navegador se encarga de todo, incluido el swipe. */
  var refrescarCarruseles = [];

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var pista = carousel.querySelector('.carousel-pista');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-slide'));
    var btnPrev = carousel.querySelector('.carousel-flecha-prev');
    var btnNext = carousel.querySelector('.carousel-flecha-next');
    var contadorWrap = carousel.querySelector('.carousel-dots');
    var indiceActivo = -1;

    if (!slides.length) return;

    /* Con el filtro de marca puesto, solo cuentan las fotos que quedaron a la vista */
    function visibles() {
      return slides.filter(function (slide) { return !slide.hidden; });
    }

    function anchoDesplazamiento() {
      var primera = visibles()[0];
      if (!primera) return 0;
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      return primera.getBoundingClientRect().width + gap;
    }

    /* El índice "activo" se calcula directamente del scroll (no con
       IntersectionObserver): con varias fotos visibles a la vez (pantallas
       anchas), el observer podía marcar como activa la última foto visible
       en vez de la primera, dejando la flecha "anterior" habilitada estando
       ya en el inicio. Con scrollLeft es exacto sin importar cuántas fotos
       quepan por página. */
    function indiceDesdeScroll() {
      var paso = anchoDesplazamiento();
      if (!paso) return 0;
      return Math.round(pista.scrollLeft / paso);
    }

    function estaAlInicio() { return pista.scrollLeft <= 4; }
    function estaAlFinal() { return pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4; }

    function actualizarFlechas() {
      if (btnPrev) btnPrev.disabled = estaAlInicio();
      if (btnNext) btnNext.disabled = estaAlFinal();
    }

    /* Contador "07 / 25" en todas las categorías: deja claro cuál modelo se
       está viendo al pasar con las flechas, sin saturar de puntitos cuando
       hay muchas fotos (Pantalonetas). */
    var contadorEl = null;

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    function actualizarContador() {
      var total = visibles().length;
      if (!total) return;
      var indice = Math.min(total - 1, Math.max(0, indiceDesdeScroll()));
      if (indice === indiceActivo) return;
      indiceActivo = indice;
      if (contadorEl) contadorEl.textContent = pad2(indice + 1) + ' / ' + total;
    }

    function alScrollearCarrusel() {
      actualizarContador();
      actualizarFlechas();
    }

    function crearContador() {
      contadorWrap.innerHTML = '';
      contadorEl = document.createElement('span');
      contadorEl.className = 'carousel-contador';
      /* Sin fotos a la vista (filtro que no casa con esta categoría) el contador
         se deja vacío: "01 / 0" no significa nada. La categoría además se oculta. */
      var total = visibles().length;
      contadorEl.textContent = total ? '01 / ' + total : '';
      contadorWrap.appendChild(contadorEl);
    }

    if (btnPrev) btnPrev.addEventListener('click', function () {
      pista.scrollBy({ left: -anchoDesplazamiento(), behavior: 'smooth' });
    });

    if (btnNext) btnNext.addEventListener('click', function () {
      pista.scrollBy({ left: anchoDesplazamiento(), behavior: 'smooth' });
    });

    var pistaTimeoutScroll;
    pista.addEventListener('scroll', function () {
      window.clearTimeout(pistaTimeoutScroll);
      pistaTimeoutScroll = window.setTimeout(alScrollearCarrusel, 60);
    }, { passive: true });

    window.addEventListener('resize', actualizarFlechas);

    /* El filtro de marca oculta fotos: hay que volver al inicio del carrusel y
       recalcular, o el contador seguiría contando fotos que ya no se ven. */
    refrescarCarruseles.push(function () {
      pista.scrollLeft = 0;
      indiceActivo = -1;
      crearContador();
      actualizarContador();
      actualizarFlechas();
    });

    crearContador();
    actualizarFlechas();
  });

  /* ---------- Filtro por marca del catálogo ----------
     Las marcas salen del data-marca de cada foto. Solo se muestran las que
     tienen 2 o más fotos: un chip que devuelve una sola prenda no ayuda a
     buscar y solo llena la fila de ruido. */
  var zonaMarcas = document.getElementById('filtroMarcas');
  var listaMarcas = document.getElementById('filtroMarcasLista');
  var fotosConMarca = Array.prototype.slice.call(document.querySelectorAll('.cat-foto[data-marca]'));

  if (zonaMarcas && listaMarcas && fotosConMarca.length) {
    var conteoMarcas = {};

    fotosConMarca.forEach(function (foto) {
      foto.getAttribute('data-marca').split('|').forEach(function (marca) {
        if (marca) conteoMarcas[marca] = (conteoMarcas[marca] || 0) + 1;
      });
    });

    var marcasListadas = Object.keys(conteoMarcas)
      .filter(function (marca) { return conteoMarcas[marca] >= 2; })
      .sort(function (a, b) {
        return conteoMarcas[b] - conteoMarcas[a] || a.localeCompare(b, 'es');
      });

    if (marcasListadas.length) {
      var crearChip = function (marca, etiqueta, cantidad) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'cat-marca';
        chip.setAttribute('data-marca', marca);
        chip.setAttribute('aria-pressed', 'false');
        chip.appendChild(document.createTextNode(etiqueta));

        var numero = document.createElement('span');
        numero.className = 'cat-marca-cantidad';
        numero.textContent = String(cantidad);
        chip.appendChild(numero);

        listaMarcas.appendChild(chip);
      };

      var aplicarFiltro = function (marca) {
        fotosConMarca.forEach(function (foto) {
          var slide = foto.closest('.carousel-slide');
          if (!slide) return;
          var suyas = foto.getAttribute('data-marca').split('|');
          slide.hidden = marca !== '' && suyas.indexOf(marca) === -1;
        });

        /* Las categorías que se quedan sin fotos desaparecen mientras dure el
           filtro — incluida Conjuntos, que todavía no tiene ninguna — y con
           ellas su atajo de la fila de arriba, que si no llevaría a la nada. */
        document.querySelectorAll('.cat-categoria').forEach(function (categoria) {
          var quedaAlguna = categoria.querySelector('.carousel-slide:not([hidden])');
          categoria.hidden = marca !== '' && !quedaAlguna;

          /* La cabecera no puede seguir diciendo "10 modelos disponibles" cuando el
             filtro dejó 3 a la vista. Se guarda el texto original la primera vez y
             se restaura al quitar el filtro. Conjuntos se salta: ahí ese hueco lleva
             la etiqueta "Próximamente", no un número. */
          var rotulo = categoria.querySelector('.cat-categoria-cantidad');
          var totales = categoria.querySelectorAll('.carousel-slide').length;
          if (rotulo && totales) {
            if (!rotulo.getAttribute('data-texto-original')) {
              rotulo.setAttribute('data-texto-original', rotulo.textContent);
            }
            var aLaVista = categoria.querySelectorAll('.carousel-slide:not([hidden])').length;
            rotulo.textContent = marca === ''
              ? rotulo.getAttribute('data-texto-original')
              : aLaVista + ' de ' + totales + (totales === 1 ? ' modelo' : ' modelos');
          }

          var id = categoria.getAttribute('id');
          var atajo = id ? document.querySelector('.cat-filtro[href="#' + id + '"]') : null;
          if (atajo) atajo.hidden = categoria.hidden;
        });

        refrescarCarruseles.forEach(function (refrescar) { refrescar(); });

        listaMarcas.querySelectorAll('.cat-marca').forEach(function (chip) {
          var activa = chip.getAttribute('data-marca') === marca;
          chip.classList.toggle('activa', activa);
          chip.setAttribute('aria-pressed', activa ? 'true' : 'false');
        });
      };

      zonaMarcas.hidden = false;
      crearChip('', 'Todas', fotosConMarca.length);
      marcasListadas.forEach(function (marca) {
        crearChip(marca, marca, conteoMarcas[marca]);
      });

      listaMarcas.addEventListener('click', function (e) {
        var chip = e.target.closest('.cat-marca');
        if (chip) aplicarFiltro(chip.getAttribute('data-marca'));
      });

      aplicarFiltro('');
    }
  }

  /* ---------- Selección múltiple: varias prendas en un solo mensaje ----------
     Antes cada foto abría su propio chat: pedir tres prendas eran tres
     conversaciones sueltas y la tienda tenía que juntarlas a mano. */
  var barraSeleccion = document.getElementById('seleccionBarra');

  if (barraSeleccion) {
    var seleccionCantidad = document.getElementById('seleccionCantidad');
    var seleccionPalabra = document.getElementById('seleccionPalabra');
    var seleccionEnviar = document.getElementById('seleccionEnviar');
    var seleccionLimpiar = document.getElementById('seleccionLimpiar');

    var LLAVE_SELECCION = 'presencia-seleccion';
    var elegidas = [];
    var fotoPorId = {};

    Array.prototype.slice.call(document.querySelectorAll('.cat-foto')).forEach(function (foto) {
      fotoPorId[datosDeFoto(foto).id] = foto;
    });

    /* localStorage puede fallar (ventana privada, almacenamiento bloqueado): si no
       está disponible la selección sigue funcionando, solo que no sobrevive a una
       recarga. Nunca debe tumbar la página. */
    function leerSeleccionGuardada() {
      try {
        var crudo = window.localStorage.getItem(LLAVE_SELECCION);
        var lista = crudo ? JSON.parse(crudo) : [];
        return Object.prototype.toString.call(lista) === '[object Array]' ? lista : [];
      } catch (e) {
        return [];
      }
    }

    function guardarSeleccion() {
      try {
        window.localStorage.setItem(LLAVE_SELECCION, JSON.stringify(elegidas));
      } catch (e) { /* sin almacenamiento: no pasa nada */ }
    }

    function marcarBoton(foto, activa) {
      var slide = foto.closest('.carousel-slide');
      var boton = slide ? slide.querySelector('.cat-anadir') : null;
      if (!boton) return;
      var datos = datosDeFoto(foto);
      boton.classList.toggle('elegido', activa);
      boton.setAttribute('aria-pressed', activa ? 'true' : 'false');
      boton.setAttribute('aria-label',
        (activa ? 'Quitar de mi selección: ' : 'Añadir a mi selección: ') + datos.etiqueta);
    }

    function mensajeDelPedido() {
      var lineas = [];
      elegidas.forEach(function (id) {
        var foto = fotoPorId[id];
        if (!foto) return;
        var datos = datosDeFoto(foto);
        lineas.push(datos.esEstante
          ? '• Una gorra de la foto #' + datos.numero
          : '• ' + datos.etiqueta + ' (foto ' + datos.numero + ')');
      });
      return 'Hola, me interesan estas prendas que vi en la página de PRESENCIA:\n' + lineas.join('\n');
    }

    function pintarSeleccion() {
      var total = elegidas.length;
      barraSeleccion.hidden = total === 0;
      document.body.classList.toggle('con-seleccion', total > 0);
      seleccionCantidad.textContent = String(total);
      seleccionPalabra.textContent = total === 1 ? 'prenda seleccionada' : 'prendas seleccionadas';
      if (total) {
        seleccionEnviar.href = 'https://wa.me/' + numeroWhatsApp + '?text=' +
          encodeURIComponent(mensajeDelPedido());
      }
    }

    function alternarFoto(foto) {
      var id = datosDeFoto(foto).id;
      var posicion = elegidas.indexOf(id);
      var activa = posicion === -1;
      if (activa) elegidas.push(id); else elegidas.splice(posicion, 1);
      marcarBoton(foto, activa);
      guardarSeleccion();
      pintarSeleccion();
    }

    function vaciarSeleccion() {
      elegidas.forEach(function (id) {
        if (fotoPorId[id]) marcarBoton(fotoPorId[id], false);
      });
      elegidas = [];
      guardarSeleccion();
      pintarSeleccion();
    }

    /* Delegado: los botones "+" son 65 y así no se cuelgan 65 escuchadores */
    document.addEventListener('click', function (e) {
      var boton = e.target.closest ? e.target.closest('.cat-anadir') : null;
      if (!boton) return;
      var slide = boton.closest('.carousel-slide');
      var foto = slide ? slide.querySelector('.cat-foto') : null;
      if (foto) alternarFoto(foto);
    });

    seleccionLimpiar.addEventListener('click', vaciarSeleccion);

    /* Al enviar se vacía: el pedido ya viajó al chat y dejarlo marcado haría que
       el siguiente mensaje repitiera prendas ya pedidas. Se hace en un setTimeout
       para no interferir con la apertura del enlace. */
    seleccionEnviar.addEventListener('click', function () {
      window.setTimeout(vaciarSeleccion, 0);
    });

    /* Restaurar lo elegido antes de recargar, descartando ids que ya no existen
       (por ejemplo si se retiró una foto del catálogo) */
    elegidas = leerSeleccionGuardada().filter(function (id) { return !!fotoPorId[id]; });
    elegidas.forEach(function (id) { marcarBoton(fotoPorId[id], true); });
    pintarSeleccion();
  }
})();
