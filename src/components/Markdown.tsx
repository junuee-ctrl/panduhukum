import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Merender potongan markdown (isi STEP, FAQ, dsb.) dengan gaya .prose-article.
 * Tautan eksternal dibuka aman (noopener).
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
