import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

export const instant = false;

export const metadata = {
  title: "Log In",
};

// Godkender loginoplysninger og sender brugeren videre til det rette sted.
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
      : "/preboarding?fromLogin=true",
  );
}

// Viser loginformularen og statusbeskeder fra loginforsøget.
export default async function logInPage({ searchParams }) {
  const { error, registered } = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.card} data-node-id="545:1392">
        <div className={styles.topContent}>
          <header className={styles.heading}>
            <h1>Log in</h1>
            <p>Skriv email og adgangskode for at logge ind</p>
          </header>

          {registered && (
            <p className={styles.status} role="status">
              Tjek din e-mail for at bekræfte din konto.
            </p>
          )}
          {error && (
            <p id="login-error" className={styles.formError} role="alert">
              Forkert e-mail eller adgangskode.
            </p>
          )}

          <form action={signIn} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Adgangskode</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "login-error" : undefined}
                required
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" name="remember" />
                <span>Husk mig</span>
              </label>
              <Link className={styles.forgotPassword} href="#">
                Glemt adgangskode
              </Link>
            </div>

            <button className={styles.primaryButton} type="submit">
              Log in
            </button>
          </form>
        </div>

        <div className={styles.divider}>
          <span aria-hidden="true" />
          <p>eller</p>
          <span aria-hidden="true" />
        </div>

        <div className={styles.socialButtons}>
          <Link className={styles.socialButton} href="#">
            <svg
              className={styles.googleIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.598 4.598 0 0 1-1.995 3.017v2.551h3.233c1.891-1.741 2.98-4.307 2.98-7.391Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.703 0 4.968-.896 6.62-2.422l-3.233-2.551c-.896.6-2.043.955-3.387.955-2.605 0-4.813-1.76-5.604-4.125H3.048v2.632A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.396 13.857A6.012 6.012 0 0 1 6.084 12c0-.645.11-1.273.312-1.857V7.511H3.048A10 10 0 0 0 2 12c0 1.614.386 3.143 1.048 4.489l3.348-2.632Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.978c1.471 0 2.791.505 3.829 1.496l2.873-2.873A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.952 5.511l3.348 2.632C7.187 7.778 9.395 5.978 12 5.978Z"
              />
            </svg>
            <span>Forsæt med Google</span>
          </Link>
          <Link className={styles.socialButton} href="#">
            <span className={styles.facebookIcon} aria-hidden="true">
              f
            </span>
            <span>Forsæt med Facebook</span>
          </Link>
        </div>

        <p className={styles.switchAuth}>
          Har du allerede en bruger?
          <Link href="/signup">Tilmeld</Link>
        </p>
      </section>
    </main>
  );
}
