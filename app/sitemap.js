import { getPages, getPosts } from "../lib/strapi.mjs";
export default async function sitemap() {
  const base = process.env.SITE_URL || "https://www.reino12.com";
  const [pages, posts] = await Promise.all([getPages(), getPosts()]);
  return [
    { url: base },
    { url: `${base}/articulos` },
    ...pages
      .filter((p) => p.attributes.Slug !== "reino-de-los-cielos-iglesia-")
      .map((p) => ({
        url: `${base}/${p.attributes.Slug}`,
        lastModified: p.attributes.updatedAt,
      })),
    ...posts.map((p) => ({
      url: `${base}/articulos/${p.attributes.Slug}`,
      lastModified: p.attributes.updatedAt,
    })),
  ];
}
