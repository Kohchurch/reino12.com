import pagesBackup from "../data/pages.json" with { type: "json" };
import postsBackup from "../data/posts.json" with { type: "json" };
import menuBackup from "../data/menu.json" with { type: "json" };
import footerBackup from "../data/footer.json" with { type: "json" };
import mediaMap from "../data/media-map.json" with { type: "json" };

const base = (
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  "https://koh-strapi-3e871b1f9bd4.herokuapp.com"
).replace(/\/$/, "");
export async function collection(resource, query, fallback, request = fetch) {
  try {
    const result = [];
    for (let page = 1; page <= 100; page++) {
      const url = new URL(`${base}/api/${resource}`);
      for (const [key, value] of Object.entries(query))
        url.searchParams.set(key, value);
      url.searchParams.set("pagination[pageSize]", "100");
      url.searchParams.set("pagination[page]", String(page));
      const response = await request(url, {
        next: { revalidate: 60, tags: ["strapi"] },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`CMS HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.data))
        throw new Error("Invalid CMS collection");
      result.push(...payload.data);
      if (page >= (payload.meta?.pagination?.pageCount || 1)) return result;
    }
    throw new Error("CMS pagination limit");
  } catch (error) {
    console.error(
      `CMS ${resource} unavailable; using recovery snapshot: ${error.message}`,
    );
    return fallback.data;
  }
}
async function singleton(resource, fallback) {
  try {
    const response = await fetch(`${base}/api/${resource}?populate=*`, {
      next: { revalidate: 60, tags: ["strapi"] },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("CMS unavailable");
    const payload = await response.json();
    if (!payload.data?.attributes) throw new Error("Invalid CMS singleton");
    return payload.data.attributes;
  } catch {
    return fallback.data.attributes;
  }
}
export const getPages = () =>
  collection(
    "pages",
    { "populate[Page][populate]": "*", "populate[SEO]": "*" },
    pagesBackup,
  );
export const getPosts = () =>
  collection("posts", { populate: "*", sort: "id:desc" }, postsBackup);
export const getMenu = () => singleton("main-menu", menuBackup);
export const getFooter = () => singleton("footer-menu", footerBackup);
export const attributes = (entity) => entity?.attributes || entity || {};
export function safeHref(value) {
  if (typeof value !== "string") return "#";
  const url = value.trim();
  if (/^https?:\/\/(www\.)?reino12\.com(?:\/|$)/i.test(url)) {
    const local = new URL(url);
    return local.pathname + local.search + local.hash;
  }
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url) ? url : "#";
}
export function media(value) {
  const item = attributes(value?.data || value);
  return item.url
    ? {
        ...item,
        url:
          mediaMap[item.url] ||
          (item.url.startsWith("/") ? `${base}${item.url}` : item.url),
      }
    : null;
}
