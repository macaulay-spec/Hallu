import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { useSession } from "@/lib/session";
import { fetchMyWatchProgress, fetchPost, timeAgo } from "@/lib/hallyu";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/post/$id")({
  component: PostDetail,
  head: () => ({
    meta: [
      { title: "Post — Hallyu" },
      { name: "description", content: "Read the full fan reaction and join the replies on Hallyu." },
      { property: "og:title", content: "Post — Hallyu" },
      { property: "og:description", content: "Read the full fan reaction and join the replies." },
    ],
  }),
});

function PostDetail() {
  const { id } = useParams({ from: "/post/$id" });
  const { user } = useSession();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const post = useQuery({ queryKey: ["post", id], queryFn: () => fetchPost(id) });
  const progress = useQuery({
    queryKey: ["progress", user?.id],
    queryFn: () => fetchMyWatchProgress(user!.id),
    enabled: !!user,
  });
  const comments = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, created_at, profiles:author_id(handle, display_name)")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string;
        body: string;
        created_at: string;
        profiles: { handle: string; display_name: string } | null;
      }[];
    },
  });

  async function send() {
    if (!user || !reply.trim()) return;
    setBusy(true);
    await supabase.from("comments").insert({ post_id: id, author_id: user.id, body: reply.trim() });
    setReply("");
    setBusy(false);
    comments.refetch();
    post.refetch();
  }

  if (post.isLoading) {
    return (
      <AppShell>
        <div className="card-surface h-40 animate-pulse opacity-60" />
      </AppShell>
    );
  }

  if (!post.data) {
    return (
      <AppShell title="Not found">
        <div className="card-surface px-6 py-10 text-center text-sm text-muted-foreground">
          This post is no longer available.
        </div>
      </AppShell>
    );
  }

  const watched = post.data.drama_id
    ? (progress.data?.find((p) => p.drama_id === post.data!.drama_id)?.watched_through ?? 0)
    : 0;

  return (
    <AppShell>
      <Link to="/" className="tap mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft size={16} /> Feed
      </Link>

      <PostCard post={post.data} userId={user?.id} watchedThrough={watched} onChanged={() => post.refetch()} />

      <h2 className="mb-3 mt-4 text-lg font-semibold">Replies</h2>
      {(comments.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No replies yet.</p>
      ) : (
        <ul className="space-y-3">
          {(comments.data ?? []).map((c) => (
            <li key={c.id} className="card-surface p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{c.profiles?.display_name ?? "Member"}</span> ·{" "}
                {timeAgo(c.created_at)}
              </p>
              <p className="mt-1 text-sm">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <div className="mt-5 flex gap-2">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Add a reply"
            aria-label="Reply"
            className="tap flex-1 rounded-lg border border-input bg-secondary px-3 py-3 text-base outline-none focus:border-ring"
          />
          <button
            onClick={send}
            disabled={busy || !reply.trim()}
            className="brand-gradient tap rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>
      ) : (
        <Link to="/auth" className="mt-5 block text-sm text-primary underline">
          Sign in to reply
        </Link>
      )}
    </AppShell>
  );
}
