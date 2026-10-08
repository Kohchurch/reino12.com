import { getPages } from "../lib/strapi.mjs";
import { PageBlocks } from "../components/PageBlocks";
export const revalidate = 60;
export async function generateMetadata() {
  const page = (await getPages()).find(
    (p) => p.attributes.Slug === "reino-de-los-cielos-iglesia-",
  )?.attributes;
  return {
    title: page?.SEO?.MetaTitle || "Reino de los Cielos",
    description: page?.SEO?.MetaDescription,
  };
}
export default async function Home() {
  const pages = await getPages();
  const page = pages.find(
    (p) => p.attributes.Slug === "reino-de-los-cielos-iglesia-",
  );
  return <PageBlocks blocks={page?.attributes.Page} />;
}
