import { ExternalLink } from "lucide-react";

interface Source {
  title: string;
  url: string;
}

interface CitationTooltipProps {
  source: Source;
  index: number;
}

export const CitationTooltip = ({ source, index }: CitationTooltipProps) => {
  const displayTitle = source.title || "Source";
  const displayUrl = source.url || "#";
  
  return (
    <a
      href={displayUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-xs font-body text-primary border-b border-border hover:border-primary transition-colors py-1"
    >
      {displayTitle}
      <ExternalLink className="inline h-3 w-3 ml-1" />
    </a>
  );
};