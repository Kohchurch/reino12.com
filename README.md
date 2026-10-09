# Reino de los Cielos — recovered website

Maintainable Next.js source reconstructed from the production Vercel Output, rendered website, and public Strapi content. The original repository and server function source were unavailable. This is a reconstruction, not the original developer's source code.

## Run

Use Node.js 22 or newer. Run `npm ci`, copy `.env.example` to `.env.local`, configure the values, then run `npm run dev`. Use `npm run build` and `npm start` for production.

## Content and integrations

- Five published Strapi pages, all 13 existing block types, and all 35 published articles are supported. Article pagination includes content beyond the former first 25 results.
- Menu, footer, text, photos, SEO, CTAs, testimonials, FAQs, and galleries come from Strapi. Published changes refresh through a 60-second cache on subsequent visits. An authenticated webhook can expire the cache immediately.
- The original fonts and CSS are archived in `public/recovered`. Current CMS images have local copies; newly uploaded images continue to load from Strapi/Cloudinary. Public content snapshots in `data` provide a fallback if the CMS is unavailable.
- The client-provided KOH logo is preserved in `public/rdc-logo-lg.png` and displayed without its transparent outer padding.
- Contact forms submit directly from the browser to Web3Forms, as required by its spam protection. `WEB3FORMS_ACCESS_KEY` is a public form identifier passed to the contact component, not an account credential. Mailchimp subscriptions use `NEXT_PUBLIC_MAILCHIMP_URL` and open the provider's signup result in a new tab.
- YouTube recordings use the church's public channel feed without an API key, refresh hourly, and fall back to verified video IDs if the feed is unavailable.
- Donation, directions, Instagram, and announcement links retain their existing destinations. Sitemap and robots routes are generated from CMS content.
- The original Google Analytics property is retained for production Vercel deployments; previews and local tests do not send analytics.

## Strapi webhook

Send POST to `https://www.reino12.com/api/revalidate` with `Authorization: Bearer <REVALIDATE_SECRET>` or `x-revalidate-secret: <REVALIDATE_SECRET>`. The existing `?secret=` convention is also supported. Register the webhook for publish, unpublish, update, create, and delete events. The endpoint expires all CMS data and page caches, including navigation and footer.

## Verification and remaining external checks

`npm test` checks full CMS pagination, outage fallback, safe links, block coverage, media recovery, video parsing, and contact validation/delivery using a mocked provider. `node scripts/smoke-test.mjs` checks every restored page/article, article pagination, sitemap, robots, missing routes, and unauthenticated API access against a running production build.

Real contact messages and newsletter signups have not been sent during recovery. Mailbox receipt, Mailchimp subscription confirmation, and Strapi admin publish/webhook changes require an authorized external test. No source map or original server function bundle was available. Existing /eventos, /direcciones, /privacy-policy, /terms-of-service, and /cookie-policy URLs had no published CMS page and displayed the old missing-page screen; unknown URLs now return a proper 404. Current CMS menus no longer link to these missing pages. Legal text has not been invented.

Recovery scripts and the original evidence archive are local tooling. Vercel credentials and `.env.local` are excluded from Git and deployment uploads. The Vercel API preview helper explicitly uploads only app, components, data, lib, public, and package/config files; it never promotes production.
