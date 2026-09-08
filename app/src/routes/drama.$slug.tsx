import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { useSession } from "@/lib/session";
import {
  fetchDramaBySlug,
  fetchEpisodes,
  fetchFeed,
  fetchMyWatchProgress,
  setWatchProgress,
  unfollowDrama,
} from "@/lib/hallyu";
import { posterFor } from "@/lib/posters";

export const Route = createFileRoute("/drama/$slug")({
  component: DramaDetail,
  head: () => ({
    meta: [
      { title: "Drama community — Hallyu" },
      { name: "description", content: "Episode list, watch progress and fan discussion for this K-drama." },
      { property: "og:title", content: "Drama community — Hallyu" },
      { property: "og:description", content: "Episode list, watch progress and fan discussion." },
    ],
  }),
});

function DramaDetail() {
  const { slug } = useParams({ from: "/drama/$slug" });
  const { user } = useSession();

  const drama = useQuery({ queryKey: ["drama", slug], queryFn: () => fetchDramaBySlug(slug) });
  const episodes = useQuery({
    queryKey: ["episodes", drama.data?.id],
    queryFn: () => fetchEpisodes(drama.data!.id),
    enabled: !!drama.data,
  });
  const posts = useQuery({
    queryKey: ["feed", "drama", drama.data?.id],
    queryFn: () => fetchFeed({ dramaId: drama.data!.id }),
    enabled: !!drama.data,
  });
  const progress = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: () => fetchMyWatchProgress(user!.id),
    enabled: !!user,
  });

  const watched = progress.data?.find((p) => p.drama_id === drama.data?.id);
  const following = !!watched;

  if (drama.isLoading) {
    return (
      <AppShell>
        <div className="card-surface h-64 animate-pulse opacity-60" />
      </AppShell>
    );
  }

  if (!drama.data) {
    return (
      <AppShell title="Not found">
        <div className="card-surface px-6 py-10 text-center">
          <p className="font-semibold">We couldn't find that drama</p>
          <Link to="/explore" className="mt-3 inline-block text-sm text-primary underline">
            Back to Explore
          </Link>
        </div>
      </AppShell>
    );
  }

  const d = drama.data;

  return (
    <AppShell>
      <Link to="/explore" className="tap mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft size={16} /> Explore
      </Link>

      <div className="flex gap-4">
        <img
          src={posterFor(d.slug)}
          alt={`${d.title} poster`}
          width={768}
          height={1152}
          className="h-40 w-28 rounded-xl object-cover"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight">{d.title}</h1>
          <p className="text-sm text-muted-foreground">
            {d.korean_title} · {d.year} · {d.status}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {d.genres.map((g) => (
              <span key={g} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                {g}
              </span>
            ))}
          </div>
          {user ? (
            <button
              onClick={async () => {
                if (following) await unfollowDrama(user.id, d.id);
                else await setWatchProgress(user.id, d.id, 0);
                progress.refetch();
              }}
              className={`tap mt-3 rounded-lg px-4 py-2 text-sm font-semibold ${
                following ? "border border-border text-muted-foreground" : "brand-gradient"
              }`}
            >
              {following ? "Following" : "Follow drama"}
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{d.synopsis}</p>

      {user && following ? (
        <div className="card-surface mt-5 p-4">
          <p className="text-sm font-medium">Watched through episode {watched?.watched_through ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Posts about later episodes stay hidden until you catch up.
          </p>
          <input
            type="range"
            min={0}
            max={episodes.data?.length ?? 16}
            value={watched?.watched_through ?? 0}
            onChange={async (e) => {
              await setWatchProgress(user.id, d.id, Number(e.target.value));
              progress.refetch();
            }}
            aria-label="Watch progress"
            className="mt-3 w-full accent-[color:var(--primary)]"
          />
        </div>
      ) : null}

      <h2 className="mt-6 mb-3 text-lg font-semibold">Episodes</h2>
      <ul className="mb-6 grid grid-cols-4 gap-2">
        {(episodes.data ?? []).map((ep) => (
          <li key={ep.id}>
            <Link
              to="/episode/$id"
              params={{ id: ep.id }}
              className="tap flex h-14 items-center justify-center rounded-lg bg-secondary text-sm font-semibold"
            >
              {ep.number}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 text-lg font-semibold">Community</h2>
      {posts.isLoading ? (
        <div className="card-surface h-28 animate-pulse opacity-60" />
      ) : (posts.data ?? []).length === 0 ? (
        <div className="card-surface px-5 py-8 text-center text-sm text-muted-foreground">
          No posts about this drama yet.
        </div>
      ) : (
        (posts.data ?? []).map((p) => (
          <PostCard
            key={p.id}
            post={p}
            userId={user?.id}
            watchedThrough={watched?.watched_through ?? 0}
            onChanged={() => posts.refetch()}
          />
        ))
      )}
    </AppShell>
  );
}
