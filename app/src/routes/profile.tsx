import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { useSession } from "@/lib/session";
import { fetchFeed, fetchMyWatchProgress } from "@/lib/hallyu";
import { supabase } from "@/integrations/supabase/client";
import { posterFor } from "@/lib/posters";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({
    meta: [
      { title: "Your profile — Hallyu" },
      { name: "description", content: "Your Hallyu posts, watchlist and episode progress in one place." },
      { property: "og:title", content: "Your profile — Hallyu" },
      { property: "og:description", content: "Your Hallyu posts, watchlist and episode progress." },
    ],
  }),
});

function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useSession();

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("handle, display_name, bio")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const progress = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user,
    queryFn: () => fetchMyWatchProgress(user!.id),
  });

  const myPosts = useQuery({
    queryKey: ["my-posts", user?.id],
    enabled: !!user,
    queryFn: () => fetchFeed({ authorId: user!.id }),
  });

  if (!loading && !user) {
    return (
      <AppShell title="Profile">
        <div className="card-surface px-6 py-10 text-center">
          <p className="font-semibold">You're browsing as a guest</p>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to post and track episodes.</p>
          <Link to="/auth" className="brand-gradient tap mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold">
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  const progressMap = new Map((progress.data ?? []).map((p) => [p.drama_id, p.watched_through]));

  return (
    <AppShell>
      <header className="mb-6 flex items-center gap-4">
        <div className="brand-gradient flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
          {(profile.data?.display_name ?? "H").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{profile.data?.display_name ?? "Member"}</h1>
          <p className="truncate text-sm text-muted-foreground">@{profile.data?.handle ?? "member"}</p>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Watchlist</h2>
        {(progress.data ?? []).length === 0 ? (
          <div className="card-surface px-5 py-8 text-center text-sm text-muted-foreground">
            You aren't following any dramas yet.{" "}
            <Link to="/explore" className="text-primary underline">
              Explore dramas
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {(progress.data ?? []).map((w) => (
              <li key={w.drama_id}>
                <Link
                  to="/drama/$slug"
                  params={{ slug: w.dramas?.slug ?? "" }}
                  className="card-surface flex items-center gap-3 p-3"
                >
                  <img
                    src={posterFor(w.dramas?.slug ?? "")}
                    alt=""
                    loading="lazy"
                    className="h-16 w-11 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{w.dramas?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Watched through episode {w.watched_through}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your posts</h2>
        {(myPosts.data ?? []).length === 0 ? (
          <div className="card-surface px-5 py-8 text-center text-sm text-muted-foreground">
            No posts yet.
          </div>
        ) : (
          (myPosts.data ?? []).map((p) => (
            <PostCard
              key={p.id}
              post={p}
              userId={user?.id}
              watchedThrough={p.drama_id ? (progressMap.get(p.drama_id) ?? 0) : 0}
              onChanged={() => myPosts.refetch()}
            />
          ))
        )}
      </section>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/" });
        }}
        className="tap mt-8 w-full rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground"
      >
        Log out
      </button>
    </AppShell>
  );
}
