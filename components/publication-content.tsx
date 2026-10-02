import type { ReactNode } from "react";

export function PublicationContent({ body, className = "" }: { body: string; className?: string }) {
  const blocks = body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return <div className={`publication-content ${className}`.trim()}>{blocks.map((block, index) => renderBlock(block, index))}</div>;
}

function renderBlock(block: string, index: number) {
  const image = block.match(/^!\[([^\]]*)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
  if (image) return <figure key={index}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={image[2]} alt={image[1]} />{image[1] && <figcaption>{image[1]}</figcaption>}</figure>;

  if (block.startsWith("### ")) return <h3 key={index}>{renderInline(block.slice(4))}</h3>;
  if (block.startsWith("## ")) return <h2 key={index}>{renderInline(block.slice(3))}</h2>;
  if (block.startsWith("> ")) return <blockquote key={index}>{renderInline(block.slice(2))}</blockquote>;

  const lines = block.split("\n");
  if (lines.every((line) => line.startsWith("- "))) {
    return <ul key={index}>{lines.map((line, itemIndex) => <li key={itemIndex}>{renderInline(line.slice(2))}</li>)}</ul>;
  }

  return <p key={index}>{lines.map((line, lineIndex) => <span key={lineIndex}>{renderInline(line)}{lineIndex < lines.length - 1 && <br />}</span>)}</p>;
}

function renderInline(value: string): ReactNode[] {
  const tokens = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((?:https?:\/\/|\/)[^)]+\))/g).filter(Boolean);
  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={index}>{token.slice(2, -2)}</strong>;
    if (token.startsWith("*") && token.endsWith("*")) return <em key={index}>{token.slice(1, -1)}</em>;
    const link = token.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)$/);
    if (link) return <a href={link[2]} key={index}>{link[1]}</a>;
    return token;
  });
}
