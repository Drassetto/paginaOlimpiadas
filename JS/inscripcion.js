/* =============================================================
   inscripcion.js — formulario de inscripción al curso 2027
   Requisitos: api.js y validaciones.js cargados antes.
   ============================================================= */
(() => {
  const form = document.getElementById('form-inscripcion');
  if (!form) return;

  const inputs = Validar.CAMPOS.map((c) => form.elements[c]);
  const archivoInput = form.elements.comprobante;
  const zona = document.getElementById('archivo-zona');
  const zonaTexto = document.getElementById('insc-archivo-texto');
  const zonaIcono = zona.querySelector('.archivo-icono');
  const estado = document.getElementById('insc-estado');
  const boton = form.querySelector('.btn-inscribir');
  const TEXTO_ZONA = zonaTexto.textContent;

  inputs.forEach(Validar.vigilar);

  // ---- Comprobante -----------------------------------------------
  function peso(bytes) {
    return bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function reiniciarZona() {
    zona.classList.remove('con-archivo');
    zonaTexto.textContent = TEXTO_ZONA;
    zonaIcono.className = 'fa-solid fa-file-arrow-up archivo-icono';
  }

  async function revisarArchivo() {
    const ok = Validar.mostrar(archivoInput, await Validar.archivo(archivoInput.files[0]));
    zonaIcono.className = `fa-solid ${ok && archivoInput.files[0] ? 'fa-file-circle-check' : 'fa-file-arrow-up'} archivo-icono`;
    return ok;
  }

  archivoInput.addEventListener('change', () => {
    const archivo = archivoInput.files[0];
    if (!archivo) { reiniciarZona(); Validar.mostrar(archivoInput, ''); return; }
    zona.classList.add('con-archivo');
    zonaTexto.textContent = `${archivo.name} (${peso(archivo.size)})`;
    revisarArchivo();
  });

  ['dragenter', 'dragover'].forEach((ev) => zona.addEventListener(ev, () => zona.classList.add('arrastrando')));
  ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, () => zona.classList.remove('arrastrando')));

  // ---- Mensajes y estado del botón ----------------------------------
  function mostrarEstado(tipo, texto) {
    const icono = document.createElement('i');
    icono.className = tipo === 'ok' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';
    icono.setAttribute('aria-hidden', 'true');
    const span = document.createElement('span');
    span.textContent = texto;
    estado.className = `form-estado estado-${tipo}`;
    estado.replaceChildren(icono, span);
    estado.hidden = false;
  }

  function enviando(si) {
    boton.disabled = si;
    boton.querySelector('i').className = si ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane';
    boton.querySelector('span').textContent = si ? 'Enviando…' : 'Inscribirme';
  }

  // ---- Envío ---------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    estado.hidden = true;

    const invalidos = inputs.filter((i) => !Validar.revisar(i));
    if (!(await revisarArchivo())) invalidos.push(archivoInput);

    if (invalidos.length) {
      // El primero según el orden en pantalla
      invalidos.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      mostrarEstado('error', invalidos.length === 1
        ? 'Hay un dato para corregir antes de inscribirte.'
        : `Hay ${invalidos.length} datos para corregir antes de inscribirte.`);
      invalidos[0].focus();
      return;
    }

    const datos = new FormData();
    inputs.forEach((i) => datos.append(i.name, Validar.limpiar(i.name, i.value)));
    datos.append('comprobante', archivoInput.files[0]);

    enviando(true);
    try {
      await API.inscribir(datos);
      const nombre = Validar.limpiar('nombre', form.elements.nombre.value);
      const email = Validar.limpiar('email', form.elements.email.value);
      form.reset();
      Validar.limpiarErrores(form);
      reiniciarZona();
      mostrarEstado('ok', `¡Listo, ${nombre}! Tu inscripción quedó registrada. Revisamos el comprobante y te escribimos a ${email}.`);
    } catch (err) {
      mostrarEstado('error', `No se pudo registrar la inscripción. ${err.message}`);
    } finally {
      enviando(false);
      estado.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
})();
