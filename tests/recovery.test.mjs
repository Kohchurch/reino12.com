import test from "node:test";
import assert from "node:assert/strict";
import { collection, safeHref, media } from "../lib/strapi.mjs";
import { POST } from "../app/api/contact/route.js";
import { parseVideos } from "../lib/youtube.mjs";
import fs from "node:fs";
import mediaMap from "../data/media-map.json" with { type: "json" };
test("every downloaded CMS image exists and is nonempty", () => {
  assert.equal(Object.keys(mediaMap).length, 181);
  for (const file of Object.values(mediaMap))
    assert.ok(fs.statSync(`public${file}`).size > 0, file);
});
test("public video feed only accepts valid video IDs", () => {
  assert.deepEqual(
    parseVideos(
      "<entry><yt:videoId>UbCToYh6Wu4</yt:videoId><title>Faith &amp; Hope</title></entry><entry><yt:videoId>invalid</yt:videoId></entry>",
    ),
    [{ id: "UbCToYh6Wu4", title: "Faith & Hope" }],
  );
});
import pages from "../data/pages.json" with { type: "json" };
import posts from "../data/posts.json" with { type: "json" };
test("paginates the complete CMS collection", async () => {
  const seen = [];
  const data = await collection("posts", {}, { data: [] }, async (url) => {
    const page = Number(url.searchParams.get("pagination[page]"));
    seen.push(page);
    return Response.json({
      data: [{ id: page }],
      meta: { pagination: { pageCount: 3 } },
    });
  });
  assert.deepEqual(seen, [1, 2, 3]);
  assert.equal(data.length, 3);
});
test("partial CMS failure uses a complete snapshot rather than incomplete data", async () => {
  const data = await collection(
    "posts",
    {},
    { data: [{ id: 99 }] },
    async (url) =>
      Number(url.searchParams.get("pagination[page]")) === 1
        ? Response.json({
            data: [{ id: 1 }],
            meta: { pagination: { pageCount: 2 } },
          })
        : new Response("", { status: 503 }),
  );
  assert.deepEqual(data, [{ id: 99 }]);
});
test("unsafe links are rejected; links to this website stay in the recovered site", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "//evil.example",
    " javascript:alert(1)",
  ])
    assert.equal(safeHref(value), "#");
  assert.equal(
    safeHref("https://www.reino12.com/ministerios?a=1#top"),
    "/ministerios?a=1#top",
  );
  assert.equal(
    safeHref("mailto:office@example.com"),
    "mailto:office@example.com",
  );
});
test("snapshots cover every recovered block and every article slug is unique", () => {
  const supported = new Set([
    "header",
    "content-main",
    "text-with-image",
    "contact-callout",
    "hero-section",
    "join-us-testimonials",
    "youtube-callout",
    "masonry-gallery",
    "subscribe-callout",
    "text-image-callout",
    "centered-content-with-text-columns",
    "fa-qs",
    "all-text-features",
  ]);
  for (const p of pages.data)
    for (const b of p.attributes.Page)
      assert.ok(
        supported.has(b.__component.replace("blocks.", "")),
        b.__component,
      );
  assert.equal(posts.data.length, 35);
  assert.equal(new Set(posts.data.map((p) => p.attributes.Slug)).size, 35);
  for (const p of posts.data)
    assert.ok(p.attributes.Content?.length, p.attributes.Slug);
});
test("all archived media have local mappings", () => {
  for (const p of pages.data)
    for (const b of p.attributes.Page)
      if (b.Image?.data)
        assert.ok(media(b.Image).url.startsWith("/recovered/images/"));
});
const request = (body) =>
  new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin: "http://localhost" },
    body: JSON.stringify(body),
  });
test("contact rejects invalid data and foreign origins before sending", async () => {
  assert.equal(
    (await POST(request({ name: "Test", email: "invalid", message: "Test" })))
      .status,
    400,
  );
  assert.equal(
    (
      await POST(
        new Request("http://localhost/api/contact", {
          method: "POST",
          headers: { origin: "https://elsewhere.example" },
          body: "{}",
        }),
      )
    ).status,
    403,
  );
  assert.equal((await POST(request({ botcheck: "spam" }))).status, 200);
});
test("contact submits to the original provider using mocked delivery", async () => {
  const previous = global.fetch;
  const previousKey = process.env.WEB3FORMS_ACCESS_KEY;
  process.env.WEB3FORMS_ACCESS_KEY = "test-key";
  global.fetch = async (url, options) => {
    assert.equal(url, "https://api.web3forms.com/submit");
    const body = JSON.parse(options.body);
    assert.equal(body.email, "test@example.com");
    assert.equal(body.access_key, "test-key");
    return Response.json({ success: true });
  };
  try {
    assert.equal(
      (
        await POST(
          request({
            name: "Test",
            email: "test@example.com",
            message: "A test with mocked delivery",
          }),
        )
      ).status,
      200,
    );
  } finally {
    global.fetch = previous;
    if (previousKey === undefined) delete process.env.WEB3FORMS_ACCESS_KEY;
    else process.env.WEB3FORMS_ACCESS_KEY = previousKey;
  }
});
