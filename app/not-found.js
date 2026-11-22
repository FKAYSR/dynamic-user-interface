import Link from "next/link";
import styles from "./status.module.css";

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.content}>
          <h1>Side ikke fundet</h1>
          <p>Vi kunne ikke finde det, du ledte efter.</p>
          <Link className={styles.primaryButton} href="/">
            Gå tilbage til forsiden
          </Link>
        </div>
      </section>
    </main>
  );
}
