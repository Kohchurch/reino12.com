import { notFound } from "next/navigation";
import { getPosts } from "../../../lib/strapi.mjs";
import { Picture, RichText } from "../../../components/Content";
export const revalidate = 60;
export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.attributes.Slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = (await getPosts()).find(
    (p) => p.attributes.Slug === slug,
  )?.attributes;
  return {
    title: p?.SEO?.MetaTitle || p?.Title,
    description: p?.SEO?.MetaDescription,
  };
}
export default async function Article({ params }) {
  const { slug } = await params;
  const p = (await getPosts()).find(
    (p) => p.attributes.Slug === slug,
  )?.attributes;
  if (!p) notFound();
  return (
    <article className="section prose">
      <a href="/articulos">← Artículos</a>
      <h1 className="cocogoose">{p.Title}</h1>
      <Picture desktop={p.FeaturedImage} />
      <RichText value={p.Content} />
    </article>
  );
}
