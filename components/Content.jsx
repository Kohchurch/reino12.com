import { safeHref, media } from "../lib/strapi.mjs";
export function RichText({ value }) {
  if (typeof value === "string") return <p>{value}</p>;
  function node(n, i) {
    const children = n.children?.map(node);
    if (n.type === "text") {
      let text = n.text;
      if (n.bold) text = <strong>{text}</strong>;
      if (n.italic) text = <em>{text}</em>;
      if (n.underline) text = <u>{text}</u>;
      if (n.strikethrough) text = <s>{text}</s>;
      if (n.code) text = <code>{text}</code>;
      return <span key={i}>{text}</span>;
    }
    const tags = {
      paragraph: "p",
      quote: "blockquote",
      code: "pre",
      "list-item": "li",
    };
    if (n.type === "link")
      return (
        <a key={i} href={safeHref(n.url)}>
          {children}
        </a>
      );
    if (n.type === "image")
      return (
        <img
          key={i}
          src={safeHref(media(n.image)?.url)}
          alt={n.image?.alternativeText || ""}
        />
      );
    const Tag =
      n.type === "heading"
        ? `h${Math.min(6, Math.max(1, n.level || 2))}`
        : n.type === "list"
          ? n.format === "ordered"
            ? "ol"
            : "ul"
          : tags[n.type] || "div";
    return <Tag key={i}>{children}</Tag>;
  }
  return <div className="rich-text">{value?.map(node)}</div>;
}
export function Actions({ value }) {
  return (
    <div className="actions">
      {(Array.isArray(value) ? value : value ? [value] : []).map((cta, i) => (
        <a
          key={cta.id || i}
          className={`button ${cta.Color || "gold"} ${cta.Style || "solid"}`}
          href={safeHref(cta.URL)}
        >
          {cta.Text}
        </a>
      ))}
    </div>
  );
}
export function Picture({ desktop, mobile, className = "" }) {
  const image = media(desktop) || media(mobile);
  const small = media(mobile);
  return image ? (
    <picture className={className}>
      {small && <source media="(max-width: 767px)" srcSet={small.url} />}
      <img
        src={image.url}
        alt={image.alternativeText || ""}
        width={image.width}
        height={image.height}
      />
    </picture>
  ) : null;
}
