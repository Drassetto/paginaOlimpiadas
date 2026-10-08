/* ============================================================
   DATOS DE LAS OLIMPÍADAS
   ------------------------------------------------------------
   Para agregar una olimpíada nueva: copiá un bloque { ... },
   pegalo al final del array y cambiá los valores.
   El orden del array = el orden en que aparecen las tarjetas.

   Campos:
     acronimo     (obligatorio) sigla que va arriba de la tarjeta
     nombre       (obligatorio) nombre completo
     logo         (opcional)    URL de la imagen; si falta, no se
                                dibuja el <img>
     descripcion  (obligatorio) párrafo descriptivo
     destacados   (opcional)    array de nombres; si está vacío o
                                no está, no se dibuja el bloque
                                "Polipibes destacados"
     organizador  (obligatorio) institución que organiza
     detalle      (opcional)    línea chica debajo del organizador
     links        (opcional)    { web: "...", instagram: "..." }
                                cada uno es opcional por separado
   ============================================================ */

const OLIMPIADAS = [

  {
    acronimo: "OMA",
    nombre: "Olimpíada Matemática Argentina",
    logo: "https://www.oma.org.ar/contents/logos/oma.png",
    descripcion: "Estimula entre los alumnos de los establecimientos educativos la capacidad para resolver problemas mediante el ingenio, el razonamiento lógico y la creatividad matemática a través de sus distintos niveles.",
    destacados: ["Julián Cabrera", "Germán Muller", "Federico Mierez"],
    organizador: "Fundación OMA",
    detalle: "Instancias: Escolar hasta Nacional",
    links: {
      web: "http://www.oma.org.ar/",
      instagram: "https://instagram.com/oma.org.ar"
    }
  },

  {
    acronimo: "OACJr",
    nombre: "Olimpíada de Ciencias Junior",
    logo: "https://www.uncuyo.edu.ar/olimpiadas/images/olimpiadas-logo.png",
    descripcion: "Promueve el interés por las Ciencias Naturales (Física, Química y Biología) en alumnos del nivel primario y secundario bajo, priorizando el trabajo en equipo, la experimentación y el pensamiento crítico.",
    destacados: ["Máximo Nasurdi", "Lucas Díaz", "Juan Recoaro"],
    organizador: "Universidad Nacional de Cuyo",
    detalle: "Física, Química y Biología",
    links: {
      web: "https://www.uncuyo.edu.ar/olimpiadas/",
      instagram: "https://www.instagram.com/p/DM-2H5uJelE/"
    }
  },

  {
    acronimo: "OIA",
    nombre: "Olimpíada Informática Argentina",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBjPeow85qWZWnKHw4A1elXXAFRNAp_UDwQA&s",
    descripcion: "Enfocada en la resolución de problemas lógicos mediante algoritmos y lenguajes de programación (C++). Cuenta con categorías de Programación y Utilitarios para diferentes niveles escolares.",
    destacados: ["Román Castellarin", "Sebastián Mestre", "Ariel Fideleff"],
    organizador: "UNSAM",
    detalle: "Algoritmia y Programación",
    links: {
      web: "http://www.oia.unsam.edu.ar/"
    }
  },

  {
    acronimo: "OAF",
    nombre: "Olimpíada Argentina de Física",
    logo: "https://oaf.famaf.unc.edu.ar/wp-content/uploads/sites/18/2020/07/isologo_2020_041.png",
    descripcion: "Certamen que desafía a estudiantes secundarios en pruebas teóricas avanzadas y de laboratorio experimental, coordinado bajo un estricto rigor académico de nivel universitario.",
    destacados: ["Lucas Díaz", "Juan Recoaro", "Germán Blesio"],
    organizador: "FAMAF - UNC",
    detalle: "Mecánica, Termodinámica y Electromagnetismo",
    links: {
      web: "https://oaf.famaf.unc.edu.ar/"
    }
  },

  {
    acronimo: "OAQ",
    nombre: "Olimpíada Argentina de Química",
    logo: "https://lh3.googleusercontent.com/proxy/zmTpGZUUqGMgTDu-keH95iq7CLJk_ri6bVlfe5bHebj_Yc_h9LbKmZGJxw4jqXH-MGE8pCBJ0yIjNCskoUI-wNgQJi19nvt3Wo8a",
    descripcion: "Programa que contribuye a la formación científica de jóvenes promoviendo la competencia sana e integrando conocimientos de Química General, Inorgánica, Orgánica y Analítica.",
    destacados: ["Ariel Grillo", "Alejandro Ferreyra", "Ezequiel Luciano"],
    organizador: "UBA (FCEN)",
    detalle: "Ciencias Químicas",
    links: {
      web: "http://oaq.exactas.uba.ar/"
    }
  },

  {
    acronimo: "OAB",
    nombre: "Olimpíada Argentina de Biología",
    logo: "https://scontent.faep6-2.fna.fbcdn.net/v/t39.30808-1/500671755_1310044084457505_2693304876924247648_n.jpg?stp=dst-jpg_tt6&cstp=mx528x528&ctp=s200x200&_nc_cat=110&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=b8gBqcG1C8IQ7kNvwG4AMtp&_nc_oc=Adr3-8e67nURwV7zH2QDNJFVSQRJmN3YZATh85EXXafuhPSWgQN5FHDZqoM2omn1BAgDbvpJN6lNWdqZrz1Fl94J&_nc_zt=24&_nc_ht=scontent.faep6-2.fna&_nc_gid=5aG1MB1pTIwjxhNrjjuIqA&_nc_ss=79289&oh=00_Af8aIkbEsaeZPLnIJnfrgDQ4gQwS_FKk6tagZzWJXaiIpQ&oe=6A3E10FF",
    descripcion: "Estimula el interés de los alumnos en las Ciencias Biológicas, fomenta la actualización de contenidos docentes y estrecha vínculos entre la escuela secundaria y la universidad.",
    destacados: ["Alejo Melfi", "Diego Rassetto"],
    organizador: "UNRC",
    detalle: "Anatomía, Ecología, Genética y Evolución",
    links: {}
  }

];
