import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

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

  if (error || !data.user || !data.session) {
    redirect("/signup?error=true");
  }

  redirect("/preboarding");
}

export default async function SignUpPage({ searchParams }) {
  const { error } = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.card} data-node-id="545:584">
        <div className={styles.topContent}>
          <header className={styles.heading}>
            <h1>Tilmeld</h1>
            <p>Skriv email og adgangskode for at oprette en bruger</p>
          </header>

          {error && (
            <p className={styles.formError} role="alert">
              Kontoen kunne ikke oprettes eller logges ind automatisk.
            </p>
          )}

          <form action={signUp} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Adgangskode</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <label className={styles.remember}>
              <input type="checkbox" name="remember" />
              <span>Husk mig</span>
            </label>

            <button className={styles.primaryButton} type="submit">
              Tilmeld
            </button>
          </form>
        </div>

        <div className={styles.divider} aria-label="eller">
          <span />
          <p>eller</p>
          <span />
        </div>

        <div className={styles.socialButtons}>
          <Link className={styles.socialButton} href="#">
            <svg
              className={styles.googleIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path fill="#4285F4" d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.598 4.598 0 0 1-1.995 3.017v2.551h3.233c1.891-1.741 2.98-4.307 2.98-7.391Z" />
              <path fill="#34A853" d="M12 22c2.703 0 4.968-.896 6.62-2.422l-3.233-2.551c-.896.6-2.043.955-3.387.955-2.605 0-4.813-1.76-5.604-4.125H3.048v2.632A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.396 13.857A6.012 6.012 0 0 1 6.084 12c0-.645.11-1.273.312-1.857V7.511H3.048A10 10 0 0 0 2 12c0 1.614.386 3.143 1.048 4.489l3.348-2.632Z" />
              <path fill="#EA4335" d="M12 5.978c1.471 0 2.791.505 3.829 1.496l2.873-2.873A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.952 5.511l3.348 2.632C7.187 7.778 9.395 5.978 12 5.978Z" />
            </svg>
            <span>Forsæt med Google</span>
          </Link>
          <Link className={styles.socialButton} href="#">
            <span className={styles.facebookIcon} aria-hidden="true">f</span>
            <span>Forsæt med Facebook</span>
          </Link>
        </div>

        <p className={styles.switchAuth}>
          Har du allerede en bruger?
          <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
