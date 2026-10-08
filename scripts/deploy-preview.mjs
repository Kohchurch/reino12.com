import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const token = (
  await fs.readFile("/Users/nazarii/.codex/reino12-vercel-token.txt", "utf8")
).trim();
const team = "team_0lAj40XyyHCHa3bj8Ty1GoVR";
const project = "prj_81vLyI436zchKZbtlGjuzdpJXP5H";
const headers = { Authorization: `Bearer ${token}` };
const values = Object.fromEntries(
  (await fs.readFile(".env.local", "utf8"))
    .trim()
    .split("\n")
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), JSON.parse(line.slice(i + 1))];
    }),
);
async function walk(dir) {
  return (
    await Promise.all(
      (await fs.readdir(dir, { withFileTypes: true })).map((n) =>
        n.isDirectory() ? walk(path.join(dir, n.name)) : path.join(dir, n.name),
      ),
    )
  ).flat();
}
const paths = [
  ...(
    await Promise.all(["app", "components", "data", "lib", "public"].map(walk))
  ).flat(),
  "package.json",
  "package-lock.json",
  "next.config.mjs",
];
const files = [];
for (let i = 0; i < paths.length; i += 6)
  await Promise.all(
    paths.slice(i, i + 6).map(async (file) => {
      const content = await fs.readFile(file);
      const sha = createHash("sha1").update(content).digest("hex");
      const response = await fetch(
        `https://api.vercel.com/v2/files?teamId=${team}`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/octet-stream",
            "x-vercel-digest": sha,
            "Content-Length": String(content.length),
          },
          body: content,
        },
      );
      if (!response.ok)
        throw new Error(`Upload ${file}: HTTP ${response.status}`);
      files.push({ file, sha, size: content.length });
    }),
  );
console.log(`Uploaded ${files.length} source and asset files.`);
const response = await fetch(
  `https://api.vercel.com/v13/deployments?teamId=${team}`,
  {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "koh-nextjs",
      project,
      files,
      env: values,
      build: { env: values },
      meta: { recovery: "output-and-strapi", recoveryDate: "2026-10-08" },
    }),
  },
);
const data = await response.json();
const report = {
  id: data.id,
  url: data.url ? `https://${data.url}` : undefined,
  state: data.readyState,
  status: response.status,
  errorCode: data.error?.code,
  errorMessage: data.error?.message,
};
await fs.writeFile(
  ".omx/recovery/preview-deploy.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
if (!response.ok) process.exit(1);
