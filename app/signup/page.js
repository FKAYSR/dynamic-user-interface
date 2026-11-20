import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata = {
  title: "Sign Up",
};

async function signUp(formData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/signup?error=true");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { onboarding_complete: false },
    },
  });

  if (error || !data.user) {
    redirect("/signup?error=true");
  }

  redirect(data.session ? "/preboarding" : "/login?registered=true");
}

export default async function SignUpPage({ searchParams }) {
  const { error } = await searchParams;

  return (
    <main>
      <h1>Sign Up</h1>
      {error && (
        <p className="form-error" role="alert">
          Kontoen kunne ikke oprettes. E-mailen er måske allerede i brug.
        </p>
      )}
      <form action={signUp} className="auth-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="dig@eksempel.dk"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mindst 8 tegn"
          autoComplete="new-password"
          minLength={6}
          required
        />

        <button type="submit">Sign up</button>
      </form>
      <p>
        Har du allerede en konto? <Link href="/login">Log ind</Link>
      </p>
    </main>
  );
}
