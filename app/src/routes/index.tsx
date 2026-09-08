import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { useSession } from "@/lib/session";
import { fetchFeed, fetchMyWatchProgress } from "@/lib/hallyu";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: HomeFeed,
  head: () => ({
    meta: [
      { title: "Hallyu — Where the Wave Lives" },
      {
        name: "description",
        content:
          "Hallyu is the K-drama fan community: episode discussions, spoiler-safe reactions and the dramas you follow.",
      },
      { property: "og:title", content: "Hallyu — Where the Wave Lives" },
      {
        property: "og:description",
        content: "Join episode-by-episode K-drama discussions with spoiler safety built in.",
      },
    ],
  }),
});

function HomeFeed() {
  const { user, loading } = useSession();
  const [tab, setTab] = useState<"for-you" | "following">("for-you");

  const progress = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: () => fetchMyWatchProgress(user!.id),
    enabled: !!user,
  });

  const following = useQuery({
    queryKey: ["following-ids", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r) => r.following_id as string);
    },
    enabled: !!user,
  });

  const feed = useQuery({ queryKey: ["feed"], queryFn: () => fetchFeed() });

  const progressMap = new Map((progress.data ?? []).map((p) => [p.drama_id, p.watched_through]));
  const followedDramaIds = new Set((progress.data ?? []).map((p) => p.drama_id));
  const followedUsers = new Set(following.data ?? []);

  const posts = (feed.data ?? []).filter((p) =>
    tab === "for-you"
      ? true
      : followedUsers.has(p.author_id) || (p.drama_id ? followedDramaIds.has(p.drama_id) : false),
  );

  return (
    <AppShell title="Hallyu" subtitle="Where the wave lives">
      {!loading && !user ? (
        <div className="brand-gradient mb-4 rounded-xl p-4">
          <p className="text-base font-semibold">Join the wave</p>
          <p className="mt-1 text-sm opacity-90">
            Sign in to follow dramas, track your episodes and post reactions.
          </p>
          <Link
            to="/auth"
            className="tap mt-3 inline-flex items-center rounded-lg bg-background px-4 py-2 text-sm font-semibold"
          >
            Get started
          </Link>
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Feed"
        className="mb-4 flex rounded-lg bg-secondary p-1 text-sm"
      >
        {(["for-you", "following"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="tap flex-1 rounded-md py-2 font-medium text-muted-foreground aria-selected:bg-background aria-selected:text-foreground"
          >
            {t === "for-you" ? "For You" : "Following"}
          </button>
        ))}
      </div>

      {feed.isLoading ? (
        <SkeletonFeed />
      ) : feed.isError ? (
        <EmptyState title="Couldn't load the feed" body="Check your connection and try again." />
      ) : posts.length === 0 ? (
        <EmptyState
          title={tab === "following" ? "Nothing from your follows yet" : "The wave is quiet"}
          body={
            tab === "following"
              ? "Follow dramas and members to fill this feed."
              : "Be the first to post a reaction."
          }
        />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            userId={user?.id}
            watchedThrough={post.drama_id ? (progressMap.get(post.drama_id) ?? 0) : 0}
            onChanged={() => feed.refetch()}
          />
        ))
      )}
    </AppShell>
  );
}

export function SkeletonFeed() {
  return (
    <div aria-hidden className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card-surface h-32 animate-pulse opacity-60" />
      ))}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="card-surface px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
