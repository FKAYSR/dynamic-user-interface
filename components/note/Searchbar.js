import styles from "./Searchbar.module.css";
import Link from "next/link";

// Linker fra hovednavigationen til siden med søgefiltre.
export default function Searchbar() {
  return (
    <Link className={styles.container} href="/search" aria-label="Søg i noter">
      <span className={styles.text}>Søg i noter</span>
    </Link>
  );
}
