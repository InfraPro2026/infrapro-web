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
    const sheetsUrl = process.env.LEADS_WEBHOOK_URL;

    if (!apiKey) {
      return res.status(500).json({ ok: false, message: "Falta configurar RESEND_API_KEY en Vercel." });
    }

    const leadPayload = { nombre, empresa, correo, telefono: telefono || "", mensaje };

    // Guardar lead en Google Sheets
    if (sheetsUrl) {
      try {
        await fetch(sheetsUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(leadPayload)
        });
      } catch (sheetError) {
        console.error("Google Sheets error:", sheetError);
        // No detenemos el envío de correo si Sheets falla.
      }
    }

    const leadHtml = `
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

    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="color:#0B1F3A;">Gracias por contactar a InfraPro México</h2>
        <p>Hola ${escapeHtml(nombre)},</p>
        <p>Hemos recibido correctamente tu solicitud.</p>
        <p>Nuestro equipo revisará la información y se pondrá en contacto contigo en menos de 24 horas hábiles.</p>
        <p>Mientras tanto, puedes visitar <a href="https://infrapro.mx">https://infrapro.mx</a> o escribirnos por WhatsApp.</p>
        <p style="margin-top:24px;">Saludos,<br><strong>Equipo InfraPro México</strong></p>
      </div>
    `;

    // Correo interno a InfraPro
    const internalEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "InfraPro México <contacto@infrapro.mx>",
        to: ["contacto@infrapro.mx"],
        reply_to: correo,
        subject: `Nueva solicitud de ${empresa} - InfraPro México`,
        html: leadHtml
      })
    });

    const internalResult = await internalEmail.json();

    if (!internalEmail.ok) {
      console.error("Resend internal error:", internalResult);
      return res.status(500).json({
        ok: false,
        message: "No se pudo enviar el mensaje. Intenta por WhatsApp o correo directo."
      });
    }

    // Confirmación automática al cliente
    const confirmationEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "InfraPro México <contacto@infrapro.mx>",
        to: [correo],
        reply_to: "contacto@infrapro.mx",
        subject: "Hemos recibido tu solicitud - InfraPro México",
        html: confirmationHtml
      })
    });

    const confirmationResult = await confirmationEmail.json();

    if (!confirmationEmail.ok) {
      console.error("Resend confirmation error:", confirmationResult);
      // No detenemos la operación si falla la confirmación al cliente.
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
