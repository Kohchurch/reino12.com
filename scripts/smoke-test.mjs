import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.TEST_SITE_URL || "http://localhost:3000";
const pages = JSON.parse(await fs.readFile("data/pages.json", "utf8")).data;
const posts = JSON.parse(await fs.readFile("data/posts.json", "utf8")).data;
const paths = [
  "/",
  "/articulos",
  "/articulos?page=2",
  "/articulos?page=3",
  ...pages
    .filter((p) => p.attributes.Slug !== "reino-de-los-cielos-iglesia-")
    .map((p) => `/${p.attributes.Slug}`),
  ...posts.map((p) => `/articulos/${p.attributes.Slug}`),
  "/sitemap.xml",
  "/robots.txt",
];
const failures = [];
for (let i = 0; i < paths.length; i += 4)
  await Promise.all(
    paths.slice(i, i + 4).map(async (route) => {
      const response = await fetch(base + route);
      const text = await response.text();
      if (
        response.status !== 200 ||
        !text.length ||
        text.includes("Application error:")
      )
        failures.push({ route, status: response.status });
    }),
  );
assert.deepEqual(failures, []);
assert.equal((await fetch(base + "/nonexistent-recovery-test")).status, 404);
assert.equal(
  (await fetch(base + "/api/revalidate?secret=invalid")).status,
  401,
);
const contactHtml = await (await fetch(base + "/contactenos")).text();
assert.ok(contactHtml.includes('class="contact-form"'));
assert.ok(contactHtml.includes('"accessKey"') || contactHtml.includes('\\"accessKey\\"'));
const homeHtml = await (await fetch(base)).text();
assert.match(homeHtml, /rel="icon"[^>]*href="\/favicon.ico"/);
assert.equal((await fetch(base + "/favicon.ico")).status, 200);
const signupAction = homeHtml.match(/<form[^>]*action="([^"]+)"/)?.[1];
const signupUrl = new URL(signupAction.replaceAll("&amp;", "&"));
assert.ok(signupUrl.searchParams.has("u"));
assert.ok(signupUrl.searchParams.has("id"));
assert.ok(!signupUrl.searchParams.has("amp;id"));
if (process.env.REVALIDATE_SECRET && new URL(base).hostname === "localhost") {
  const response = await fetch(base + "/api/revalidate", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.REVALIDATE_SECRET}` },
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).revalidated, true);
  console.log("Authenticated local cache invalidation: PASS");
}
const report = {
  base,
  routes: paths.length,
  failures,
  missingRouteStatus: 404,
  unauthorizedWebhookStatus: 401,
  contactFormConfigured: true,
  checkedAt: new Date().toISOString(),
};
await fs.writeFile(
  ".omx/recovery/smoke-test.json",
  JSON.stringify(report, null, 2),
);
console.log(
  `PASS: ${paths.length} routes, 404 handling, webhook authentication, contact configuration and favicon.`,
);
