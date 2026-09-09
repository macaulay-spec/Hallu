import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  component: AuthScreen,
  head: () => ({
    meta: [
      { title: "Sign in to Hallyu" },
      { name: "description", content: "Create your Hallyu account and join the K-drama wave." },
      { property: "og:title", content: "Sign in to Hallyu" },
      { property: "og:description", content: "Create your Hallyu account and join the K-drama wave." },
    ],
  }),
});

function AuthScreen() {
  const navigate = useNavigate();
  const { user } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { handle: handle || undefined, display_name: handle || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="brand-gradient mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black">
        H
      </div>
      <h1 className="text-center text-3xl font-bold tracking-tight">HALLYU</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">한류 · Where the wave lives</p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {mode === "signup" ? (
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/\s/g, "").toLowerCase())}
            placeholder="Your handle"
            aria-label="Handle"
            className="tap w-full rounded-lg border border-input bg-secondary px-4 py-3 text-base outline-none focus:border-ring"
          />
        ) : null}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Email"
          className="tap w-full rounded-lg border border-input bg-secondary px-4 py-3 text-base outline-none focus:border-ring"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
          className="tap w-full rounded-lg border border-input bg-secondary px-4 py-3 text-base outline-none focus:border-ring"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="brand-gradient tap w-full rounded-lg py-3 text-base font-semibold disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>

      <button
        onClick={google}
        className="tap mt-3 w-full rounded-lg border border-border bg-secondary py-3 text-base font-medium"
      >
        Continue with Google
      </button>

      <button
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        className="tap mt-6 text-center text-sm text-muted-foreground"
      >
        {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
    </div>
  );
}
