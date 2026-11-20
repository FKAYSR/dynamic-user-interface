import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const instant = false;

async function completePreboarding() {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError?.name === "AuthSessionMissingError") {
    redirect("/login");
  }

  if (userError) {
    throw userError;
  }

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({
    data: { onboarding_complete: true },
  });

  if (error) {
    redirect("/preboarding?error=true");
  }

  redirect("/");
}

export default async function PreboardingPage({ searchParams }) {
  const { error: completionError } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.onboarding_complete === true) {
    redirect("/");
  }

  return (
    <main>
      <h1>Velkommen!</h1>
      <p>Vi hjælper dig godt i gang. Du kan nu begynde at bruge dine noter.</p>
      {completionError && (
        <p role="alert">
          Preboarding kunne ikke gennemføres. Prøv igen.
        </p>
      )}
      <form action={completePreboarding}>
        <button type="submit">Fortsæt til dine noter</button>
      </form>
    </main>
  );
}
