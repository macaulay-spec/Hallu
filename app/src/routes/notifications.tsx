import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Heart, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/hallyu";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
  head: () => ({
    meta: [
      { title: "Notifications — Hallyu" },
      { name: "description", content: "Replies and likes on your Hallyu posts, plus episode updates." },
      { property: "og:title", content: "Notifications — Hallyu" },
      { property: "og:description", content: "Replies and likes on your Hallyu posts." },
    ],
  }),
});

type Activity = {
  id: string;
  kind: "like" | "comment";
  who: string;
  postId: string;
  at: string;
  preview: string;
};

function Notifications() {
  const { user } = useSession();

  const activity = useQuery({
    queryKey: ["activity", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Activity[]> => {
      const { data: myPosts, error: postErr } = await supabase
        .from("posts")
        .select("id, body")
        .eq("author_id", user!.id);
      if (postErr) throw postErr;
      const ids = (myPosts ?? []).map((p) => p.id as string);
      if (ids.length === 0) return [];
      const bodies = new Map((myPosts ?? []).map((p) => [p.id as string, p.body as string]));

      const [likes, comments] = await Promise.all([
        supabase
          .from("post_likes")
          .select("post_id, created_at, user_id, profiles:user_id(display_name)")
          .in("post_id", ids)
          .neq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("comments")
          .select("id, post_id, created_at, body, author_id, profiles:author_id(display_name)")
          .in("post_id", ids)
          .neq("author_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(30),
      ]);
      if (likes.error) throw likes.error;
      if (comments.error) throw comments.error;

      const items: Activity[] = [
        ...(likes.data ?? []).map((l) => ({
          id: `like-${l.post_id}-${l.user_id}`,
          kind: "like" as const,
          who: (l.profiles as unknown as { display_name: string } | null)?.display_name ?? "Someone",
          postId: l.post_id as string,
          at: l.created_at as string,
          preview: bodies.get(l.post_id as string) ?? "",
        })),
        ...(comments.data ?? []).map((c) => ({
          id: `comment-${c.id}`,
          kind: "comment" as const,
          who: (c.profiles as unknown as { display_name: string } | null)?.display_name ?? "Someone",
          postId: c.post_id as string,
          at: c.created_at as string,
          preview: c.body as string,
        })),
      ].sort((a, b) => (a.at < b.at ? 1 : -1));

      return items;
    },
  });

  if (!user) {
    return (
      <AppShell title="Notifications">
        <div className="card-surface px-6 py-10 text-center">
          <Bell className="mx-auto text-muted-foreground" />
          <p className="mt-2 font-semibold">Sign in to see your activity</p>
          <Link to="/auth" className="tap mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold">
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  const items = activity.data ?? [];

  return (
    <AppShell title="Notifications" subtitle="Activity on your posts">
      {activity.isLoading ? (
        <div className="card-surface h-32 animate-pulse opacity-60" />
      ) : items.length === 0 ? (
        <div className="card-surface px-6 py-10 text-center">
          <p className="font-semibold">Nothing yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Likes and replies to your posts will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link to="/post/$id" params={{ id: n.postId }} className="card-surface flex gap-3 p-4">
                {n.kind === "like" ? (
                  <Heart size={18} className="mt-0.5 shrink-0 text-accent" />
                ) : (
                  <MessageCircle size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{n.who}</span>{" "}
                    {n.kind === "like" ? "liked your post" : "replied to your post"} ·{" "}
                    <span className="text-muted-foreground">{timeAgo(n.at)}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.preview}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
