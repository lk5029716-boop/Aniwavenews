import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Search, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import AnimeCard from "@/components/anime/AnimeCard";
import AnimeCardSkeleton from "@/components/anime/AnimeCardSkeleton";

interface SearchResult {
  id: string;
  title: string;
  poster: string;
  type: string;
  episodes: { sub: number; dub: number };
}

export default function SearchPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const q = params.get("q") ?? "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError(null);
    setResults([]);

    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data: { results: SearchResult[] }) => {
        setResults(data.results ?? []);
      })
      .catch(() => setError("Search failed. Please try again."))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">
            {q ? (
              <>Results for <span className="text-primary">"{q}"</span></>
            ) : (
              "Search Anime"
            )}
          </h1>
          {loading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((r) => (
              <AnimeCard
                key={r.id}
                id={r.id}
                title={r.title}
                poster={r.poster}
                type={r.type}
                subCount={r.episodes.sub}
                dubCount={r.episodes.dub}
              />
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && q && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-muted-foreground">No results found for "{q}"</p>
            <p className="text-muted-foreground text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </main>
    </div>
  );
}
