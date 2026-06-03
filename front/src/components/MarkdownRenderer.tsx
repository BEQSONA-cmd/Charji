"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            
            if (match) {
              return (
                <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                  <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/5">
                    <span className="text-[10px] text-purple-400/60 uppercase tracking-wider">{match[1]}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(codeContent)}
                      className="text-[10px] text-white/40 hover:text-purple-400 transition-colors uppercase tracking-wider"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className={`${className} text-sm text-white/70`} {...props}>{children}</code>
                  </pre>
                </div>
              );
            }

            return (
              <code className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-sm border border-purple-500/20" {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1 className="text-xl font-light text-white/90 mb-4 tracking-wide">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-light text-white/80 mb-3 tracking-wide">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-light text-white/70 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-white/60 leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-none space-y-2 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-none space-y-2 mb-3">{children}</ol>,
          li: ({ children }) => (
            <li className="text-sm text-white/60 flex items-start gap-2">
              <span className="text-purple-400 mt-1">›</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => <strong className="font-medium text-white/80">{children}</strong>,
          em: ({ children }) => <em className="text-white/50">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-purple-500/30 pl-4 my-3 italic text-white/40">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors underline decoration-purple-500/30">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
