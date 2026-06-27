export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Método no permitido." });
  }

  try {
    const { nombre, empresa, correo, telefono, mensaje, website } = req.body || {};

    if (website) {
      return res.status(200).json({ ok: true, message: "Solicitud recibida." });
    }

    if (!nombre || !empresa || !correo || !mensaje) {
      return res.status(400).json({
        ok: false,
        message: "Por favor completa nombre, empresa, correo y mensaje."
      });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        message: "Falta configurar RESEND_API_KEY en Vercel."
      });
    }

    const text = `
Nueva solicitud desde infrapro.mx

Nombre: ${nombre}
Empresa: ${empresa}
Correo: ${correo}
Teléfono: ${telefono || "No proporcionado"}

Mensaje:
${mensaje}
`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="color:#0B1F3A;">Nueva solicitud desde infrapro.mx</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
        <p><strong>Empresa:</strong> ${escapeHtml(empresa)}</p>
        <p><strong>Correo:</strong> ${escapeHtml(correo)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(telefono || "No proporcionado")}</p>
        <hr />
        <p><strong>Mensaje:</strong></p>
        <p>${escapeHtml(mensaje).replace(/\n/g, "<br>")}</p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "InfraPro Web <onboarding@resend.dev>",
        to: ["contacto@infrapro.mx"],
        reply_to: correo,
        subject: `Nueva solicitud de ${empresa} - InfraPro México`,
        text,
        html
      })
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", result);
      return res.status(500).json({
        ok: false,
        message: "No se pudo enviar el mensaje. Intenta por WhatsApp o correo directo."
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Gracias por contactarnos. Hemos recibido tu solicitud."
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      ok: false,
      message: "Ocurrió un error. Intenta nuevamente o contáctanos por WhatsApp."
    });
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
