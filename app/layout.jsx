import { getMenu, getFooter, safeHref } from "../lib/strapi.mjs";
import { Navigation, Newsletter } from "../components/Interactive";
import Script from "next/script";
export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://www.reino12.com"),
  title: "Reino de los Cielos",
  description: "Iglesia Reino de los Cielos",
};
export default async function Layout({ children }) {
  const [menu, footer] = await Promise.all([getMenu(), getFooter()]);
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="/recovered/css/original.css" />
        <link rel="stylesheet" href="/recovered/css/site.css" />
      </head>
      <body className="bg-warmstone">
        {process.env.VERCEL_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-DNTSFGWD2X"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {
                "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-DNTSFGWD2X');"
              }
            </Script>
          </>
        )}
        <a className="skip-link" href="#content">
          Ir al contenido
        </a>
        <Navigation
          items={(menu.MainMenuItems || []).map((i) => ({
            ...i,
            url: safeHref(i.url),
          }))}
        />
        <main id="content">{children}</main>
        <footer>
          <div className="footer-top">
            <a href="/" className="footer-brand">
              <span className="brand-mark">
                <img src="/rdc-logo-lg.png" alt="" />
              </span>
              Reino de los Cielos
            </a>
            <div>
              <h3 className="cocogoose">Directo a tu correo</h3>
              <p>Inscríbete para recibir anuncios y más información.</p>
              <Newsletter url={process.env.NEXT_PUBLIC_MAILCHIMP_URL} />
            </div>
          </div>
          <nav aria-label="Footer">
            {footer.FooterLinks?.map((i) => (
              <a key={i.id} href={safeHref(i.url)}>
                {i.name}
              </a>
            ))}
          </nav>
          <p>
            © {new Date().getFullYear()} Reino de los Cielos. Todos los derechos
            reservados.
          </p>
        </footer>
      </body>
    </html>
  );
}
