import DOMPurify from "dompurify";

export function sanitizeHTML(dirty: string): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code",
      "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "td", "th",
      "div", "span", "hr", "sub", "sup", "del", "ins",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "width", "height", "target"],
    ALLOW_DATA_ATTR: false,
  });
}
