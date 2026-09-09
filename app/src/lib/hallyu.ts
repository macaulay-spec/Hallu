import { supabase } from "@/integrations/supabase/client";

export type Drama = {
  id: string;
  slug: string;
  title: string;
  korean_title: string | null;
  synopsis: string | null;
  genres: string[];
  status: string;
  year: number | null;
};

export type Episode = {
  id: string;
  drama_id: string;
  number: number;
  title: string | null;
  synopsis: string | null;
  air_date: string | null;
};

export type FeedPost = {
  id: string;
  body: string;
  category: string;
  is_spoiler: boolean;
  created_at: string;
  author_id: string;
  drama_id: string | null;
  episode_id: string | null;
  profiles: { handle: string; display_name: string; avatar_url: string | null } | null;
  dramas: { slug: string; title: string } | null;
  episodes: { number: number } | null;
  post_likes: { user_id: string }[];
  comments: { id: string }[];
};

const POST_SELECT =
  "id, body, category, is_spoiler, created_at, author_id, drama_id, episode_id, profiles:author_id(handle, display_name, avatar_url), dramas:drama_id(slug, title), episodes:episode_id(number), post_likes(user_id), comments(id)";

export async function fetchFeed(options?: { dramaId?: string; episodeId?: string; authorId?: string }) {
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(50);

  if (options?.dramaId) query = query.eq("drama_id", options.dramaId);
  if (options?.episodeId) query = query.eq("episode_id", options.episodeId);
  if (options?.authorId) query = query.eq("author_id", options.authorId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as FeedPost[];
}

export async function fetchPost(id: string) {
  const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as FeedPost | null;
}

export async function fetchDramas() {
  const { data, error } = await supabase.from("dramas").select("*").order("title");
  if (error) throw error;
  return (data ?? []) as Drama[];
}

export async function fetchDramaBySlug(slug: string) {
  const { data, error } = await supabase.from("dramas").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Drama | null;
}

export async function fetchEpisodes(dramaId: string) {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("drama_id", dramaId)
    .order("number");
  if (error) throw error;
  return (data ?? []) as Episode[];
}

export async function fetchEpisode(id: string) {
  const { data, error } = await supabase
    .from("episodes")
    .select("*, dramas:drama_id(slug, title, korean_title)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as (Episode & { dramas: { slug: string; title: string; korean_title: string | null } }) | null;
}

export async function fetchMyWatchProgress(userId: string) {
  const { data, error } = await supabase
    .from("drama_follows")
    .select("drama_id, watched_through, dramas:drama_id(slug, title)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as unknown as {
    drama_id: string;
    watched_through: number;
    dramas: { slug: string; title: string } | null;
  }[];
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function setWatchProgress(userId: string, dramaId: string, watchedThrough: number) {
  const { error } = await supabase
    .from("drama_follows")
    .upsert({ user_id: userId, drama_id: dramaId, watched_through: watchedThrough });
  if (error) throw error;
}

export async function unfollowDrama(userId: string, dramaId: string) {
  const { error } = await supabase
    .from("drama_follows")
    .delete()
    .eq("user_id", userId)
    .eq("drama_id", dramaId);
  if (error) throw error;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
