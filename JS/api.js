/* =============================================================
   api.js — comunicación con el servidor de inscripciones
   -------------------------------------------------------------
   Rutas del servidor (Actividad 4):
     GET    /                → lista de inscriptos       (requiere login)
     POST   /inscribir       → registra un inscripto     (acceso libre)
     PUT    /actualizar/:id  → actualiza un inscripto    (requiere login)
     DELETE /eliminar/:id    → elimina un inscripto      (requiere login)

   El login se manda como "Basic Auth" (nombre del grupo + contraseña,
   los mismos de SSH/SCP) en cada pedido protegido.
   ============================================================= */
const API = (() => {

  // ---- CONFIGURACIÓN ------------------------------------------
  // Dirección del servidor. Cambiala cuando el profe la pase.
  const URL_BASE = 'http://localhost:3000';

  // Mientras el servidor no esté funcionando, MODO_DEMO = true guarda
  // todo en este navegador (localStorage) para poder probar el
  // formulario y el panel. Cuando el servidor esté listo: false.
  const MODO_DEMO = true;
  const DEMO_USUARIO = 'veintiocho';
  const DEMO_CLAVE = '88och_876';
  // --------------------------------------------------------------

  const CLAVE_SESION = 'admin-sesion';
  const CLAVE_DEMO = 'demo-inscriptos';

  class ErrorApi extends Error {
    constructor(mensaje, status = 0) {
      super(mensaje);
      this.status = status;
    }
  }

  let sesion = leerSesion(); // { usuario, auth }

  function leerSesion() {
    try { return JSON.parse(sessionStorage.getItem(CLAVE_SESION)); }
    catch { return null; }
  }

  // Arma el encabezado "Basic ..." (soporta tildes y ñ)
  function basic(usuario, clave) {
    const bytes = new TextEncoder().encode(`${usuario}:${clave}`);
    let binario = '';
    bytes.forEach((b) => { binario += String.fromCharCode(b); });
    return 'Basic ' + btoa(binario);
  }

  // fetch con manejo de errores uniforme
  async function pedir(ruta, opciones = {}, auth = sesion?.auth) {
    const headers = { ...(opciones.headers || {}) };
    if (auth) headers.Authorization = auth;

    let resp;
    try {
      resp = await fetch(URL_BASE + ruta, { ...opciones, headers });
    } catch {
      throw new ErrorApi('No se pudo conectar con el servidor. Revisá que esté encendido y que la dirección sea correcta.');
    }

    const texto = await resp.text();
    let datos = null;
    try { datos = texto ? JSON.parse(texto) : null; } catch { datos = texto; }

    if (!resp.ok) {
      const msg = datos && typeof datos === 'object'
        ? (datos.error || datos.mensaje || datos.message)
        : (typeof datos === 'string' && datos.length < 200 ? datos : '');
      throw new ErrorApi(msg || `El servidor respondió con un error (${resp.status}).`, resp.status);
    }
    return datos;
  }

  // El servidor puede devolver un array o un objeto que lo contenga.
  // También normalizamos el id (id, _id o ID).
  function aLista(datos) {
    const lista = Array.isArray(datos)
      ? datos
      : (datos?.inscriptos ?? datos?.data ?? datos?.rows ?? datos?.resultado ?? []);
    return lista.map((r) => ({ ...r, id: r.id ?? r._id ?? r.ID }));
  }

  // ---- Simulación local (MODO_DEMO) -----------------------------
  const demo = {
    leer() {
      try { return JSON.parse(localStorage.getItem(CLAVE_DEMO)) || []; }
      catch { return []; }
    },
    guardar(lista) { localStorage.setItem(CLAVE_DEMO, JSON.stringify(lista)); },
    esperar() { return new Promise((r) => setTimeout(r, 350)); },
    exigirLogin(auth) {
      if (auth !== basic(DEMO_USUARIO, DEMO_CLAVE)) {
        throw new ErrorApi('No autorizado.', 401);
      }
    },
  };

  // ---- Operaciones -------------------------------------------------
  async function listar(auth = sesion?.auth) {
    if (MODO_DEMO) {
      await demo.esperar();
      demo.exigirLogin(auth);
      return demo.leer();
    }
    return aLista(await pedir('/', { method: 'GET' }, auth));
  }

  // Para validar el login probamos traer la lista con esas credenciales
  async function login(usuario, clave) {
    const auth = basic(usuario, clave);
    try {
      await listar(auth);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        throw new ErrorApi('El nombre del grupo o la contraseña no son correctos.', 401);
      }
      throw err;
    }
    sesion = { usuario, auth };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  function cerrarSesion() {
    sesion = null;
    sessionStorage.removeItem(CLAVE_SESION);
  }

  async function inscribir(formData) {
    if (MODO_DEMO) {
      await demo.esperar();
      const registro = {};
      formData.forEach((valor, clave) => {
        registro[clave] = valor instanceof File ? valor.name : valor;
      });
      registro.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const lista = demo.leer();
      lista.push(registro);
      demo.guardar(lista);
      return registro;
    }
    // multipart/form-data: el navegador arma el encabezado solo
    return pedir('/inscribir', { method: 'POST', body: formData }, null);
  }

  async function actualizar(id, datos) {
    if (MODO_DEMO) {
      await demo.esperar();
      demo.exigirLogin(sesion?.auth);
      const lista = demo.leer();
      const i = lista.findIndex((r) => String(r.id) === String(id));
      if (i === -1) throw new ErrorApi('Esa inscripción ya no existe. Actualizá la lista.', 404);
      lista[i] = { ...lista[i], ...datos };
      demo.guardar(lista);
      return lista[i];
    }
    return pedir(`/actualizar/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
  }

  async function eliminar(id) {
    if (MODO_DEMO) {
      await demo.esperar();
      demo.exigirLogin(sesion?.auth);
      demo.guardar(demo.leer().filter((r) => String(r.id) !== String(id)));
      return true;
    }
    return pedir(`/eliminar/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  return {
    URL_BASE, MODO_DEMO, DEMO_USUARIO, DEMO_CLAVE, ErrorApi,
    login, cerrarSesion, inscribir, actualizar, eliminar,
    listar: () => listar(),
    haySesion: () => Boolean(sesion),
    usuario: () => sesion?.usuario ?? '',
  };
})();
