import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, EyeOff } from "lucide-react";
import { type FeedPost, timeAgo, toggleLike } from "@/lib/hallyu";

export function PostCard({
  post,
  userId,
  watchedThrough,
  onChanged,
}: {
  post: FeedPost;
  userId?: string | null | undefined;
  watchedThrough?: number | undefined;
  onChanged?: (() => void) | undefined;
}) {
  const episodeNumber = post.episodes?.number ?? null;
  const beyondProgress =
    post.is_spoiler && episodeNumber !== null && (watchedThrough ?? 0) < episodeNumber;
  const [revealed, setRevealed] = useState(false);
  const liked = !!userId && post.post_likes.some((l) => l.user_id === userId);
  const [busy, setBusy] = useState(false);

  async function like() {
    if (!userId || busy) return;
    setBusy(true);
    try {
      await toggleLike(post.id, userId, liked);
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  const hidden = beyondProgress && !revealed;

  return (
    <article className="card-surface mb-3 p-4">
      <div className="flex items-center gap-3">
        <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold">
          {(post.profiles?.display_name ?? "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{post.profiles?.display_name ?? "Member"}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{post.profiles?.handle ?? "member"} · {timeAgo(post.created_at)}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-1 text-[11px] capitalize text-muted-foreground">
          {post.category}
        </span>
      </div>

      {post.dramas ? (
        <Link
          to="/drama/$slug"
          params={{ slug: post.dramas.slug }}
          className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
        >
          {post.dramas.title}
          {episodeNumber !== null ? ` · Ep ${episodeNumber}` : ""}
        </Link>
      ) : null}

      {hidden ? (
        <button
          onClick={() => setRevealed(true)}
          className="tap mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-secondary/60 px-4 py-6 text-center"
        >
          <EyeOff size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium">Spoiler for episode {episodeNumber}</span>
          <span className="text-xs text-muted-foreground">
            You've watched through episode {watchedThrough ?? 0}. Tap to reveal.
          </span>
        </button>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{post.body}</p>
      )}

      <div className="mt-3 flex items-center gap-5 text-muted-foreground">
        <button
          onClick={like}
          aria-pressed={liked}
          aria-label="Like"
          className="tap flex items-center gap-1.5 text-sm aria-pressed:text-accent"
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          {post.post_likes.length}
        </button>
        <Link
          to="/post/$id"
          params={{ id: post.id }}
          className="tap flex items-center gap-1.5 text-sm"
          aria-label="Comments"
        >
          <MessageCircle size={18} />
          {post.comments.length}
        </Link>
      </div>
    </article>
  );
}
