"use client";

import { useEffect } from "react";
import styles from "./status.module.css";

// Logger den uventede fejl og giver brugeren mulighed for at prøve igen.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("En sidefejl opstod:", error);
  }, [error]);

  return (
    <main className={styles.page} aria-labelledby="error-heading">
      <section className={styles.card}>
        <div className={styles.content}>
          <h1 id="error-heading">Noget gik galt...</h1>
          <p>Vi kunne ikke hente dit indhold.</p>
          <button className={styles.primaryButton} type="button" onClick={() => reset()}>
            Prøv igen
          </button>
        </div>
      </section>
    </main>
  );
}
