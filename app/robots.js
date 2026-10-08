export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${process.env.SITE_URL || "https://www.reino12.com"}/sitemap.xml`,
  };
}
