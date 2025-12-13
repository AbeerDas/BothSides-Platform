import { useState } from "react";
import { ExternalLink, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface NewsCardProps {
  title: string;
  description?: string;
  sourceName?: string;
  publishedAt?: string;
  imageUrl?: string;
  url: string;
  onGenerateDebate: () => void;
}

export const NewsCard = ({
  title,
  description,
  sourceName,
  publishedAt,
  imageUrl,
  url,
  onGenerateDebate
}: NewsCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedDate = publishedAt 
    ? format(new Date(publishedAt), "MMM d, yyyy")
    : null;

  return (
    <article
      className={cn(
        "group relative border border-border/60 bg-card overflow-hidden transition-all duration-300",
        "hover:border-greek-gold/40 hover:shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovered && "scale-105"
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="font-serif text-4xl text-muted-foreground/30">§</span>
          </div>
        )}
        
        {/* Source badge */}
        {sourceName && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
            {sourceName}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-serif text-base leading-snug line-clamp-2 text-foreground group-hover:text-greek-gold transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          {formattedDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </div>
          )}

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Debate overlay on hover */}
      <div className={cn(
        "absolute inset-0 bg-background/95 flex flex-col items-center justify-center transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <button
          onClick={onGenerateDebate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white font-sans text-sm uppercase tracking-wider transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Generate Debate
        </button>
        <p className="mt-3 text-xs text-muted-foreground max-w-[200px] text-center">
          Transform this story into a balanced debate
        </p>
      </div>
    </article>
  );
};
