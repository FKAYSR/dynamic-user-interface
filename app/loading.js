import styles from "./status.module.css";

// Viser en kort status, mens en side venter på at blive indlæst.
export default function Loading() {
  return (
    <main className={styles.page} aria-label="Indlæser side">
      <section className={styles.card} role="status">
        <p className={styles.message}>Indlæser…</p>
      </section>
    </main>
  );
}
