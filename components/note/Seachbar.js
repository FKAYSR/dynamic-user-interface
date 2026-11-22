import styles from "./Seachbar.module.css";
import Link from "next/link";

export default function Seachbar() {
  return (
    <Link className={styles.container} href="/search" aria-label="Søg i noter">
      <span className={styles.text}>Søg i noter</span>
    </Link>
  );
}
