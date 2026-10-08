import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const urls = new Set();
function collect(value) {
  if (!value || typeof value !== "object") return;
  if (
    typeof value.url === "string" &&
    /^https:\/\/res\.cloudinary\.com\//.test(value.url)
  )
    urls.add(value.url);
  for (const item of Object.values(value)) collect(item);
}
for (const name of ["pages", "posts"])
  collect(JSON.parse(await fs.readFile(`data/${name}.json`, "utf8")));
await fs.mkdir("public/recovered/images", { recursive: true });
const map = {};
const failures = [];
const list = [...urls];
for (let i = 0; i < list.length; i += 6)
  await Promise.all(
    list.slice(i, i + 6).map(async (url) => {
      const extension =
        new URL(url).pathname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)?.[0] ||
        ".jpg";
      const file = `${createHash("sha256").update(url).digest("hex").slice(0, 24)}${extension}`;
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await fs.writeFile(
          `public/recovered/images/${file}`,
          Buffer.from(await response.arrayBuffer()),
        );
        map[url] = `/recovered/images/${file}`;
      } catch (error) {
        failures.push({ url, error: error.message });
      }
    }),
  );
await fs.writeFile(
  ".omx/recovery/media-map.json",
  JSON.stringify(map, null, 2),
);
await fs.writeFile(
  ".omx/recovery/media-failures.json",
  JSON.stringify(failures, null, 2),
);
console.log(
  `Downloaded ${Object.keys(map).length}/${urls.size} CMS images; ${failures.length} failures.`,
);
