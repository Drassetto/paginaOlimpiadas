/* =============================================================
   validaciones.js
   Reglas compartidas por el formulario de inscripción
   (inscripcion.js) y la edición del panel (admin.js).
   Todo se revisa ANTES de mandar los datos al servidor.
   ============================================================= */
const Validar = (() => {

  // Campos de texto del inscripto, en el orden de la consigna
  const CAMPOS = ['apellido', 'nombre', 'documento', 'email', 'celular', 'empresa', 'cargo'];

  const MAX_MB = 5;
  const LETRA = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ';
  // Palabras de letras separadas por un espacio, apóstrofo o guion: "De la Vega", "O'Brien"
  const NOMBRE_PROPIO = new RegExp(`^[${LETRA}]+(?:[ '\\-][${LETRA}]+)*$`);
  const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  // Celular argentino: característica + número (10 dígitos), con +54 9 opcional
  const CELULAR = /^(?:\+?54)?9?[1-9]\d{9}$/;

  // Deja el dato prolijo para guardarlo
  function limpiar(nombre, valor) {
    const v = String(valor ?? '').trim().replace(/\s+/g, ' ');
    if (nombre === 'documento') return v.replace(/\D/g, '');
    if (nombre === 'celular') return v.replace(/[^\d+]/g, '');
    if (nombre === 'email') return v.toLowerCase();
    return v;
  }

  function nombrePropio(v, que) {
    if (!v) return `Falta ${que}.`;
    if (v.length < 2 || v.length > 40) return 'Tiene que tener entre 2 y 40 letras.';
    if (!NOMBRE_PROPIO.test(v)) return 'Usá solo letras, espacios, apóstrofos o guiones.';
    return '';
  }

  function textoLibre(v, que) {
    if (!v) return `Falta ${que}.`;
    if (v.length < 2) return 'Escribí al menos 2 caracteres.';
    if (v.length > 60) return 'Usá como máximo 60 caracteres.';
    if (!new RegExp(`[${LETRA}]`).test(v)) return 'Tiene que incluir al menos una letra.';
    return '';
  }

  const reglas = {
    apellido: (v) => nombrePropio(v, 'el apellido'),
    nombre: (v) => nombrePropio(v, 'el nombre'),

    documento(v, original) {
      if (!original.trim()) return 'Falta el DNI.';
      if (/[^\d.\s]/.test(original)) return 'El DNI solo puede tener números.';
      if (v.length !== 8) return `El DNI tiene que tener 8 números (escribiste ${v.length}).`;
      if (/^(\d)\1{7}$/.test(v)) return 'Ese DNI no parece real.';
      return '';
    },

    email(v) {
      if (!v) return 'Falta el email.';
      const [local = ''] = v.split('@');
      if (!EMAIL.test(v) || v.includes('..') || local.startsWith('.') || local.endsWith('.')) {
        return 'Revisá el email: tiene que ser del tipo nombre@dominio.com.';
      }
      return '';
    },

    celular(v, original) {
      if (!original.trim()) return 'Falta el celular.';
      if (/[^\d\s+()\-.]/.test(original)) return 'El celular solo puede tener números.';
      if (!CELULAR.test(v)) return 'Escribilo con característica, sin 0 ni 15. Ej: 341 555 1234.';
      return '';
    },

    empresa: (v) => textoLibre(v, 'la institución o empresa'),
    cargo: (v) => textoLibre(v, 'el cargo'),
  };

  // Devuelve el mensaje de error ('' si está bien)
  function campo(nombre, valor) {
    const regla = reglas[nombre];
    return regla ? regla(limpiar(nombre, valor), String(valor ?? '')) : '';
  }

  // Comprobante: obligatorio, PDF o JPG, hasta 5 MB y que el contenido
  // realmente sea PDF/JPG (se miran los primeros bytes del archivo).
  async function archivo(file) {
    if (!file) return 'Adjuntá el comprobante de pago.';
    const partes = file.name.toLowerCase().split('.');
    const ext = partes.length > 1 ? partes.pop() : '';
    const tiposOk = ['application/pdf', 'image/jpeg'];
    if (!['pdf', 'jpg', 'jpeg'].includes(ext) || (file.type && !tiposOk.includes(file.type))) {
      return 'Solo se aceptan archivos PDF o JPG.';
    }
    if (file.size === 0) return 'El archivo está vacío.';
    if (file.size > MAX_MB * 1024 * 1024) {
      return `El archivo pesa ${(file.size / 1048576).toFixed(1)} MB y el máximo es ${MAX_MB} MB.`;
    }
    try {
      const b = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      const esPdf = b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46; // %PDF
      const esJpg = b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;
      if ((ext === 'pdf' && !esPdf) || (ext !== 'pdf' && !esJpg)) {
        return 'El archivo no es un PDF o JPG real (¿le cambiaron la extensión?).';
      }
    } catch {
      // Si el navegador no lo puede leer, que decida el servidor
    }
    return '';
  }

  // ---- Ayudas para mostrar errores en pantalla -------------------
  function mostrar(input, mensaje) {
    const error = document.getElementById(input.id + '-error');
    if (error) error.textContent = mensaje;
    input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
    return !mensaje;
  }

  function revisar(input) {
    input.dataset.revisado = '1';
    return mostrar(input, campo(input.name, input.value));
  }

  // Revisa al salir del campo y, si ya tenía error, mientras escribe
  function vigilar(input) {
    input.addEventListener('blur', () => {
      if (input.value.trim() !== '' || input.dataset.revisado) revisar(input);
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') revisar(input);
    });
  }

  function limpiarErrores(form) {
    form.querySelectorAll('[aria-invalid]').forEach((i) => {
      i.removeAttribute('aria-invalid');
      delete i.dataset.revisado;
    });
    form.querySelectorAll('.campo-error').forEach((p) => { p.textContent = ''; });
  }

  return { CAMPOS, MAX_MB, campo, limpiar, archivo, mostrar, revisar, vigilar, limpiarErrores };
})();
