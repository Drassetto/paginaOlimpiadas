/* =============================================================
   tema.js — modo claro / oscuro para todo el sitio
   -------------------------------------------------------------
   Se carga en el <head> para aplicar el tema ANTES de que se
   dibuje la página (así no hay un "flash" blanco).
   Cualquier botón con el atributo data-tema-toggle cambia el tema.
   La elección queda guardada en el navegador.
   ============================================================= */
(() => {
  const CLAVE = 'tema';
  const raiz = document.documentElement;

  let guardado = null;
  try { guardado = localStorage.getItem(CLAVE); } catch { /* sin almacenamiento */ }

  // Si nunca eligió, se usa la preferencia de la compu / celular
  raiz.dataset.theme = guardado || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function actualizarBotones() {
    const oscuro = raiz.dataset.theme === 'dark';
    const texto = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    document.querySelectorAll('[data-tema-toggle]').forEach((btn) => {
      btn.querySelector('i').className = oscuro ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      btn.title = texto;
      btn.setAttribute('aria-label', texto);
    });
  }

  function cambiarTema() {
    raiz.dataset.theme = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(CLAVE, raiz.dataset.theme); } catch { /* sin almacenamiento */ }
    actualizarBotones();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tema-toggle]').forEach((btn) => btn.addEventListener('click', cambiarTema));
    actualizarBotones();
  });
})();
