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

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

reveals.forEach((el) => observer.observe(el));

const form = document.querySelector("#contactForm");

if (form) {
  const submitButton = form.querySelector("button[type='submit']");
  const formNote = form.querySelector(".form-note");

  if (!form.querySelector("input[name='website']")) {
    const honeypot = document.createElement("input");
    honeypot.type = "text";
    honeypot.name = "website";
    honeypot.tabIndex = -1;
    honeypot.autocomplete = "off";
    honeypot.style.display = "none";
    form.appendChild(honeypot);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    if (formNote) {
      formNote.textContent = "Enviando tu solicitud...";
      formNote.classList.remove("success", "error");
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "No se pudo enviar el mensaje.");
      }

      form.reset();

      if (formNote) {
        formNote.textContent = "Gracias por contactarnos. Hemos recibido tu solicitud y te responderemos a la brevedad.";
        formNote.classList.add("success");
      }
    } catch (error) {
      if (formNote) {
        formNote.textContent = "No se pudo enviar el mensaje. Intenta nuevamente o contáctanos por WhatsApp.";
        formNote.classList.add("error");
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Solicitar reunión";
      }
    }
  });
}
