const fallback = [
  { id: "UbCToYh6Wu4", title: "Guerra de dioses pt2." },
  { id: "m-khd7dylMM", title: "Guerra de dioses" },
  { id: "Vi9uwuk0jNI", title: "Obstaculos de la Multiplicación." },
];
export function parseVideos(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .flatMap((match) => {
      const id = match[1].match(
        /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/,
      )?.[1];
      const rawTitle =
        match[1].match(/<title>([\s\S]*?)<\/title>/)?.[1] || "Grabación";
      const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
      const title = rawTitle.replace(
        /&(amp|lt|gt|quot|apos);/g,
        (_, name) => entities[name],
      );
      return id ? [{ id, title }] : [];
    })
    .slice(0, 3);
}
export async function getVideos() {
  try {
    const response = await fetch(
      "https://www.youtube.com/feeds/videos.xml?channel_id=UC00GfS7NWOjx1jPm7QkQIVg",
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) },
    );
    if (!response.ok) throw new Error("Video feed unavailable");
    const videos = parseVideos(await response.text());
    return videos.length ? videos : fallback;
  } catch {
    return fallback;
  }
}
