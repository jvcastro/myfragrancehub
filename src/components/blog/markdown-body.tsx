import ReactMarkdown from "react-markdown";

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="font-display mt-12 text-2xl tracking-[-0.02em] text-foreground first:mt-0">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="mt-4 text-[1.05rem] leading-[1.75] text-muted-foreground">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">
              {children}
            </ul>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
