import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

// Opretter Supabase-klienten med cookies fra den aktuelle serveranmodning.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        // Giver Supabase adgang til cookies fra den aktuelle forespørgsel.
        getAll() {
          return cookieStore.getAll();
        },
        // Gemmer fornyede sessioncookies, når serverkonteksten tillader det.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components kan ikke skrive cookies; proxyen gemmer dem ved refresh.
          }
        },
      },
    },
  );
}

// Finder den indloggede bruger eller returnerer null, hvis ingen session findes.
export async function getCurrentUser() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error?.name === "AuthSessionMissingError") {
    return null;
  }

  if (error) {
    throw error;
  }

  return user;
}
