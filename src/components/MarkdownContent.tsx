import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const formattedContent = useMemo(() => {
    if (!content) return null;

    // Process markdown-like syntax
    const processText = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Bold: **text** or *text*
        const boldMatch = remaining.match(/\*\*(.+?)\*\*|\*(.+?)\*/);
        
        if (boldMatch && boldMatch.index !== undefined) {
          // Add text before the match
          if (boldMatch.index > 0) {
            parts.push(remaining.slice(0, boldMatch.index));
          }
          // Add the bold text
          parts.push(
            <strong key={key++} className="font-semibold">
              {boldMatch[1] || boldMatch[2]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        } else {
          // No more matches, add remaining text
          parts.push(remaining);
          break;
        }
      }

      return parts;
    };

    // Split by newlines and process each line
    const lines = content.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check for bullet points
      const bulletMatch = line.match(/^(\s*)[•\-\*]\s+(.+)/);
      if (bulletMatch) {
        const indent = bulletMatch[1].length;
        return (
          <div 
            key={lineIndex} 
            className="flex gap-2"
            style={{ paddingLeft: `${indent * 0.5}rem` }}
          >
            <span className="text-muted-foreground">•</span>
            <span>{processText(bulletMatch[2])}</span>
          </div>
        );
      }

      // Check for numbered list
      const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        const indent = numberedMatch[1].length;
        return (
          <div 
            key={lineIndex} 
            className="flex gap-2"
            style={{ paddingLeft: `${indent * 0.5}rem` }}
          >
            <span className="text-muted-foreground font-medium">{numberedMatch[2]}.</span>
            <span>{processText(numberedMatch[3])}</span>
          </div>
        );
      }

      // Check for headers
      const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const HeaderTag = `h${level + 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeaderTag 
            key={lineIndex} 
            className={cn(
              "font-semibold mt-2",
              level === 1 && "text-base",
              level === 2 && "text-sm",
              level === 3 && "text-sm text-muted-foreground"
            )}
          >
            {processText(headerMatch[2])}
          </HeaderTag>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <div key={lineIndex} className="h-2" />;
      }

      // Regular text
      return (
        <div key={lineIndex}>
          {processText(line)}
        </div>
      );
    });
  }, [content]);

  return (
    <div className={cn("font-body space-y-0.5", className)}>
      {formattedContent}
    </div>
  );
}