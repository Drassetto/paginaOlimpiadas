    const menuBtn  = document.getElementById('menu-btn');
    const navMenu  = document.getElementById('nav-menu');
    const menuIcon = document.getElementById('menu-icon');

    function setMenu(open) {
      navMenu.classList.toggle('hidden', !open);
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menuIcon.className = (open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars') + ' text-2xl';
    }

    menuBtn.addEventListener('click', () => {
      setMenu(navMenu.classList.contains('hidden'));
    });

    // Al tocar un link, cerrar el menú
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    // Si se agranda la ventana a desktop, dejar el estado limpio
    window.matchMedia('(min-width: 768px)').addEventListener('change', e => {
      if (e.matches) setMenu(false);
    });