import fs from "node:fs/promises";
const token = (
  await fs.readFile("/Users/nazarii/.codex/reino12-vercel-token.txt", "utf8")
).trim();
const team = "team_0lAj40XyyHCHa3bj8Ty1GoVR";
const auth = { Authorization: `Bearer ${token}` };
const preview = JSON.parse(
  await fs.readFile(".omx/recovery/preview-deploy.json", "utf8"),
);
const deploymentResponse = await fetch(
  `https://api.vercel.com/v13/deployments/${preview.id}?teamId=${team}`,
  { headers: auth },
);
const deployment = await deploymentResponse.json();
const projectResponse = await fetch(
  `https://api.vercel.com/v9/projects/prj_81vLyI436zchKZbtlGjuzdpJXP5H?teamId=${team}`,
  { headers: auth },
);
const project = await projectResponse.json();
const bypass = Object.entries(project.protectionBypass || {}).find(
  ([, value]) =>
    value?.scope === "automation-bypass" || value?.type === "automation",
);
const requestHeaders = bypass
  ? { "x-vercel-protection-bypass": bypass[0] }
  : {};
const response = await fetch(preview.url, {
  headers: requestHeaders,
  redirect: "manual",
});
const html = await response.text();
const report = {
  id: preview.id,
  url: preview.url,
  state: deployment.readyState,
  error: deployment.errorMessage,
  httpStatus: response.status,
  protected:
    response.status >= 300 &&
    response.status < 400 &&
    !!response.headers.get("location")?.includes("vercel.com"),
  hasWelcome: html.includes("¡Bienvenido!"),
  hasVideos: html.includes("youtube-nocookie"),
  checkedAt: new Date().toISOString(),
};
await fs.writeFile(
  ".omx/recovery/preview-verification.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
if (deployment.readyState === "ERROR") process.exit(1);
