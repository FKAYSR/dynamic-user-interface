import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Next.js kører proxyen før de forespørgsler, der matcher konfigurationen nedenfor.
// Hvis adgangstokenet er udløbet, fornyer Supabase sessionen og dens cookies.
export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        // Giver Supabase adgang til cookies fra den aktuelle forespørgsel.
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Gør de fornyede cookies synlige for den aktuelle sideanmodning.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });

          // Sender også de fornyede cookies til browseren.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );

          // Forhindrer, at et sessionsvar caches og vises til en anden bruger.
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Hold createServerClient() og getClaims() samlet; getClaims() fornyer sessionen.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    // Alle stier undtagen statiske filer og billeder.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
