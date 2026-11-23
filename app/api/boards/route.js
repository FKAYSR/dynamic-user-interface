import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import noteColors from "@/components/note/noteColors";

// Opretter en tavle med det valgte navn og en kendt farve.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const color = typeof body?.color === "string" ? body.color : "";
  const matchingColor = noteColors.find((item) => item.id === color);

  if (!name || !matchingColor) {
    return NextResponse.json({ error: "Invalid board" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .insert({ name, color: matchingColor.value })
    .select("id, name, color, created_at, last_accessed_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ board: data }, { status: 201 });
}
