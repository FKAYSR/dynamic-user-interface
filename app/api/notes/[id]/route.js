import { NextResponse } from "next/server";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import noteColors from "@/components/note/noteColors";
import { revalidatePath } from "next/cache";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  if (body?.action === "archive") {
    if (typeof id !== "string") {
      return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const { data: note, error } = await supabase
      .from("notes")
      .update({ archived: true })
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Could not archive note" }, { status: 500 });
    }
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath(`/note/${id}`);

    return NextResponse.json({ id: note.id });
  }

  const validColor = noteColors.some((color) => color.id === body?.color);

  if (
    typeof id !== "string"
    || typeof body?.title !== "string"
    || !Array.isArray(body?.content)
    || !validColor
    || !["blank", "lined"].includes(body?.paper)
    || !["text", "checklist", "mixed"].includes(body?.type)
  ) {
    return NextResponse.json({ error: "Invalid note data" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("notes")
    .update({
      title: body.title,
      content: body.content,
      color: body.color,
      paper: body.paper,
      type: body.type,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not save note" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/note/${id}`);

  return NextResponse.json({ id });
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const deletedAt = new Date().toISOString();
  const { data: note, error } = await supabase
    .from("notes")
    .update({ archived: true, deleted_at: deletedAt })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select("id,deleted_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not move note to recycle bin" }, { status: 500 });
  }
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/trash");
  revalidatePath(`/note/${id}`);

  return NextResponse.json({ id: note.id, deletedAt: note.deleted_at });
}
