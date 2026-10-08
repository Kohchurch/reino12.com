import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const archive = path.join(root, ".omx/recovery");
const deployment = "dpl_J2ZyGkqvxdd7dhRLAWLmuKpQM5ms";
const team = "team_0lAj40XyyHCHa3bj8Ty1GoVR";
const deploymentHost =
  "koh-nextjs-d2grmz137-otoniel-chacons-projects.vercel.app";
const origin = "https://www.reino12.com";
const token = (
  await fs.readFile("/Users/nazarii/.codex/reino12-vercel-token.txt", "utf8")
).trim();
const headers = { Authorization: `Bearer ${token}` };
const records = [];

async function download(url, destination, authenticated = false) {
  const response = await fetch(url, {
    headers: authenticated ? headers : {},
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`${response.status}: ${new URL(url).pathname}`);
  const content = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, content);
  return {
    content,
    type: response.headers.get("content-type"),
    url: response.url,
  };
}

function safeDestination(base, relative) {
  const destination = path.resolve(base, relative);
  if (!destination.startsWith(path.resolve(base) + path.sep))
    throw new Error("Unsafe artifact path");
  return destination;
}

async function archiveOutput(directory = "out") {
  const treeUrl = `https://vercel.com/api/file-tree/${deploymentHost}?teamId=${team}&base=${encodeURIComponent(directory)}`;
  const response = await fetch(treeUrl, {
    headers,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Output tree failed: ${response.status}`);
  const nodes = await response.json();
  for (const node of nodes) {
    const relative = `${directory}/${node.name}`;
    if (node.type === "directory") {
      await archiveOutput(relative);
    } else if (node.type === "file" && node.link) {
      const url = new URL(node.link, "https://vercel.com");
      url.searchParams.set("teamId", team);
      const destination = safeDestination(
        path.join(archive, "output"),
        relative.slice(4),
      );
      const result = await download(url, destination, true);
      records.push({
        path: relative.slice(4),
        type: node.type,
        bytes: result.content.length,
      });
    } else if (node.type === "lambda" || node.type === "middleware") {
      records.push({
        path: relative.slice(4),
        type: node.type,
        downloaded: false,
      });
    }
  }
}

const routes = new Set(["/"]);
const visited = new Set();
const assets = new Set();
const pageRecords = [];
while ([...routes].some((route) => !visited.has(route))) {
  const route = [...routes].find((candidate) => !visited.has(candidate));
  visited.add(route);
  try {
    const destination = safeDestination(
      path.join(archive, "pages"),
      route === "/" ? "index.html" : route.slice(1) + ".html",
    );
    const result = await download(origin + route, destination);
    const html = result.content.toString("utf8");
    if (!result.type?.includes("text/html")) continue;
    for (const match of html.matchAll(/(href|src|srcset)="([^"]+)"/g)) {
      const values =
        match[1] === "srcset"
          ? match[2].split(/,\s*/).map((value) => value.split(/\s+/)[0])
          : [match[2]];
      for (const value of values) {
        const decoded = value.replaceAll("&amp;", "&");
        let url;
        try {
          url = new URL(decoded, origin);
        } catch {
          continue;
        }
        if (!["http:", "https:"].includes(url.protocol)) continue;
        if (
          url.hostname === "www.reino12.com" ||
          url.hostname === "reino12.com"
        ) {
          if (
            url.pathname.startsWith("/_next/") ||
            /\.[a-z0-9]{2,6}$/i.test(url.pathname)
          )
            assets.add(url.href);
          else if (!url.pathname.startsWith("/api/"))
            routes.add(url.pathname.replace(/\/$/, "") || "/");
        } else if (
          /\.(?:png|jpe?g|webp|svg|gif|woff2?)(?:$|\?)/i.test(url.href)
        )
          assets.add(url.href);
      }
    }
    pageRecords.push({
      route,
      bytes: result.content.length,
      title: html.match(/<title>(.*?)<\/title>/s)?.[1],
    });
  } catch (error) {
    pageRecords.push({ route, error: error.message });
  }
}

console.log(
  `Production crawl: ${visited.size} routes, ${assets.size} asset URLs`,
);
await archiveOutput();
await fs.mkdir(archive, { recursive: true });
await fs.writeFile(
  path.join(archive, "manifest.json"),
  JSON.stringify(
    {
      deployment,
      origin,
      output: records,
      pages: pageRecords,
      assets: [...assets],
    },
    null,
    2,
  ),
);
console.log(
  `Archived ${records.filter((record) => record.type === "file").length} output files. Function code is unavailable.`,
);

const remoteAssets = [];
for (const url of assets) {
  const parsed = new URL(url);
  if (
    parsed.hostname === "www.reino12.com" ||
    parsed.hostname === "reino12.com"
  ) {
    const filename =
      parsed.pathname.slice(1) +
      (parsed.search
        ? "-" + Buffer.from(parsed.search).toString("base64url")
        : "");
    try {
      await download(
        url,
        safeDestination(path.join(archive, "site-assets"), filename),
      );
    } catch (error) {
      remoteAssets.push({ url, error: error.message });
    }
  } else remoteAssets.push({ url });
}
await fs.writeFile(
  path.join(archive, "remote-assets.json"),
  JSON.stringify(remoteAssets, null, 2),
);
console.log(`Recovery archive: ${archive}`);
