import "server-only";
import { absoluteUrl } from "./site-url";

export function renderNewsletterEmail({ subject, body, name, unsubscribeToken }: { subject: string; body: string; name: string; unsubscribeToken: string }) {
  const unsubscribeUrl = absoluteUrl(`/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`);
  const content = renderMarkdown(body);
  const safeSubject = escapeHtml(subject);
  const safeName = escapeHtml(name);

  return {
    unsubscribeUrl,
    text: `Hello ${name},\n\n${plainText(body)}\n\nUnsubscribe and request removal of your subscriber data: ${unsubscribeUrl}`,
    html: `<!doctype html><html><body style="margin:0;background:#eef4f3;color:#05445e;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${safeSubject}</div><div style="max-width:680px;margin:0 auto;padding:30px 16px"><div style="background:#05445e;padding:24px 30px;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.5px">Terratora</div><main style="background:#fff;padding:38px 30px"><p style="margin:0 0 24px;font-size:14px;line-height:1.7">Hello ${safeName},</p><h1 style="margin:0 0 30px;font-size:34px;line-height:1.08;letter-spacing:-1px">${safeSubject}</h1>${content}</main><footer style="padding:24px 30px;background:#d4f1f4;font-size:11px;line-height:1.65;color:#315d6c"><p style="margin:0 0 8px">You received this email because you subscribed to Terratora publications and updates.</p><p style="margin:0"><a href="${escapeAttribute(unsubscribeUrl)}" style="color:#05445e;text-decoration:underline">Unsubscribe and request deletion of your subscriber data</a></p></footer></div></body></html>`,
  };
}

function renderMarkdown(body: string) {
  return body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).map(renderBlock).join("");
}

function renderBlock(block: string) {
  const image = block.match(/^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
  if (image) {
    const url = image[2].startsWith("/") ? absoluteUrl(image[2]) : image[2];
    return `<figure style="margin:32px 0"><img src="${escapeAttribute(url)}" alt="${escapeAttribute(image[1])}" style="display:block;width:100%;height:auto">${image[1] ? `<figcaption style="margin-top:8px;font-size:11px;color:#64808a">${escapeHtml(image[1])}</figcaption>` : ""}</figure>`;
  }
  if (block.startsWith("### ")) return `<h3 style="margin:32px 0 12px;font-size:21px;line-height:1.2">${renderInline(block.slice(4))}</h3>`;
  if (block.startsWith("## ")) return `<h2 style="margin:38px 0 14px;font-size:27px;line-height:1.15">${renderInline(block.slice(3))}</h2>`;
  if (block.startsWith("> ")) return `<blockquote style="margin:30px 0;padding:4px 0 4px 20px;border-left:3px solid #189ab4;font-size:20px;line-height:1.5">${renderInline(block.slice(2))}</blockquote>`;
  const lines = block.split("\n");
  if (lines.every((line) => line.startsWith("- "))) return `<ul style="margin:18px 0 28px;padding-left:22px">${lines.map((line) => `<li style="margin:9px 0;line-height:1.7">${renderInline(line.slice(2))}</li>`).join("")}</ul>`;
  return `<p style="margin:0 0 22px;font-size:15px;line-height:1.75">${lines.map(renderInline).join("<br>")}</p>`;
}

function renderInline(value: string) {
  const tokens = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\))/g).filter(Boolean);
  return tokens.map((token) => {
    if (token.startsWith("**") && token.endsWith("**")) return `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
    if (token.startsWith("*") && token.endsWith("*")) return `<em>${escapeHtml(token.slice(1, -1))}</em>`;
    const link = token.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
    if (link) {
      const url = link[2].startsWith("/") ? absoluteUrl(link[2]) : link[2];
      return `<a href="${escapeAttribute(url)}" style="color:#087e98;text-decoration:underline">${escapeHtml(link[1])}</a>`;
    }
    return escapeHtml(token);
  }).join("");
}

function plainText(value: string) {
  return value
    .replace(/^#{2,3}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^!\[([^\]]*)\]\([^)]+\)$/gm, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
