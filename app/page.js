import styles from "./page.module.css";
import Seachbar from "@/components/note/Seachbar";
import NoteGrid from "@/components/note/NoteGrid";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const instant = false;

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.onboarding_complete !== true) {
    redirect("/preboarding");
  }

  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, title, content, color, type, pinned, archived, created_at")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const noteCards = (notes ?? []).map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    color: note.color || "standard",
  }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Image
          src="/icons/burger-menu.svg"
          alt="burgermenu"
          width={48}
          height={48}
        />
        <Seachbar />
        <Image src="/icons/sort.svg" alt="sorter" width={48} height={48} />
        <div className={styles.touchArea}>
          <div className={styles.avatar}></div>
        </div>
      </header>
      <main className={styles.main}>
        <NoteGrid notes={noteCards} />
      </main>
    </div>
  );
}
