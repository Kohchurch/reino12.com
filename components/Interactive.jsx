"use client";
import { useState } from "react";
export function Navigation({ items }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <nav aria-label="Global">
        <a href="/" className="brand">
          <span className="brand-mark">
            <img src="/rdc-logo-lg.png" alt="" />
          </span>
          <span>reino de los cielos</span>
        </a>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? "Cerrar ✕" : "Menú ☰"}
        </button>
        <div id="main-menu" className={`nav-links ${open ? "open" : ""}`}>
          {items.map((item) => (
            <a key={item.id} href={item.url} onClick={() => setOpen(false)}>
              {item.name}
            </a>
          ))}
          <a className="button gold solid" href="https://reino12.square.site/">
            Donaciónes
          </a>
        </div>
      </nav>
    </header>
  );
}
export function Testimonials({ items = [] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  return item ? (
    <div className="testimonial" aria-roledescription="carousel">
      <blockquote>{item.Content}</blockquote>
      <p>
        <strong>{item.Reviewer}</strong> · {item.Platform}
      </p>
      {items.length > 1 && (
        <div className="carousel-controls">
          <button
            aria-label="Testimonio anterior"
            onClick={() => setIndex((index + items.length - 1) % items.length)}
          >
            ←
          </button>
          <span>
            {index + 1} / {items.length}
          </span>
          <button
            aria-label="Siguiente testimonio"
            onClick={() => setIndex((index + 1) % items.length)}
          >
            →
          </button>
        </div>
      )}
    </div>
  ) : null;
}
export function ContactForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "No se pudo enviar el mensaje.");
      event.target.reset();
      setStatus("¡Gracias! Tu mensaje ha sido enviado.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSending(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Nombre
          <input
            name="name"
            placeholder="Nombre"
            required
            maxLength={200}
            autoComplete="name"
          />
        </label>
        <label>
          Correo Electrónico
          <input
            name="email"
            type="email"
            placeholder="Correo Electrónico"
            required
            maxLength={254}
            autoComplete="email"
          />
        </label>
      </div>
      <label>
        Mensaje
        <textarea
          name="message"
          placeholder="Mensaje"
          required
          maxLength={10000}
          rows={5}
        />
      </label>
      <input
        className="honeypot"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button className="button gold solid" disabled={sending}>
        {sending ? "Enviando…" : "Enviar Mensaje"}
      </button>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
export function Newsletter({ url }) {
  return url ? (
    <form
      action={url.replace("/post-json?", "/post?")}
      method="POST"
      target="_blank"
    >
      <label>
        <span className="sr-only">Correo Electrónico</span>
        <input
          type="email"
          name="EMAIL"
          required
          placeholder="Correo Electrónico"
        />
      </label>
      <button className="button magenta solid">Suscribirme</button>
    </form>
  ) : (
    <a className="button magenta solid" href="/contactenos">
      Contáctenos para suscribirte
    </a>
  );
}
