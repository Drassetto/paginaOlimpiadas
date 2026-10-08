/* ============================================================
   RENDER DE TARJETAS
   ------------------------------------------------------------
   Toma el array OLIMPIADAS (js/data.js) y dibuja las tarjetas
   dentro de #cards-wrap. Genera exactamente el mismo HTML que
   antes estaba escrito a mano, así que css/styles.css no cambia.

   IMPORTANTE: este script tiene que cargarse ANTES que
   js/carousel.js, para que el carrusel encuentre las tarjetas
   ya creadas.
   ============================================================ */

(function () {
  "use strict";

  const wrap = document.getElementById("cards-wrap");
  if (!wrap) return;

  if (typeof OLIMPIADAS === "undefined" || !Array.isArray(OLIMPIADAS)) {
    console.error("cards.js: no se encontró el array OLIMPIADAS. ¿Cargaste js/data.js antes?");
    return;
  }

  // Escapa texto para que un & o un < en los datos no rompa el HTML.
  const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[c]));

  // Tipos de link soportados. Para agregar uno nuevo (ej. YouTube),
  // sumá una entrada acá y usá esa misma clave en data.js.
  const TIPOS_LINK = [
    { clave: "web",       clase: "link-web", icono: "fa-solid fa-globe",      titulo: "Sitio Web" },
    { clave: "instagram", clase: "link-ig",  icono: "fa-brands fa-instagram", titulo: "Instagram" }
  ];

  function renderLogo(o) {
    if (!o.logo) return "";
    return `<img src="${esc(o.logo)}" alt="Logo ${esc(o.acronimo)}" loading="lazy">`;
  }

  function renderDestacados(o) {
    const lista = o.destacados || [];
    if (!lista.length) return "";
    return `
              <div class="card-awards">
                <span class="awards-label"><i class="fa-solid fa-medal mr-1.5 text-amber-500"></i>Polipibes destacados:</span>
                <div class="badge-row">
                  ${lista.map((n) => `<span class="badge">${esc(n)}</span>`).join("\n                  ")}
                </div>
              </div>`;
  }

  function renderLinks(o) {
    const links = o.links || {};
    return TIPOS_LINK
      .filter((t) => links[t.clave])
      .map((t) => `<a href="${esc(links[t.clave])}" target="_blank" rel="noopener noreferrer" class="${t.clase}" title="${t.titulo}"><i class="${t.icono} text-2xl"></i></a>`)
      .join("\n              ");
  }

  function renderCard(o) {
    return `
        <div class="card">
          <div class="card-head">
            <div class="card-acronym">${esc(o.acronimo)}</div>
            <div class="card-name">${esc(o.nombre)}</div>
          </div>
          <div class="card-body">
            <div class="card-logo">${renderLogo(o)}</div>
            <div class="card-text">
              <p class="card-desc">${esc(o.descripcion)}</p>${renderDestacados(o)}
            </div>
          </div>
          <div class="card-footer">
            <div class="text-left">
              <div class="card-org">${esc(o.organizador)}</div>
              <div class="card-org-sub">${esc(o.detalle)}</div>
            </div>
            <div class="card-links">
              ${renderLinks(o)}
            </div>
          </div>
        </div>`;
  }

  wrap.innerHTML = OLIMPIADAS.map(renderCard).join("\n");
})();
