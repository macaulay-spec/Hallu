
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.dramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  korean_title TEXT,
  synopsis TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'airing',
  year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dramas TO anon;
GRANT SELECT ON public.dramas TO authenticated;
GRANT ALL ON public.dramas TO service_role;
ALTER TABLE public.dramas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dramas_public_read" ON public.dramas FOR SELECT USING (true);

CREATE TABLE public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drama_id UUID NOT NULL REFERENCES public.dramas ON DELETE CASCADE,
  number INT NOT NULL,
  title TEXT,
  synopsis TEXT,
  air_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (drama_id, number)
);
GRANT SELECT ON public.episodes TO anon;
GRANT SELECT ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "episodes_public_read" ON public.episodes FOR SELECT USING (true);

CREATE TABLE public.drama_follows (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  drama_id UUID NOT NULL REFERENCES public.dramas ON DELETE CASCADE,
  watched_through INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, drama_id)
);
GRANT SELECT ON public.drama_follows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drama_follows TO authenticated;
GRANT ALL ON public.drama_follows TO service_role;
ALTER TABLE public.drama_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drama_follows_read" ON public.drama_follows FOR SELECT USING (true);
CREATE POLICY "drama_follows_write" ON public.drama_follows FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_follows (
  follower_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);
GRANT SELECT ON public.user_follows TO anon;
GRANT SELECT, INSERT, DELETE ON public.user_follows TO authenticated;
GRANT ALL ON public.user_follows TO service_role;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_follows_read" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "user_follows_write" ON public.user_follows FOR ALL TO authenticated USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'discussion',
  is_spoiler BOOLEAN NOT NULL DEFAULT false,
  drama_id UUID REFERENCES public.dramas ON DELETE SET NULL,
  episode_id UUID REFERENCES public.episodes ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_owner_write" ON public.posts FOR ALL TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE TABLE public.post_likes (
  post_id UUID NOT NULL REFERENCES public.posts ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT ON public.post_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_likes_read" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_write" ON public.post_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_owner_write" ON public.comments FOR ALL TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, handle, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'handle', 'wave_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.dramas (slug, title, korean_title, synopsis, genres, status, year) VALUES
('midnight-seoul', 'Midnight in Seoul', '서울의 자정', 'A night-shift paramedic and a jaded detective keep colliding at the same crime scenes across a sleepless city.', ARRAY['Romance','Thriller'], 'airing', 2026),
('the-last-heir', 'The Last Heir', '마지막 후계자', 'A chaebol heir fakes his own disappearance to find out which member of his family wants him gone.', ARRAY['Melodrama','Mystery'], 'airing', 2026),
('hanbok-house', 'Hanbok House', '한복집', 'Three sisters inherit their grandmother''s failing hanbok atelier and a decade of unfinished business.', ARRAY['Family','Slice of Life'], 'completed', 2025),
('signal-nine', 'Signal Nine', '시그널 나인', 'A radio DJ starts receiving broadcasts from a listener who has not been born yet.', ARRAY['Sci-Fi','Mystery'], 'airing', 2026),
('spring-again', 'Spring, Again', '다시, 봄', 'Two former classmates return to their coastal hometown for one last summer before everything changes.', ARRAY['Romance','Youth'], 'completed', 2025);

INSERT INTO public.episodes (drama_id, number, title, synopsis, air_date)
SELECT d.id, g.n, 'Episode ' || g.n,
       'Episode ' || g.n || ' of ' || d.title || '.',
       (DATE '2026-08-01' + (g.n * 7))
FROM public.dramas d CROSS JOIN generate_series(1, 8) AS g(n);
