export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Datos inválidos." }, { status: 400 });
  }
  if (body.botcheck) return Response.json({ success: true });
  const { name, email, message } = body;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 200 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 10000
  )
    return Response.json(
      { error: "Por favor revisa tu nombre, correo y mensaje." },
      { status: 400 },
    );
  const key =
    process.env.WEB3FORMS_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!key)
    return Response.json(
      {
        error:
          "El formulario no está disponible temporalmente. Inténtalo más tarde.",
      },
      { status: 503 },
    );
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: key,
        name: name.trim(),
        email,
        message: message.trim(),
        from_name: "Reino de los Cielos",
        subject: "New Contact Message from your Website",
      }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error("Delivery failed");
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "No se pudo enviar el mensaje. Inténtalo de nuevo." },
      { status: 502 },
    );
  }
}
