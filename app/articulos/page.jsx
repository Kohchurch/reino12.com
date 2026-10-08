import { getPosts } from "../../lib/strapi.mjs";
import { Picture } from "../../components/Content";
export const revalidate = 60;
export const metadata = { title: "Artículos | Reino de los Cielos" };
export default async function Articles({ searchParams }) {
  const query = await searchParams;
  const posts = await getPosts();
  const page = Math.min(
    Math.ceil(posts.length / 12),
    Math.max(1, Number(query.page) || 1),
  );
  return (
    <section className="section">
      <h1 className="cocogoose">Artículos</h1>
      <div className="articles-grid">
        {posts
          .slice((page - 1) * 12, page * 12)
          .map(({ id, attributes: p }) => (
            <article key={id}>
              <a href={`/articulos/${encodeURIComponent(p.Slug)}`}>
                <Picture desktop={p.FeaturedImage} />
                <h2 className="cocogoose">{p.Title}</h2>
              </a>
            </article>
          ))}
      </div>
      <nav className="pagination" aria-label="Páginas de artículos">
        {Array.from({ length: Math.ceil(posts.length / 12) }, (_, i) => (
          <a
            key={i}
            href={`/articulos?page=${i + 1}`}
            aria-current={page === i + 1 ? "page" : undefined}
          >
            {i + 1}
          </a>
        ))}
      </nav>
    </section>
  );
}
