import { useState } from "react";
import { useLocation } from "wouter";
import { Search, TrendingUp, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";

const POPULAR = [
  { id: "one-piece-100", title: "One Piece", q: "one piece" },
  { id: "bleach-50", title: "Bleach: TYBW", q: "bleach thousand year blood war" },
  { id: "naruto-76396", title: "Naruto", q: "naruto" },
  { id: "demon-slayer", title: "Demon Slayer", q: "demon slayer kimetsu no yaiba" },
  { id: "jujutsu-kaisen", title: "Jujutsu Kaisen", q: "jujutsu kaisen" },
  { id: "attack-on-titan", title: "Attack on Titan", q: "shingeki no kyojin" },
  { id: "chainsaw-man-001", title: "Chainsaw Man", q: "chainsaw man" },
  { id: "vinland-saga", title: "Vinland Saga", q: "vinland saga" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-4 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Free anime streaming
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Watch Anime<br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              Without Limits
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
            Stream thousands of anime series in HD — Sub &amp; Dub — across multiple servers.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for any anime…"
                className="w-full h-12 bg-card border border-border rounded-xl pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-6 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular searches */}
      <section className="max-w-screen-xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Popular Right Now</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(`/search?q=${encodeURIComponent(a.q)}`)}
              className="p-4 bg-card border border-border rounded-xl text-left hover:border-primary/50 hover:bg-accent/20 transition-all duration-200 group"
            >
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {a.title}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
