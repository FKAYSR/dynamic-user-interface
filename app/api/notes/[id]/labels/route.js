import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

// Henter brugerens etiketter og viser, hvilke der er knyttet til noten.
export async function GET(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (noteError) {
    return NextResponse.json({ error: "Could not load note" }, { status: 500 });
  }
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const [{ data: labels, error: labelsError }, { data: links, error: linksError }] =
    await Promise.all([
      supabase
        .from("labels")
        .select("id,name,icon")
        .eq("user_id", user.id)
        .order("name"),
      supabase
        .from("note_labels")
        .select("label_id")
        .eq("note_id", id),
    ]);

  if (labelsError || linksError) {
    return NextResponse.json({ error: "Could not load labels" }, { status: 500 });
  }

  return NextResponse.json({
    labels: labels ?? [],
    selectedLabelIds: (links ?? []).map((link) => link.label_id),
  });
}

// Opretter en ny etiket og knytter den til den angivne note.
export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const icon = typeof body?.icon === "string" && /^[a-z0-9-]+(?:\/[a-z0-9-]+)?\.svg$/i.test(body.icon)
    ? body.icon
    : "tag.svg";

  if (!name) {
    return NextResponse.json({ error: "Label name is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const { data: label, error } = await supabase
    .from("labels")
    .insert({ user_id: user.id, name, icon })
    .select("id,name,icon")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create label" }, { status: 500 });
  }

  const { error: linkError } = await supabase
    .from("note_labels")
    .insert({ note_id: id, label_id: label.id });

  if (linkError) {
    return NextResponse.json({ error: "Could not attach label" }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath(`/note/${id}`);
  return NextResponse.json({ label });
}

// Udskifter notens etiketter med de valgte etiketter, brugeren ejer.
export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const labelIds = Array.isArray(body?.labelIds)
    ? body.labelIds.filter((labelId) => typeof labelId === "string")
    : null;

  if (!labelIds) {
    return NextResponse.json({ error: "Invalid label ids" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const { data: ownedLabels } = await supabase
    .from("labels")
    .select("id")
    .eq("user_id", user.id)
    .in("id", labelIds);

  const ownedIds = new Set((ownedLabels ?? []).map((label) => label.id));
  const allowedIds = labelIds.filter((labelId) => ownedIds.has(labelId));

  await supabase
    .from("note_labels")
    .delete()
    .eq("note_id", id);

  if (allowedIds.length > 0) {
    const { error } = await supabase
      .from("note_labels")
      .insert(allowedIds.map((labelId) => ({
        note_id: id,
        label_id: labelId,
      })));

    if (error) {
      return NextResponse.json({ error: "Could not update labels" }, { status: 500 });
    }
  }

  revalidatePath("/");
  revalidatePath(`/note/${id}`);
  return NextResponse.json({ labelIds: allowedIds });
}
