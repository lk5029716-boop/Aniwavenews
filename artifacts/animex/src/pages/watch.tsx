import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Header from "@/components/layout/Header";
import HlsPlayer from "@/components/player/HlsPlayer";

interface Server {
  id: string;
  name: string;
  type: "sub" | "dub" | "raw";
}

interface StreamSource {
  m3u8: string;
  provider: string;
  type: string;
  subtitles: Array<{ lang: string; label: string; url: string }>;
  intro: { start: number; end: number } | null;
  outro: { start: number; end: number } | null;
  _server?: string;
}

interface Episode {
  number: number;
  id: string;
  title: string | null;
  isFiller: boolean;
}

type StreamType = "sub" | "dub";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const ep = parseInt(params.get("ep") ?? "1", 10);

  const [streamType, setStreamType] = useState<StreamType>("sub");
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [stream, setStream] = useState<StreamSource | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const [loadingServers, setLoadingServers] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [serversError, setServersError] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Load episode list for the sidebar
  useEffect(() => {
    if (!id) return;
    fetch(`/api/episodes?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data: { episodes: Episode[] }) => setEpisodes(data.episodes ?? []))
      .catch(() => {});
  }, [id]);

  // Load servers whenever episode or type changes
  useEffect(() => {
    if (!id || !ep) return;
    setLoadingServers(true);
    setServersError(null);
    setServers([]);
    setSelectedServer(null);
    setStream(null);
    setStreamError(null);

    fetch(`/api/servers?id=${encodeURIComponent(id)}&ep=${ep}&type=${streamType}`)
      .then((r) => r.json())
      .then((data: { servers: Server[] }) => {
        const list = data.servers ?? [];
        setServers(list);
        // Auto-select first server and load its stream
        if (list.length > 0) {
          setSelectedServer(list[0]!.name);
        } else {
          setServersError("No servers available for this episode/type.");
        }
      })
      .catch(() => setServersError("Failed to load servers."))
      .finally(() => setLoadingServers(false));
  }, [id, ep, streamType]);

  // Load stream whenever a server is selected
  const loadStream = useCallback(
    (serverName: string) => {
      if (!id || !ep) return;
      setLoadingStream(true);
      setStreamError(null);
      setStream(null);

      const url = `/api/stream?id=${encodeURIComponent(id)}&ep=${ep}&type=${streamType}&server=${encodeURIComponent(serverName)}`;
      fetch(url)
        .then(async (r) => {
          if (!r.ok) {
            const body = await r.json().catch(() => ({ error: r.statusText }));
            throw new Error((body as { error?: string }).error ?? r.statusText);
          }
          return r.json() as Promise<StreamSource>;
        })
        .then((data) => {
          if (!data.m3u8) {
            setStreamError("Server returned no stream URL.");
            return;
          }
          // Proxy the m3u8 through our server to handle CORS / CDN restrictions
          const proxied = `/api/proxy?url=${encodeURIComponent(data.m3u8)}`;
          setStream({ ...data, m3u8: proxied });
        })
        .catch((err: Error) => setStreamError(err.message ?? "Stream extraction failed."))
        .finally(() => setLoadingStream(false));
    },
    [id, ep, streamType]
  );

  // When a server is selected, load its stream
  useEffect(() => {
    if (!selectedServer) return;
    loadStream(selectedServer);
  }, [selectedServer, loadStream]);

  function selectServer(name: string) {
    setSelectedServer(name);
  }

  function goToEpisode(epNum: number) {
    navigate(`/watch/${id}?ep=${epNum}`);
  }

  const prevEp = ep > 1 ? ep - 1 : null;
  const nextEp = episodes.length > 0 && ep < episodes[episodes.length - 1]!.number ? ep + 1 : null;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(`/anime/${id}`)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-semibold truncate">Episode {ep}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          {/* Left column: player + controls */}
          <div className="space-y-4">
            {/* Player */}
            <div className="bg-black rounded-xl overflow-hidden">
              {loadingStream && (
                <div className="aspect-video flex items-center justify-center bg-card border border-border rounded-xl">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground text-sm">Loading stream…</p>
                  </div>
                </div>
              )}
              {!loadingStream && streamError && (
                <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-card border border-destructive/20 rounded-xl">
                  <AlertCircle className="w-10 h-10 text-destructive/60" />
                  <p className="text-destructive text-sm text-center max-w-xs px-4">{streamError}</p>
                  {selectedServer && (
                    <button
                      onClick={() => loadStream(selectedServer)}
                      className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  )}
                </div>
              )}
              {!loadingStream && !streamError && stream?.m3u8 && (
                <HlsPlayer
                  src={stream.m3u8}
                  autoPlay
                  onError={(msg) => setStreamError(msg)}
                />
              )}
              {!loadingStream && !streamError && !stream && !selectedServer && (
                <div className="aspect-video flex items-center justify-center bg-card border border-border rounded-xl">
                  <p className="text-muted-foreground text-sm">Select a server to start playing</p>
                </div>
              )}
            </div>

            {/* Sub / Dub toggle */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex bg-muted rounded-lg p-1 gap-1">
                <button
                  onClick={() => setStreamType("sub")}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    streamType === "sub"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  SUB
                </button>
                <button
                  onClick={() => setStreamType("dub")}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    streamType === "dub"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  DUB
                </button>
              </div>

              {/* Episode prev/next */}
              <div className="flex gap-2 ml-auto">
                {prevEp && (
                  <button
                    onClick={() => goToEpisode(prevEp)}
                    className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    ← Ep {prevEp}
                  </button>
                )}
                {nextEp && (
                  <button
                    onClick={() => goToEpisode(nextEp)}
                    className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    Ep {nextEp} →
                  </button>
                )}
              </div>
            </div>

            {/* Server buttons */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Streaming Servers
              </p>
              {loadingServers && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading servers…
                </div>
              )}
              {serversError && (
                <p className="text-destructive text-sm py-2 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {serversError}
                </p>
              )}
              {!loadingServers && servers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {servers.map((srv) => (
                    <button
                      key={srv.id}
                      onClick={() => selectServer(srv.name)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        selectedServer === srv.name
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/30"
                          : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {srv.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stream info */}
            {stream && (
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {stream.provider && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    Provider: <span className="text-foreground">{stream.provider}</span>
                  </span>
                )}
                {stream._server && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    Server: <span className="text-foreground">{stream._server}</span>
                  </span>
                )}
                {stream.subtitles.length > 0 && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    {stream.subtitles.length} subtitle track{stream.subtitles.length !== 1 ? "s" : ""}
                  </span>
                )}
                {stream.intro && (
                  <span className="px-2 py-0.5 bg-muted rounded">
                    Intro: {stream.intro.start}s–{stream.intro.end}s
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right column: episode list */}
          {episodes.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 h-fit max-h-[80vh] overflow-y-auto xl:sticky xl:top-20">
              <h3 className="text-sm font-semibold text-foreground mb-3">Episodes</h3>
              <div className="space-y-1">
                {episodes.map((e) => (
                  <button
                    key={e.number}
                    onClick={() => goToEpisode(e.number)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      e.number === ep
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : e.isFiller
                        ? "text-yellow-500/70 hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="w-8 text-center font-mono shrink-0">{e.number}</span>
                    <span className="truncate">{e.title ?? `Episode ${e.number}`}</span>
                    {e.isFiller && (
                      <span className="shrink-0 text-xs text-yellow-500/60">F</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
