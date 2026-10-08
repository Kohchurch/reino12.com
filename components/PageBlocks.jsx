import { RichText, Actions, Picture } from "./Content";
import { ContactForm, Testimonials, Newsletter } from "./Interactive";
import { media } from "../lib/strapi.mjs";
import Videos from "./Videos";
export function PageBlocks({ blocks = [] }) {
  return blocks.map((block) => (
    <Block key={`${block.__component}-${block.id}`} b={block} />
  ));
}
function Heading({ b }) {
  return (
    <>
      {b.Tag && <p className="tag">{b.Tag}</p>}
      <h2 className="cocogoose">{b.Headline || b.Title}</h2>
    </>
  );
}
function Block({ b }) {
  switch (b.__component) {
    case "blocks.hero-section":
      return (
        <section className="hero">
          <Picture desktop={b.DesktopImage} mobile={b.MobileImage} />
          <div className="hero-copy">
            <h1 className="cocogoose">{b.Headline}</h1>
            <p>{b.Subhead}</p>
            <Actions value={b.CTA} />
          </div>
        </section>
      );
    case "blocks.header":
      return (
        <section className={`page-heading ${b.DarkBackground ? "dark" : ""}`}>
          <Picture desktop={b.DesktopImage} mobile={b.MobileImage} />
          <div>
            <h1 className="cocogoose">{b.Title}</h1>
            <p>{b.Description}</p>
          </div>
        </section>
      );
    case "blocks.content-main":
      return (
        <section className="section prose">
          <RichText value={b.ContentMain} />
        </section>
      );
    case "blocks.text-with-image":
      return (
        <section className="section text-image">
          <div>
            <Heading b={b} />
            <RichText value={b.Content} />
            <Actions value={b.CTA} />
          </div>
          <Picture desktop={b.Image} />
        </section>
      );
    case "blocks.join-us-testimonials":
      return (
        <div className="testimonials-section">
          <section className="section center">
            <Heading b={b} />
            <RichText value={b.Content} />
            <Actions value={b.CTA} />
            <Testimonials items={b.Testimonials} />
          </section>
        </div>
      );
    case "blocks.youtube-callout":
      return (
        <section className="section youtube-callout">
          <Heading b={b} />
          <Videos />
          <Actions value={b.CTA} />
        </section>
      );
    case "blocks.masonry-gallery":
      return (
        <section className="section">
          <div className="center">
            <Heading b={b} />
            <p>{b.Subheader}</p>
          </div>
          <div className="masonry">
            {b.Images?.data?.map((image) => {
              const m = media(image);
              return (
                m && (
                  <img
                    key={image.id}
                    src={m.url}
                    alt={m.alternativeText || ""}
                    loading="lazy"
                    width={m.width}
                    height={m.height}
                  />
                )
              );
            })}
          </div>
        </section>
      );
    case "blocks.subscribe-callout":
      return (
        <section className="section subscribe center">
          <Heading b={b} />
          <p>{b.Description}</p>
          <Newsletter url={process.env.NEXT_PUBLIC_MAILCHIMP_URL} />
        </section>
      );
    case "blocks.text-image-callout":
      return (
        <section className="section text-image callout">
          <div>
            <Heading b={b} />
            <p>{b.Subtext}</p>
            <Actions value={b.CTA} />
          </div>
          <Picture desktop={b.Image} />
        </section>
      );
    case "blocks.contact-callout":
      return (
        <section className="section center contact">
          <Heading b={b} />
          <p>{b.Description}</p>
          <ContactForm />
        </section>
      );
    case "blocks.centered-content-with-text-columns":
      return (
        <section className="section">
          <div className="center">
            <p className="tag">{b.CenteredContent?.Tag}</p>
            <h2 className="cocogoose">{b.CenteredContent?.Title}</h2>
            <RichText value={b.CenteredContent?.Description} />
          </div>
          <div className="columns">
            {b.ContentColumn?.map((c) => (
              <div key={c.id}>
                <h3 className="cocogoose">{c.Title}</h3>
                <RichText value={c.Description} />
              </div>
            ))}
          </div>
          <Actions value={b.CTA} />
        </section>
      );
    case "blocks.fa-qs":
      return (
        <section className="section faq">
          <Heading b={b} />
          <p>{b.Description}</p>
          {b.FAQ?.map((f) => (
            <details key={f.id}>
              <summary>{f.Question}</summary>
              <RichText value={f.Answer} />
            </details>
          ))}
        </section>
      );
    case "blocks.all-text-features":
      return (
        <section className="section">
          <div className="center">
            <Heading b={b} />
          </div>
          <div className="columns">
            {b.Feature?.map((f) => (
              <div key={f.id}>
                <h3 className="cocogoose">{f.Title}</h3>
                <RichText value={f.Description} />
              </div>
            ))}
          </div>
          <Actions value={b.CTA} />
        </section>
      );
    default:
      console.error(`Unsupported CMS block: ${b.__component}`);
      return null;
  }
}
