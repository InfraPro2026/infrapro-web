const menuToggle=document.querySelector('.menu-toggle');const menu=document.querySelector('#menu');if(menuToggle&&menu){menuToggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuToggle.setAttribute('aria-expanded',open?'true':'false')});menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}))}const y=document.querySelector('#year');if(y)y.textContent=new Date().getFullYear();const reveals=document.querySelectorAll('.reveal');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible')})},{threshold:.12});reveals.forEach(el=>observer.observe(el));const form=document.querySelector('#contactForm');if(form){form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const subject=encodeURIComponent('Solicitud de reunión - InfraPro México');const body=encodeURIComponent(`Hola InfraPro,

Me gustaría solicitar una reunión.

Nombre: ${d.get('nombre')||''}
Empresa: ${d.get('empresa')||''}
Correo: ${d.get('correo')||''}
Teléfono: ${d.get('telefono')||''}

Proyecto:
${d.get('mensaje')||''}

Gracias.`);window.location.href=`mailto:contacto@infrapro.mx?subject=${subject}&body=${body}`})}