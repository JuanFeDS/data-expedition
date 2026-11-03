(() => {
  const escenario = document.querySelector('.escenario');
  const slides = [...document.querySelectorAll('.slide')];
  const barra = document.querySelector('.progreso');
  let actual = 0;

  const ajustar = () => {
    const escala = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    escenario.style.transform = `translate(-50%, -50%) scale(${escala})`;
  };

  const ir = (indice) => {
    actual = Math.max(0, Math.min(slides.length - 1, indice));
    slides.forEach((slide, posicion) => slide.classList.toggle('activa', posicion === actual));
    barra.style.width = `${((actual + 1) / slides.length) * 100}%`;
    history.replaceState(null, '', `#${actual + 1}`);
    animarNumeros(slides[actual]);
    arrancarRelojes(slides[actual]);
  };

  let relojes = [];
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const formato = (segundos) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;

  const animarNumeros = (slide) => {
    slide.querySelectorAll('[data-contar]').forEach((el) => {
      const meta = Number(el.dataset.contar);
      const sufijo = el.dataset.sufijo || '';
      if (sinMovimiento) { el.textContent = meta + sufijo; return; }
      const inicio = performance.now();
      const paso = (ahora) => {
        const avance = Math.min((ahora - inicio) / 1400, 1);
        el.textContent = Math.round(meta * (1 - Math.pow(1 - avance, 3))) + sufijo;
        if (avance < 1 && slide.classList.contains('activa')) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  };

  const arrancarRelojes = (slide) => {
    relojes.forEach(clearInterval);
    relojes = [];
    slide.querySelectorAll('[data-segundos]').forEach((el) => {
      let restante = Number(el.dataset.segundos);
      el.textContent = formato(restante);
      if (sinMovimiento) return;
      const intervalo = setInterval(() => {
        restante = Math.max(0, restante - 1);
        el.textContent = formato(restante);
        if (restante === 0) clearInterval(intervalo);
      }, 1000);
      relojes.push(intervalo);
    });
  };

  slides.forEach((slide, posicion) => {
    const numero = document.createElement('span');
    numero.className = 'numero-slide';
    numero.textContent = `${posicion + 1} / ${slides.length}`;
    slide.append(numero);
  });

  window.addEventListener('resize', ajustar);
  window.addEventListener('keydown', (evento) => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(evento.key)) { evento.preventDefault(); ir(actual + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(evento.key)) { evento.preventDefault(); ir(actual - 1); }
    else if (evento.key === 'Home') ir(0);
    else if (evento.key === 'End') ir(slides.length - 1);
    else if (evento.key.toLowerCase() === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  });
  document.addEventListener('click', (evento) => ir(actual + (evento.clientX < window.innerWidth * 0.25 ? -1 : 1)));

  ajustar();
  ir((Number(location.hash.slice(1)) || 1) - 1);
})();
