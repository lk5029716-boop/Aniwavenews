import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Play, Loader2, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import { apiUrl } from "@/config";

interface AnimeDetails {
  id: string;
  title: string;
  poster: string;
  description: string;
  type: string;
  status: string;
  aired: string;
  genres: string[];
  episodes: { sub: number; dub: number; total: number };
}

interface Episode {
  number: number;
  id: string;
  title: string | null;
  isFiller: boolean;
}

export default function AnimePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const [details, setDetails] = useState<AnimeDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(apiUrl(`/api/details?id=${encodeURIComponent(id)}`)).then((r) => r.json()),
      fetch(apiUrl(`/api/episodes?id=${encodeURIComponent(id)}`)).then((r) => r.json()),
    ])
      .then(([det, eps]) => {
        setDetails(det as AnimeDetails);
        setEpisodes((eps as { episodes: Episode[] }).episodes ?? []);
      })
      .catch(() => setError("Failed to load anime details."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1 as never)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {details && !loading && (
          <>
            {/* Details header */}
            <div className="flex flex-col md:flex-row gap-8 mb-10">
              <div className="shrink-0">
                <img
                  src={details.poster}
                  alt={details.title}
                  className="w-48 md:w-56 rounded-xl shadow-2xl shadow-black/50 border border-border"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  {details.type && (
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                      {details.type}
                    </span>
                  )}
                  {details.status && (
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">
                      {details.status}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  {details.title}
                </h1>
                {details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {details.genres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded-full border border-border text-muted-foreground text-xs">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
                {details.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-4">
                    {details.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {details.episodes.sub > 0 && (
                    <span className="text-emerald-400 font-medium">SUB {details.episodes.sub} eps</span>
                  )}
                  {details.episodes.dub > 0 && (
                    <span className="text-blue-400 font-medium">DUB {details.episodes.dub} eps</span>
                  )}
                  {details.aired && details.aired !== "Unknown" && (
                    <span>Aired: {details.aired}</span>
                  )}
                </div>

                {episodes.length > 0 && (
                  <button
                    onClick={() => navigate(`/watch/${id}?ep=1`)}
                    className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Watch Episode 1
                  </button>
                )}
              </div>
            </div>

            {/* Episode list */}
            {episodes.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Episodes ({episodes.length})
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                  {episodes.map((ep) => (
                    <button
                      key={ep.number}
                      onClick={() => navigate(`/watch/${id}?ep=${ep.number}`)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200
                        ${ep.isFiller
                          ? "bg-yellow-900/20 border-yellow-700/30 text-yellow-400 hover:bg-yellow-900/40"
                          : "bg-card border-border text-foreground hover:border-primary hover:bg-accent/20 hover:text-primary"
                        }
                      `}
                      title={ep.title ?? `Episode ${ep.number}`}
                    >
                      {ep.number}
                    </button>
                  ))}
                </div>
                {episodes.some((e) => e.isFiller) && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                    Yellow = filler episode
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
