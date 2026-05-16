import { useLocation } from "wouter";

interface Props {
  id: string;
  title: string;
  poster: string;
  type?: string;
  subCount?: number;
  dubCount?: number;
}

export default function AnimeCard({ id, title, poster, type, subCount, dubCount }: Props) {
  const [, navigate] = useLocation();

  return (
    <button
      onClick={() => navigate(`/anime/${id}`)}
      className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 text-left"
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden bg-muted">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
            🎬
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Type badge */}
        {type && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-primary/90 text-white text-xs font-semibold">
            {type}
          </span>
        )}
        {/* Episode counts */}
        {(subCount || dubCount) ? (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {subCount ? (
              <span className="px-1.5 py-0.5 rounded bg-black/70 text-emerald-400 text-xs font-medium">
                SUB {subCount}
              </span>
            ) : null}
            {dubCount ? (
              <span className="px-1.5 py-0.5 rounded bg-black/70 text-blue-400 text-xs font-medium">
                DUB {dubCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {/* Title */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
          {title}
        </p>
      </div>
    </button>
  );
}
