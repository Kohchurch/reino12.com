import fs from "node:fs/promises";
const token = (
  await fs.readFile("/Users/nazarii/.codex/reino12-vercel-token.txt", "utf8")
).trim();
const line = (await fs.readFile(".env.local", "utf8"))
  .split("\n")
  .find((line) => line.startsWith("WEB3FORMS_ACCESS_KEY="));
if (!line) throw new Error("Recovered form setting is missing");
const value = JSON.parse(line.slice(line.indexOf("=") + 1));
const endpoint =
  "https://api.vercel.com/v10/projects/prj_81vLyI436zchKZbtlGjuzdpJXP5H/env?teamId=team_0lAj40XyyHCHa3bj8Ty1GoVR&upsert=true";
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    key: "WEB3FORMS_ACCESS_KEY",
    value,
    type: "encrypted",
    target: ["production", "preview", "development"],
  }),
});
const payload = await response.json();
console.log({
  status: response.status,
  setting: "WEB3FORMS_ACCESS_KEY",
  error: payload.error?.code,
});
if (!response.ok) process.exit(1);
