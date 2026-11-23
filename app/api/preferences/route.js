import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import noteColors from "@/components/note/noteColors";

// Returnerer profilnavn og standardfarve for den indloggede bruger.
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    firstName: user.user_metadata?.first_name || "",
    defaultNoteColorId: user.user_metadata?.default_note_color || "standard",
    defaultNoteColorValue:
      user.user_metadata?.default_note_color_value ||
      "var(--colors-sticky-notes-standard)",
  });
}

// Kontrollerer og gemmer brugerens valgte standardfarve.
export async function PATCH(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const defaultNoteColorValue = body?.defaultNoteColorValue;
  const matchingColor = noteColors.find(
    (color) => color.value === defaultNoteColorValue,
  );

  if (
    typeof defaultNoteColorValue !== "string"
    || !matchingColor
  ) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      default_note_color: matchingColor.id,
      default_note_color_value: defaultNoteColorValue,
    },
  });

  if (error) {
    return NextResponse.json({ error: "Could not save preference" }, { status: 500 });
  }

  return NextResponse.json({ defaultNoteColorValue });
}
