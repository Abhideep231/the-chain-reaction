import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

/** React escapes document/model text; raw HTML is never enabled. */
export function AnswerMarkdown({ text }: { text: string }) {
  return (
    <div className="min-w-0 text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          table: ({ children }) => (
            <div className="my-3 max-w-full overflow-x-auto rounded-md border" tabIndex={0} role="region" aria-label="Answer table">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b bg-muted px-3 py-2 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b px-3 py-2 align-top">{children}</td>,
          p: ({ children }) => <p className="my-2">{children}</p>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
          a: ({ children, href }) => <a href={href} className="underline" rel="noopener noreferrer">{children}</a>,
        }}
      >{text}</ReactMarkdown>
    </div>
  )
}
