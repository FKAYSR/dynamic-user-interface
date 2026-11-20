import styles from "./page.module.css";
import Seachbar from "@/components/note/Seachbar";
import NoteGrid from "@/components/note/NoteGrid";
import Image from "next/image";

const notes = [
  {
    id: "sample-note-1",
    title: "Planlæg næste workshop",
    content:
      "Saml idéer fra teamet, lav en kort agenda, og husk at sende materialet ud inden mødet. Der er mere tekst her, så kortet viser hvordan indholdet begrænses efter fem linjer.",
    sharedPerson: { name: "Alex Jensen" },
    color: "lavender",
  },
  {
    id: "sample-note-2",
    title: "Idéer til projektet",
    content:
      "En kort note uden delt person. Billede, person og farve er valgfri datafelter.",
    color: "yellow",
  },
];

export default function Home() {
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
        <NoteGrid notes={notes} />
      </main>
    </div>
  );
}
