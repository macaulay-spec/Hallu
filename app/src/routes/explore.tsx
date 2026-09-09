import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { fetchDramas } from "@/lib/hallyu";
import { posterFor } from "@/lib/posters";

export const Route = createFileRoute("/explore")({
  component: Explore,
  head: () => ({
    meta: [
      { title: "Explore K-dramas — Hallyu" },
      {
        name: "description",
        content: "Browse currently airing and completed K-dramas and jump into their fan communities.",
      },
      { property: "og:title", content: "Explore K-dramas — Hallyu" },
      { property: "og:description", content: "Browse airing and completed K-dramas on Hallyu." },
    ],
  }),
});

function Explore() {
  const [q, setQ] = useState("");
  const dramas = useQuery({ queryKey: ["dramas"], queryFn: fetchDramas });

  const list = (dramas.data ?? []).filter((d) =>
    (d.title + " " + (d.korean_title ?? "")).toLowerCase().includes(q.toLowerCase()),
  );
  const airing = list.filter((d) => d.status === "airing");

  return (
    <AppShell title="Explore" subtitle="Find your next obsession">
      <label className="mb-5 flex items-center gap-2 rounded-lg border border-input bg-secondary px-3 py-3">
        <Search size={18} className="text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search dramas"
          aria-label="Search dramas"
          className="w-full bg-transparent text-base outline-none"
        />
      </label>

      {dramas.isLoading ? (
        <div className="card-surface h-48 animate-pulse opacity-60" />
      ) : list.length === 0 ? (
        <div className="card-surface px-6 py-10 text-center">
          <p className="font-semibold">No dramas match "{q}"</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different title.</p>
        </div>
      ) : (
        <>
          {airing.length > 0 && q === "" ? (
            <section className="mb-6">
              <h2 className="mb-3 text-lg font-semibold">Current Wave</h2>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                {airing.map((d) => (
                  <Link
                    key={d.id}
                    to="/drama/$slug"
                    params={{ slug: d.slug }}
                    className="w-36 shrink-0"
                  >
                    <img
                      src={posterFor(d.slug)}
                      alt={`${d.title} poster`}
                      loading="lazy"
                      width={768}
                      height={1152}
                      className="h-52 w-36 rounded-xl object-cover"
                    />
                    <p className="mt-2 truncate text-sm font-medium">{d.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.korean_title}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <h2 className="mb-3 text-lg font-semibold">All dramas</h2>
          <ul className="space-y-3">
            {list.map((d) => (
              <li key={d.id}>
                <Link
                  to="/drama/$slug"
                  params={{ slug: d.slug }}
                  className="card-surface flex gap-3 p-3"
                >
                  <img
                    src={posterFor(d.slug)}
                    alt={`${d.title} poster`}
                    loading="lazy"
                    width={768}
                    height={1152}
                    className="h-24 w-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{d.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.korean_title} · {d.year}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.synopsis}</p>
                    <div className="mt-2 flex gap-1.5">
                      {d.genres.map((g) => (
                        <span
                          key={g}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
