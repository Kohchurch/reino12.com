import { getVideos } from "../lib/youtube.mjs";
export default async function Videos() {
  const videos = await getVideos();
  return (
    <div className="videos-grid">
      {videos.map((video) => (
        <article key={video.id}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}`}
            title={video.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <h3>{video.title}</h3>
          <a href={`https://www.youtube.com/watch?v=${video.id}`}>
            Ver en YouTube ↗
          </a>
        </article>
      ))}
    </div>
  );
}
