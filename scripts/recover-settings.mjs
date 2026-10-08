import fs from "node:fs/promises";
import path from "node:path";
const token = (
  await fs.readFile("/Users/nazarii/.codex/reino12-vercel-token.txt", "utf8")
).trim();
const url =
  "https://api.vercel.com/v9/projects/prj_81vLyI436zchKZbtlGjuzdpJXP5H/env?decrypt=true&teamId=team_0lAj40XyyHCHa3bj8Ty1GoVR";
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!response.ok) throw new Error(`Settings access HTTP ${response.status}`);
const { envs } = await response.json();
const values = new Map();
for (const env of envs.filter((e) => e.target?.includes("production"))) {
  const response = await fetch(
    `https://api.vercel.com/v1/projects/prj_81vLyI436zchKZbtlGjuzdpJXP5H/env/${env.id}?teamId=team_0lAj40XyyHCHa3bj8Ty1GoVR`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok)
    throw new Error(`Decrypt ${env.key} HTTP ${response.status}`);
  const data = await response.json();
  if (!data.decrypted || typeof data.value !== "string")
    throw new Error(`Setting ${env.key} was not decrypted`);
  values.set(env.key, data.value);
}
async function walk(dir) {
  const names = await fs.readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      names.map((n) =>
        n.isDirectory() ? walk(path.join(dir, n.name)) : path.join(dir, n.name),
      ),
    )
  ).flat();
}
for (const file of await walk(".omx/recovery/output/_next/static")) {
  if (!file.endsWith(".js")) continue;
  const text = await fs.readFile(file, "utf8");
  const match =
    text.match(/PUBLIC_ACCESS_KEY\|\|["']([a-f0-9-]{36})["']/i) ||
    text.match(/access_key:\s*["']([a-f0-9-]{36})["']/i);
  if (match) values.set("WEB3FORMS_ACCESS_KEY", match[1]);
}
await fs.writeFile(
  ".env.local",
  [...values].map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("\n") + "\n",
  { mode: 0o600 },
);
console.log("Recovered setting names:", [...values.keys()].join(", "));
