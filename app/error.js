"use client";

import styles from "./status.module.css";

export default function Error({ reset }) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.content}>
          <h1>Noget gik galt...</h1>
          <p>Vi kunne ikke hente dit indhold.</p>
          <button className={styles.primaryButton} onClick={() => reset()}>
            Prøv igen
          </button>
        </div>
      </section>
    </main>
  );
}
