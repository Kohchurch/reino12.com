import { notFound } from "next/navigation";
import { getPages } from "../../lib/strapi.mjs";
import { PageBlocks } from "../../components/PageBlocks";
export const revalidate = 60;
export async function generateStaticParams() {
  return (await getPages())
    .filter((p) => p.attributes.Slug !== "reino-de-los-cielos-iglesia-")
    .map((p) => ({ slug: p.attributes.Slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = (await getPages()).find(
    (p) => p.attributes.Slug === slug,
  )?.attributes;
  return {
    title: page?.SEO?.MetaTitle || page?.Title,
    description: page?.SEO?.MetaDescription,
  };
}
export default async function Page({ params }) {
  const { slug } = await params;
  const page = (await getPages()).find((p) => p.attributes.Slug === slug);
  if (!page) notFound();
  return <PageBlocks blocks={page.attributes.Page} />;
}
