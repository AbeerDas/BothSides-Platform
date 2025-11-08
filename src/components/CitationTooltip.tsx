import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            [{index}]
            <ExternalLink className="h-3 w-3" />
          </a>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium text-sm">{source.title}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{source.url}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};