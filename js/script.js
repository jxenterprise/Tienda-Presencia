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
    nav.classList.remove('abierto');
    btnMenu.classList.remove('activo');
    btnMenu.setAttribute('aria-expanded', 'false');
    btnMenu.setAttribute('aria-label', 'Abrir menú de navegación');
    if (navFondo) navFondo.classList.remove('visible');
    desbloquearScroll();
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

  /* ---------- Año automático en el footer ---------- */
  var anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());

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
    var numeroWhatsApp = '573008207862';

    var nombreSingular = {
      'Buzos': 'Buzo',
      'Camisetas': 'Camiseta',
      'Pantalonetas': 'Pantaloneta'
    };

    var grupoActual = [];
    var indiceActual = 0;
    var disparador = null;

    function conCero(numero) {
      return numero < 10 ? '0' + numero : String(numero);
    }

    function fotosDe(categoria) {
      return Array.prototype.slice.call(categoria.querySelectorAll('.cat-foto'));
    }

    function actualizarLightbox() {
      var boton = grupoActual[indiceActual];
      var img = boton.querySelector('img');
      var categoria = boton.closest('.cat-categoria');
      var nombreCategoria = categoria.getAttribute('data-categoria') || '';
      var singular = nombreSingular[nombreCategoria] || nombreCategoria;
      var etiqueta = singular + ' #' + conCero(indiceActual + 1);

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = etiqueta + ' de ' + grupoActual.length;

      var mensaje = 'Hola, me interesa el ' + etiqueta + ' que vi en la página de PRESENCIA';
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
      lightbox.hidden = true;
      desbloquearScroll();
      document.removeEventListener('keydown', alTeclear);
      if (disparador) disparador.focus();
    }

    function cambiarFoto(avanzarIndice) {
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

    document.querySelectorAll('.cat-foto').forEach(function (boton) {
      boton.addEventListener('click', function () { abrirLightbox(boton); });
    });

    lightboxCerrar.addEventListener('click', cerrarLightbox);
    lightboxFondo.addEventListener('click', cerrarLightbox);
    lightboxPrev.addEventListener('click', anteriorFoto);
    lightboxNext.addEventListener('click', siguienteFoto);

    /* Deslizar para cambiar de foto en móvil */
    var toqueInicioX = null;
    lightbox.addEventListener('touchstart', function (e) {
      toqueInicioX = e.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (toqueInicioX === null) return;
      var deltaX = e.changedTouches[0].clientX - toqueInicioX;
      toqueInicioX = null;
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
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var pista = carousel.querySelector('.carousel-pista');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-slide'));
    var btnPrev = carousel.querySelector('.carousel-flecha-prev');
    var btnNext = carousel.querySelector('.carousel-flecha-next');
    var contadorWrap = carousel.querySelector('.carousel-dots');
    var indiceActivo = 0;

    if (!slides.length) return;

    function anchoDesplazamiento() {
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
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
      var indice = Math.min(slides.length - 1, indiceDesdeScroll());
      if (indice === indiceActivo) return;
      indiceActivo = indice;
      if (contadorEl) contadorEl.textContent = pad2(indice + 1) + ' / ' + slides.length;
    }

    function alScrollearCarrusel() {
      actualizarContador();
      actualizarFlechas();
    }

    function crearContador() {
      contadorWrap.innerHTML = '';
      contadorEl = document.createElement('span');
      contadorEl.className = 'carousel-contador';
      contadorEl.textContent = '01 / ' + slides.length;
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

    crearContador();
    actualizarFlechas();
  });
})();
