import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const icon = typeof body?.icon === "string"
    && /^[a-z0-9-]+(?:\/[a-z0-9-]+)?\.svg$/i.test(body.icon)
    ? body.icon
    : "tag.svg";

  if (!name) {
    return NextResponse.json({ error: "Label name is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .update({ name, icon })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id,name,icon")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not update label" }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/search");
  return NextResponse.json({ label: data });
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: label, error: labelLookupError } = await supabase
    .from("labels")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (labelLookupError) {
    return NextResponse.json({ error: "Could not verify label" }, { status: 500 });
  }
  if (!label) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 });
  }

  const { error: linksError } = await supabase
    .from("note_labels")
    .delete()
    .eq("label_id", id);
  if (linksError) {
    return NextResponse.json({ error: "Could not remove label links" }, { status: 500 });
  }

  const { error } = await supabase
    .from("labels")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: "Could not delete label" }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/search");
  return NextResponse.json({ id });
}
