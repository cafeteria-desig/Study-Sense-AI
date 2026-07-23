import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content) return null;

  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const lang = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return (
            <pre key={index} className="p-4 bg-muted border border-foreground/10 font-mono text-xs overflow-x-auto rounded-none my-4">
              {lang && <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mb-2 border-b border-foreground/5 pb-1">{lang}</div>}
              <code>{code}</code>
            </pre>
          );
        } else {
          const lines = part.split('\n');
          return lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={`${index}-${lineIdx}`} className="text-sm font-mono text-foreground uppercase tracking-wider mt-6 mb-2">
                  {parseInline(trimmed.replace('### ', ''))}
                </h4>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={`${index}-${lineIdx}`} className="text-lg font-display text-foreground mt-8 mb-3">
                  {parseInline(trimmed.replace('## ', ''))}
                </h3>
              );
            }
            if (trimmed.startsWith('# ')) {
              return (
                <h2 key={`${index}-${lineIdx}`} className="text-2xl font-display text-foreground mt-4 mb-4 border-b border-foreground/10 pb-2">
                  {parseInline(trimmed.replace('# ', ''))}
                </h2>
              );
            }
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
              return (
                <li key={`${index}-${lineIdx}`} className="ml-5 list-disc text-sm text-muted-foreground my-1.5 leading-relaxed">
                  {parseInline(trimmed.replace(/^[\*\-]\s+/, ''))}
                </li>
              );
            }
            if (/^\d+\.\s+/.test(trimmed)) {
              return (
                <li key={`${index}-${lineIdx}`} className="ml-5 list-decimal text-sm text-muted-foreground my-1.5 leading-relaxed">
                  {parseInline(trimmed.replace(/^\d+\.\s+/, ''))}
                </li>
              );
            }
            if (trimmed === '') {
              return <div key={`${index}-${lineIdx}`} className="h-2" />;
            }
            return (
              <p key={`${index}-${lineIdx}`} className="text-sm my-3 text-muted-foreground leading-relaxed">
                {parseInline(line)}
              </p>
            );
          });
        }
      })}
    </div>
  );
}

function parseInline(text: string): React.ReactNode[] {
  // Matches bold (**text**), italics (*text*), or inline code (`code`)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="text-foreground/90 italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-muted/80 text-foreground font-mono text-xs border border-foreground/5 rounded-none">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
