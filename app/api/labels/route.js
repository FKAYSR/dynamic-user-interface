import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

// Henter alle etiketter, der tilhører den indloggede bruger.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .select("id,name,icon")
    .eq("user_id", user.id)
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Could not load labels" }, { status: 500 });
  }

  return NextResponse.json({ labels: data ?? [] });
}

// Opretter en etiket og opdaterer sider, der viser etiketlister.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    .insert({ user_id: user.id, name, icon })
    .select("id,name,icon")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create label" }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/search");
  return NextResponse.json({ label: data }, { status: 201 });
}
