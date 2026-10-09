// Web3Forms requires browser requests. Its access key is a public form ID.
export async function sendContact(data, key) {
  if (data.botcheck) return;
  const { name, email, message } = data;
  if (
    typeof name !== "string" || !name.trim() || name.length > 200 ||
    typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
    typeof message !== "string" || !message.trim() || message.length > 10000
  ) throw new Error("Por favor revisa tu nombre, correo y mensaje.");
  if (!key) throw new Error("El formulario no está disponible temporalmente. Inténtalo más tarde.");
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: key, name: name.trim(), email, message: message.trim(),
      from_name: "Reino de los Cielos",
      subject: "New Contact Message from your Website",
    }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error("No se pudo enviar el mensaje. Inténtalo de nuevo.");
}
