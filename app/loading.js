import styles from "./status.module.css";

export default function Loading() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-live="polite">
        <p className={styles.message}>Indlæser…</p>
      </section>
    </main>
  );
}
