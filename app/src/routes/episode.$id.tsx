import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { useSession } from "@/lib/session";
import { fetchEpisode, fetchFeed, fetchMyWatchProgress, setWatchProgress } from "@/lib/hallyu";

export const Route = createFileRoute("/episode/$id")({
  component: EpisodeDetail,
  head: () => ({
    meta: [
      { title: "Episode discussion — Hallyu" },
      { name: "description", content: "Spoiler-safe episode discussion with fans watching at your pace." },
      { property: "og:title", content: "Episode discussion — Hallyu" },
      { property: "og:description", content: "Spoiler-safe episode discussion on Hallyu." },
    ],
  }),
});

function EpisodeDetail() {
  const { id } = useParams({ from: "/episode/$id" });
  const { user } = useSession();

  const episode = useQuery({ queryKey: ["episode", id], queryFn: () => fetchEpisode(id) });
  const posts = useQuery({
    queryKey: ["feed", "episode", id],
    queryFn: () => fetchFeed({ episodeId: id }),
  });
  const progress = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: () => fetchMyWatchProgress(user!.id),
    enabled: !!user,
  });

  if (episode.isLoading) {
    return (
      <AppShell>
        <div className="card-surface h-40 animate-pulse opacity-60" />
      </AppShell>
    );
  }

  if (!episode.data) {
    return (
      <AppShell title="Not found">
        <div className="card-surface px-6 py-10 text-center text-sm text-muted-foreground">
          That episode doesn't exist.
        </div>
      </AppShell>
    );
  }

  const ep = episode.data;
  const watched = progress.data?.find((p) => p.drama_id === ep.drama_id)?.watched_through ?? 0;

  return (
    <AppShell>
      <Link
        to="/drama/$slug"
        params={{ slug: ep.dramas.slug }}
        className="tap mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ChevronLeft size={16} /> {ep.dramas.title}
      </Link>

      <h1 className="text-xl font-bold">
        Episode {ep.number}
        {ep.title ? ` · ${ep.title}` : ""}
      </h1>
      {ep.air_date ? (
        <p className="text-sm text-muted-foreground">Aired {new Date(ep.air_date).toLocaleDateString()}</p>
      ) : null}
      {ep.synopsis ? <p className="mt-3 text-sm text-muted-foreground">{ep.synopsis}</p> : null}

      {user && watched < ep.number ? (
        <button
          onClick={async () => {
            await setWatchProgress(user.id, ep.drama_id, ep.number);
            progress.refetch();
          }}
          className="brand-gradient tap mt-4 w-full rounded-lg py-3 text-sm font-semibold"
        >
          Mark watched through episode {ep.number}
        </button>
      ) : null}

      <h2 className="mt-6 mb-3 text-lg font-semibold">Discussion</h2>
      {posts.isLoading ? (
        <div className="card-surface h-28 animate-pulse opacity-60" />
      ) : (posts.data ?? []).length === 0 ? (
        <div className="card-surface px-5 py-8 text-center text-sm text-muted-foreground">
          No reactions to this episode yet — start the thread.
        </div>
      ) : (
        (posts.data ?? []).map((p) => (
          <PostCard
            key={p.id}
            post={p}
            userId={user?.id}
            watchedThrough={watched}
            onChanged={() => posts.refetch()}
          />
        ))
      )}
    </AppShell>
  );
}
