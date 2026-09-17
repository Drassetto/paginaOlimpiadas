 const track = document.getElementById('cards-wrap');
    const cards = Array.from(track.querySelectorAll('.card'));
    const N     = cards.length;
    let activa  = 0;

    // Distancia entre los centros de dos tarjetas vecinas
    const paso = () => cards[0].offsetWidth * 1.05;

    // Lugar en el anillo respecto de la activa: 0 = centro, ±1 = vecinas.
    // Este "% N" es el enlace entre la última y la primera.
    function lugarEnElAnillo(i) {
      let off = (i - activa) % N;
      if (off < 0)     off += N;
      if (off > N / 2) off -= N;   // dar la vuelta por el lado corto
      return off;
    }

    // Dibuja el estado actual. arrastre = píxeles que el dedo corrió.
    function dibujar(arrastre = 0) {
      cards.forEach((card, i) => {
        const off = lugarEnElAnillo(i);
        const x   = off * paso() + arrastre;
        const d   = Math.min(Math.abs(x) / paso(), 1);  // 0 = centrada, 1 = al fondo
        const lejos = Math.abs(off) >= 3;               // el empalme del anillo
        const anguloY = off * -12;


        card.style.transform = `translateX(${x}px) rotateY(${anguloY}deg)  scale(${1 - 0.14 * d})`;
        card.style.filter       = `grayscale(${d})`;
        card.style.opacity      = lejos ? 0 : 1 - 0.5 * d;
        card.style.zIndex       = 10 - Math.abs(off);
        card.style.pointerEvents = off === 0 ? 'auto' : 'none';
        card.classList.toggle('is-active', off === 0);
      });
    }

    function mover(dir, manual = false) {
    activa = (activa + dir + N) % N;
    dibujar();

    if (manual) {
    reiniciarTimer();
    }
}

    // --- Flechas y teclado ---
    document.getElementById('prev-btn').addEventListener('click', () => mover(-1, true));
    document.getElementById('next-btn').addEventListener('click', () => mover(1, true));

    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); mover(1, true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); mover(-1, true); }
    });

    // --- Arrastre con dedo o mouse ---

    const MINIMO_ARRASTRE = 5;                  // px para distinguir click de arrastre

    let agarrado = false, arrastrando = false, xInicial = 0, corrido = 0, punteroId = null;

track.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  agarrado = true;
  clearTimeout(timer);
  arrastrando = false;
  xInicial = e.clientX;
  corrido = 0;
  punteroId = e.pointerId;
});

    // Más allá de una tarjeta el arrastre se pone duro: nunca ves pasar dos.
    function frenar(dx) {
      const tope = paso();
      if (Math.abs(dx) <= tope) return dx;
      return Math.sign(dx) * (tope + (Math.abs(dx) - tope) * 0.12);
    }

    track.addEventListener('pointermove', e => {
      if (!agarrado) return;
      corrido = e.clientX - xInicial;

      if (!arrastrando) {
        if (Math.abs(corrido) < MINIMO_ARRASTRE) return;   // todavía puede ser un click
        arrastrando = true;                                // ahora sí es un arrastre
        track.classList.add('is-dragging');
        track.setPointerCapture(punteroId);                // recién acá capturamos
      }
      dibujar(frenar(corrido));
    });

    function soltar() {
      if (!agarrado) return;
      agarrado = false;
      reiniciarTimer();
      track.classList.remove('is-dragging');

      if (punteroId !== null && track.hasPointerCapture(punteroId)) {
        track.releasePointerCapture(punteroId);
      }

      if (arrastrando) {
        const umbral = paso() * 0.18;           // cuánto hay que correr para que "pase" una
        if      (corrido <= -umbral) mover(1, true);
        else if (corrido >=  umbral) mover(-1, true);
        else dibujar();                         // no llegó: vuelve a su lugar
      }

      corrido = 0;
      // El click llega justo después: se apaga la bandera en el próximo turno
      setTimeout(() => { arrastrando = false; }, 0);
    }
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);

    // Si veníamos arrastrando, que el soltar no cuente como click en un link
    track.addEventListener('click', e => {
      if (arrastrando) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // --- Rueda / trackpad horizontal: UNA tarjeta por gesto ---
    // No alcanza con un timeout fijo: un manotazo en el trackpad sigue mandando
    // eventos de inercia durante uno o dos segundos, y con un timeout corto se
    // pasan varias. Así que la traba se suelta recién cuando los eventos paran.
    const MINIMO_RUEDA = 30;                    // px de rueda para que cuente
    let trabada = false, acumulado = 0, finDelGesto;

    track.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;  // scroll vertical: dejarlo pasar
      e.preventDefault();

      // Mientras sigan llegando eventos, el gesto no terminó
      clearTimeout(finDelGesto);
      finDelGesto = setTimeout(() => { trabada = false; acumulado = 0; }, 180);

      if (trabada) return;                      // ya nos movimos en este gesto
      acumulado += e.deltaX;
      if (Math.abs(acumulado) < MINIMO_RUEDA) return;

      trabada = true;
      mover(acumulado > 0 ? 1 : -1, true);
    }, { passive: false });

    window.addEventListener('resize', () => dibujar());
    dibujar();

const segundos = 5;
let timer = null;

function reiniciarTimer() {
  clearTimeout(timer);

  timer = setTimeout(() => {
    if (!agarrado) {
      mover(1, false);
    }

    reiniciarTimer(); // always keep the loop alive
  }, segundos * 1000);
}
reiniciarTimer();