const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu");

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelector("#year").textContent = new Date().getFullYear();

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

reveals.forEach((el) => observer.observe(el));

const form = document.querySelector("#contactForm");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const nombre = data.get("nombre") || "";
    const empresa = data.get("empresa") || "";
    const correo = data.get("correo") || "";
    const telefono = data.get("telefono") || "";
    const mensaje = data.get("mensaje") || "";

    const subject = encodeURIComponent("Solicitud de reunión - InfraPro México");
    const body = encodeURIComponent(
`Hola InfraPro,

Me gustaría solicitar una reunión.

Nombre: ${nombre}
Empresa: ${empresa}
Correo: ${correo}
Teléfono: ${telefono}

Proyecto:
${mensaje}

Gracias.`
    );

    window.location.href = `mailto:contacto@infrapro.mx?subject=${subject}&body=${body}`;
  });
}
