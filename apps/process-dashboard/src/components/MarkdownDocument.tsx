import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownDocument({ content }: { content: string }) {
  return (
    <article className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
