import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata = {
  title: "Log In",
};

async function signIn(formData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=true");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    if (error) {
      console.error("Supabase sign-in failed:", {
        name: error.name,
        code: error.code,
        status: error.status,
        message: error.message,
      });
    } else {
      console.error("Supabase sign-in returned no user and no error.");
    }
    redirect("/login?error=true");
  }

  redirect(
    data.user.user_metadata?.onboarding_complete === true
      ? "/"
      : "/preboarding",
  );
}

export default async function logInPage({ searchParams }) {
  const { error, registered } = await searchParams;

  return (
    <main>
      <h1>Log in</h1>
      {registered && (
        <p role="status">Tjek din e-mail for at bekræfte din konto.</p>
      )}
      {error && (
        <p className="form-error" role="alert">
          Forkert e-mail eller adgangskode.
        </p>
      )}
      <form action={signIn} className="auth-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
          required
        />

        <button type="submit">Sign in</button>
      </form>
      <p>
        Har du ikke en konto endnu? <Link href="/signup">Opret konto</Link>
      </p>
    </main>
  );
}
