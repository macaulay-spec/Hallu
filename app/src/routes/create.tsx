import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/lib/session";
import { fetchDramas, fetchEpisodes } from "@/lib/hallyu";
import { supabase } from "@/integrations/supabase/client";

const categories = ["reaction", "discussion", "theory", "meme"] as const;

export const Route = createFileRoute("/create")({
  component: Create,
  head: () => ({
    meta: [
      { title: "Post a reaction — Hallyu" },
      { name: "description", content: "Share a reaction, theory or meme with the Hallyu community." },
      { property: "og:title", content: "Post a reaction — Hallyu" },
      { property: "og:description", content: "Share a reaction, theory or meme with the Hallyu community." },
    ],
  }),
});

function Create() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("reaction");
  const [dramaId, setDramaId] = useState("");
  const [episodeId, setEpisodeId] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const dramas = useQuery({ queryKey: ["dramas"], queryFn: fetchDramas });
  const episodes = useQuery({
    queryKey: ["episodes", dramaId],
    queryFn: () => fetchEpisodes(dramaId),
    enabled: !!dramaId,
  });

  async function publish() {
    if (!user || !body.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      body: body.trim(),
      category,
      is_spoiler: spoiler,
      drama_id: dramaId || null,
      episode_id: episodeId || null,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/" });
  }

  return (
    <AppShell title="Create" subtitle="Add to the conversation">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={6}
        placeholder="What did that episode do to you?"
        aria-label="Post text"
        className="w-full rounded-lg border border-input bg-secondary p-4 text-base outline-none focus:border-ring"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className="tap rounded-full border border-border px-4 py-2 text-sm capitalize text-muted-foreground aria-pressed:border-transparent aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {c}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-sm font-medium">Drama</label>
      <select
        value={dramaId}
        onChange={(e) => {
          setDramaId(e.target.value);
          setEpisodeId("");
        }}
        className="tap mt-1 w-full rounded-lg border border-input bg-secondary px-3 py-3 text-base"
      >
        <option value="">No drama tag</option>
        {(dramas.data ?? []).map((d) => (
          <option key={d.id} value={d.id}>
            {d.title}
          </option>
        ))}
      </select>

      {dramaId ? (
        <>
          <label className="mt-4 block text-sm font-medium">Episode</label>
          <select
            value={episodeId}
            onChange={(e) => setEpisodeId(e.target.value)}
            className="tap mt-1 w-full rounded-lg border border-input bg-secondary px-3 py-3 text-base"
          >
            <option value="">No episode tag</option>
            {(episodes.data ?? []).map((ep) => (
              <option key={ep.id} value={ep.id}>
                Episode {ep.number}
              </option>
            ))}
          </select>
        </>
      ) : null}

      <label className="mt-5 flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
        <span className="text-sm">Mark as spoiler</span>
        <input
          type="checkbox"
          checked={spoiler}
          onChange={(e) => setSpoiler(e.target.checked)}
          className="h-5 w-5 accent-[color:var(--primary)]"
        />
      </label>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <button
        onClick={publish}
        disabled={busy || !body.trim()}
        className="brand-gradient tap mt-5 w-full rounded-lg py-3 text-base font-semibold disabled:opacity-50"
      >
        {busy ? "Publishing…" : "Publish"}
      </button>
    </AppShell>
  );
}
