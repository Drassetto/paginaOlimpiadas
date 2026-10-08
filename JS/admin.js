/* =============================================================
   admin.js — login y panel de inscriptos
   Requisitos: api.js y validaciones.js cargados antes.
   ============================================================= */
(() => {
  const $ = (id) => document.getElementById(id);

  const panel = $('admin-panel');
  if (!panel) return;

  const loginDlg = $('login-dialog');
  const loginForm = $('login-form');
  const editarDlg = $('editar-dialog');
  const editarForm = $('editar-form');
  const eliminarDlg = $('eliminar-dialog');
  const cuerpo = $('tabla-cuerpo');
  const filtroTexto = $('filtro-texto');
  const filtroCampo = $('filtro-campo');

  let inscriptos = [];
  let idEditando = null;
  let idEliminando = null;
  let cargando = false;

  // Botones "Cancelar" / "X" de todos los diálogos
  document.querySelectorAll('dialog [data-cerrar]').forEach((b) => {
    b.addEventListener('click', () => b.closest('dialog').close());
  });

  /* ---------------- Login ---------------- */
  $('admin-btn').addEventListener('click', () => (API.haySesion() ? abrirPanel() : abrirLogin()));

  function abrirLogin(mensaje = '') {
    loginForm.reset();
    $('login-error').textContent = mensaje;
    const demo = $('login-demo');
    demo.hidden = !API.MODO_DEMO;
    loginDlg.showModal();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = loginForm.elements.usuario.value.trim();
    const clave = loginForm.elements.clave.value;
    if (!usuario || !clave) {
      $('login-error').textContent = 'Completá el nombre del grupo y la contraseña.';
      return;
    }
    const btn = $('login-submit');
    btn.disabled = true;
    btn.textContent = 'Ingresando…';
    try {
      await API.login(usuario, clave);
      loginDlg.close();
      abrirPanel();
    } catch (err) {
      $('login-error').textContent = err.message;
      loginForm.elements.clave.select();
    } finally {
      btn.disabled = false;
      btn.textContent = 'Ingresar';
    }
  });

  /* ---------------- Abrir / cerrar el panel ---------------- */
  function abrirPanel() {
    panel.hidden = false;
    document.body.classList.add('admin-abierto');
    $('admin-usuario').textContent = API.usuario();
    $('admin-demo').hidden = !API.MODO_DEMO;
    history.replaceState(null, '', '#admin');
    cargar();
    filtroTexto.focus();
  }

  function cerrarPanel() {
    panel.hidden = true;
    document.body.classList.remove('admin-abierto');
    if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
    $('admin-btn').focus();
  }

  $('btn-volver').addEventListener('click', cerrarPanel);
  $('btn-salir').addEventListener('click', () => {
    API.cerrarSesion();
    inscriptos = [];
    cuerpo.replaceChildren();
    cerrarPanel();
  });
  $('btn-actualizar').addEventListener('click', () => cargar(true));

  /* ---------------- Traer la lista ---------------- */
  async function cargar(avisar = false) {
    if (cargando) return;
    cargando = true;
    const btn = $('btn-actualizar');
    btn.disabled = true;
    btn.querySelector('i').classList.add('fa-spin');
    $('tabla-wrap').setAttribute('aria-busy', 'true');
    ocultarAviso();
    try {
      inscriptos = await API.listar();
      const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      $('admin-actualizado').textContent = `Actualizado a las ${hora}`;
      render();
      if (avisar) toast('Lista actualizada');
    } catch (err) {
      manejarError(err);
    } finally {
      cargando = false;
      btn.disabled = false;
      btn.querySelector('i').classList.remove('fa-spin');
      $('tabla-wrap').setAttribute('aria-busy', 'false');
    }
  }

  function manejarError(err) {
    if (err.status === 401 || err.status === 403) {
      API.cerrarSesion();
      cerrarPanel();
      abrirLogin('La sesión venció o no tiene permiso. Ingresá de nuevo.');
      return;
    }
    mostrarAviso(err.message || 'Algo salió mal. Probá de nuevo.');
  }

  /* ---------------- Filtro ---------------- */
  const sinAcentos = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function filtrar() {
    const q = sinAcentos(filtroTexto.value.trim());
    if (!q) return inscriptos;
    const qDigitos = q.replace(/\D/g, '');
    const campos = filtroCampo.value === 'todos' ? Validar.CAMPOS : [filtroCampo.value];
    return inscriptos.filter((r) => campos.some((c) => {
      const valor = sinAcentos(r[c]);
      if (valor.includes(q)) return true;
      // "12.345" encuentra el DNI 12345678; "341 555" encuentra el celular
      return (c === 'documento' || c === 'celular') && qDigitos !== '' && valor.replace(/\D/g, '').includes(qDigitos);
    }));
  }

  filtroTexto.addEventListener('input', render);
  filtroCampo.addEventListener('change', render);

  /* ---------------- Tabla ---------------- */
  function render() {
    const comparar = (a, b, c) => String(a[c] ?? '').localeCompare(String(b[c] ?? ''), 'es', { sensitivity: 'base' });
    const visibles = filtrar().slice().sort((a, b) => comparar(a, b, 'apellido') || comparar(a, b, 'nombre'));
    const hayFiltro = filtroTexto.value.trim() !== '';

    $('cont-total').textContent = inscriptos.length;
    $('cont-filtro').textContent = visibles.length;
    $('cont-filtro-wrap').hidden = !hayFiltro;

    cuerpo.replaceChildren(...visibles.map(fila));

    const vacio = $('tabla-vacia');
    vacio.hidden = visibles.length > 0;
    vacio.replaceChildren();
    if (visibles.length > 0) return;

    const p = document.createElement('p');
    if (inscriptos.length === 0) {
      p.textContent = 'Todavía no hay inscriptos. Cuando alguien complete el formulario, aparece acá.';
      vacio.append(p);
    } else {
      p.textContent = `Ningún inscripto coincide con «${filtroTexto.value.trim()}».`;
      const limpiar = document.createElement('button');
      limpiar.type = 'button';
      limpiar.className = 'btn-sec';
      limpiar.textContent = 'Limpiar búsqueda';
      limpiar.addEventListener('click', () => { filtroTexto.value = ''; render(); filtroTexto.focus(); });
      vacio.append(p, limpiar);
    }
  }

  function celda(texto, clase) {
    const td = document.createElement('td');
    td.className = clase;
    td.textContent = texto === undefined || texto === null || texto === '' ? '—' : texto;
    return td;
  }

  function celdaComprobante(valor) {
    const td = document.createElement('td');
    td.className = 'col-comprobante';
    if (valor && typeof valor === 'object') {
      valor = valor.url || valor.path || valor.ruta || valor.originalname || valor.filename || valor.nombre;
    }
    if (!valor) { td.textContent = '—'; return td; }

    const texto = String(valor);
    const esEnlace = /^https?:\/\//i.test(texto) || (texto.startsWith('/') && !texto.startsWith('//'));
    if (esEnlace && !API.MODO_DEMO) {
      const a = document.createElement('a');
      a.href = texto.startsWith('/') ? API.URL_BASE + texto : texto;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'link-comprobante';
      a.innerHTML = '<i class="fa-solid fa-file-invoice" aria-hidden="true"></i> Ver';
      td.append(a);
    } else {
      const span = document.createElement('span');
      span.className = 'archivo-nombre';
      span.textContent = texto.split('/').pop();
      span.title = texto;
      td.append(span);
    }
    return td;
  }

  function botonIcono(accion, icono, etiqueta) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn';
    b.dataset.accion = accion;
    b.title = etiqueta;
    b.setAttribute('aria-label', etiqueta);
    b.innerHTML = `<i class="fa-solid ${icono}" aria-hidden="true"></i>`;
    return b;
  }

  function quien(r) {
    return `${r.nombre ?? ''} ${r.apellido ?? ''}`.trim() || 'este inscripto';
  }

  function fila(r) {
    const tr = document.createElement('tr');
    tr.dataset.id = r.id;
    Validar.CAMPOS.forEach((c) => tr.append(celda(r[c], `col-${c}`)));
    tr.append(celdaComprobante(r.comprobante));
    const acciones = document.createElement('td');
    acciones.className = 'col-acciones';
    acciones.append(
      botonIcono('editar', 'fa-pen', `Editar a ${quien(r)}`),
      botonIcono('eliminar', 'fa-trash-can', `Eliminar a ${quien(r)}`),
    );
    tr.append(acciones);
    return tr;
  }

  cuerpo.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-accion]');
    if (!btn) return;
    const r = inscriptos.find((x) => String(x.id) === btn.closest('tr').dataset.id);
    if (!r) return;
    if (r.id === undefined || r.id === null) {
      mostrarAviso('Este registro no tiene ID, así que el servidor no permite editarlo ni eliminarlo.');
      return;
    }
    if (btn.dataset.accion === 'editar') abrirEdicion(r);
    else pedirEliminacion(r);
  });

  /* ---------------- Editar ---------------- */
  const camposEdicion = Validar.CAMPOS.map((c) => editarForm.elements[c]);
  camposEdicion.forEach(Validar.vigilar);

  function abrirEdicion(r) {
    idEditando = r.id;
    Validar.limpiarErrores(editarForm);
    camposEdicion.forEach((i) => { i.value = r[i.name] ?? ''; });
    $('editar-error').textContent = '';
    $('editar-titulo').textContent = `Editar a ${quien(r)}`;
    editarDlg.showModal();
  }

  editarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalidos = camposEdicion.filter((i) => !Validar.revisar(i));
    if (invalidos.length) { invalidos[0].focus(); return; }

    const datos = {};
    camposEdicion.forEach((i) => { datos[i.name] = Validar.limpiar(i.name, i.value); });

    const btn = $('editar-guardar');
    btn.disabled = true;
    btn.textContent = 'Guardando…';
    try {
      await API.actualizar(idEditando, datos);
      editarDlg.close();
      toast('Cambios guardados');
      await cargar();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { editarDlg.close(); manejarError(err); }
      else $('editar-error').textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar cambios';
    }
  });

  /* ---------------- Eliminar ---------------- */
  function pedirEliminacion(r) {
    idEliminando = r.id;
    $('eliminar-texto').textContent =
      `Vas a eliminar la inscripción de ${quien(r)}${r.documento ? ` (DNI ${r.documento})` : ''}. No se puede deshacer.`;
    eliminarDlg.showModal();
  }

  $('eliminar-ok').addEventListener('click', async () => {
    const btn = $('eliminar-ok');
    btn.disabled = true;
    btn.textContent = 'Eliminando…';
    try {
      await API.eliminar(idEliminando);
      eliminarDlg.close();
      toast('Inscripción eliminada');
      await cargar();
    } catch (err) {
      eliminarDlg.close();
      manejarError(err);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Eliminar';
    }
  });

  /* ---------------- Avisos ---------------- */
  function mostrarAviso(mensaje) {
    const a = $('admin-aviso');
    a.textContent = mensaje;
    a.hidden = false;
  }
  function ocultarAviso() { $('admin-aviso').hidden = true; }

  let timerToast;
  function toast(mensaje) {
    const t = $('toast');
    t.textContent = mensaje;
    t.classList.add('visible');
    clearTimeout(timerToast);
    timerToast = setTimeout(() => t.classList.remove('visible'), 2600);
  }

  // Si se recarga la página con el panel abierto, se vuelve a abrir
  if (location.hash === '#admin' && API.haySesion()) abrirPanel();
})();
