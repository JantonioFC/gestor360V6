import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const components = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold text-white mb-6 mt-8 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold text-white mb-4 mt-8">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold text-white mb-3 mt-6">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold text-white mb-2 mt-4">{children}</h4>
    ),
    p: ({ children }: any) => (
      <p className="text-[var(--text-primary)] mb-4 leading-relaxed">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-[var(--text-primary)]">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-[var(--text-primary)]">{children}</ol>
    ),
    li: ({ children }: any) => {
      // Handle checkbox items
      if (typeof children === 'string' && children.includes('[ ]')) {
        return (
          <li className="flex items-center mb-2">
            <input 
              type="checkbox" 
              readOnly
              className="mr-3 w-4 h-4 text-[var(--accent-blue)] bg-[var(--dark-tertiary)] border-[var(--border-dark)] rounded focus:ring-[var(--accent-blue)] focus:ring-2" 
            />
            <span>{children.replace('[ ]', '').trim()}</span>
          </li>
        );
      } else if (typeof children === 'string' && children.includes('[x]')) {
        return (
          <li className="flex items-center mb-2">
            <input 
              type="checkbox" 
              checked 
              readOnly
              className="mr-3 w-4 h-4 text-[var(--accent-blue)] bg-[var(--accent-blue)] border-[var(--accent-blue)] rounded focus:ring-[var(--accent-blue)] focus:ring-2" 
            />
            <span className="line-through text-[var(--text-secondary)]">
              {children.replace('[x]', '').trim()}
            </span>
          </li>
        );
      }
      return <li className="mb-1">{children}</li>;
    },
    code: ({ children, className }: any) => {
      if (className?.includes('language-')) {
        return (
          <pre className="bg-[var(--dark-tertiary)] border border-[var(--border-dark)] rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-[var(--accent-blue)] font-mono text-sm">
              {children}
            </code>
          </pre>
        );
      }
      return (
        <code className="bg-[var(--dark-tertiary)] text-[var(--accent-blue)] px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-[var(--accent-blue)] bg-[var(--dark-secondary)] p-4 mb-4 italic">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border-collapse border border-[var(--border-dark)]">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-[var(--border-dark)] bg-[var(--dark-secondary)] px-4 py-2 text-left font-semibold text-white">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-[var(--border-dark)] px-4 py-2 text-[var(--text-primary)]">
        {children}
      </td>
    ),
    a: ({ children, href }: any) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[var(--accent-blue)] hover:underline"
      >
        {children}
      </a>
    ),
    hr: () => (
      <hr className="border-[var(--border-dark)] my-8" />
    ),
  };

  return (
    <div className="bg-[var(--dark-secondary)]/50 h-full">
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown components={components}>
              {content || '# Vista previa\n\nEscribe algo en el editor para ver la vista previa aquí.'}
            </ReactMarkdown>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
