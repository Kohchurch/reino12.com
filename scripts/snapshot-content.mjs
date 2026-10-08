import fs from "node:fs/promises";
import path from "node:path";

const base = "https://koh-strapi-3e871b1f9bd4.herokuapp.com/api/";
const destination = path.resolve(".omx/recovery/cms");
await fs.mkdir(destination, { recursive: true });

async function request(endpoint) {
  const response = await fetch(base + endpoint, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`${endpoint}: ${response.status}`);
  return response.json();
}

for (const [name, endpoint] of Object.entries({
  pages: "pages?populate[Page][populate]=*&populate[SEO]=*",
  menu: "main-menu?populate=*",
  footer: "footer-menu?populate=*",
})) {
  const result = await request(endpoint);
  await fs.writeFile(
    path.join(destination, name + ".json"),
    JSON.stringify(result, null, 2),
  );
  console.log(`Archived CMS ${name}`);
}

const posts = [];
let page = 1;
let pageCount = 1;
do {
  const result = await request(
    `posts?populate=*&sort=id:desc&pagination[pageSize]=100&pagination[page]=${page}`,
  );
  posts.push(...result.data);
  pageCount = result.meta.pagination.pageCount;
  page++;
} while (page <= pageCount);
await fs.writeFile(
  path.join(destination, "posts.json"),
  JSON.stringify({ data: posts }, null, 2),
);
console.log(`Archived all ${posts.length} posts`);

const requests = [
  "pages?populate[Page][on][blocks.hero-section][populate]=*&populate[Page][on][blocks.join-us-testimonials][populate][Testimonials][populate]=*&populate[Page][on][blocks.text-with-image][populate]=*&populate[Page][on][blocks.header][populate]=*&populate[Page][on][blocks.content-main][populate]=*&populate[Page][on][blocks.contact-callout][populate]=*&populate[Page][on][blocks.faq][populate]=*&populate[Page][on][blocks.accordion][populate]=*&populate[SEO]=*",
];
for (const endpoint of requests) {
  try {
    const result = await request(endpoint);
    await fs.writeFile(
      path.join(destination, "pages-deep.json"),
      JSON.stringify(result, null, 2),
    );
    console.log("Archived deeply populated page relations");
  } catch (error) {
    console.log("Deep population needs schema adjustment:", error.message);
  }
}
