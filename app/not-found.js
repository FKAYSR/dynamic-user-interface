import Link from "next/link";
import styles from "./status.module.css";

// Viser en forklaring og en vej tilbage, når ruten ikke findes.
export default function NotFound() {
  return (
    <main className={styles.page} aria-labelledby="not-found-heading">
      <section className={styles.card}>
        <div className={styles.content}>
          <h1 id="not-found-heading">Side ikke fundet</h1>
          <p>Vi kunne ikke finde det, du ledte efter.</p>
          <Link className={styles.primaryButton} href="/">
            Gå tilbage til forsiden
          </Link>
        </div>
      </section>
    </main>
  );
}
