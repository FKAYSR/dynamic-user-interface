"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SearchField from "./SearchField";
import SearchItem from "./SearchItem";
import styles from "@/app/search/page.module.css";

// Filtrerer forslag lokalt og åbner den valgte søgning eller filtrering.
export default function SearchBrowser({ labels, types, colors }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("da-DK");

  const filteredLabels = labels.filter((label) =>
    normalizedQuery
      ? label.name.toLocaleLowerCase("da-DK").includes(normalizedQuery)
      : true,
  );
  const filteredTypes = types.filter((type) =>
    normalizedQuery
      ? type.name.toLocaleLowerCase("da-DK").includes(normalizedQuery)
      : true,
  );
  const filteredColors = colors.filter((color) =>
    normalizedQuery
      ? color.name.toLocaleLowerCase("da-DK").includes(normalizedQuery)
      : true,
  );

  // Sender den indtastede tekst til forsiden, hvor noter filtreres.
  function submitSearch() {
    const value = query.trim();
    router.push(value ? `/?q=${encodeURIComponent(value)}` : "/");
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.pageHeading}>Søg</h1>
      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={submitSearch}
      />
      <div className={styles.sections}>
        {filteredLabels.length > 0 && (
          <section className={styles.section} aria-labelledby="search-labels">
            <div className={styles.sectionHeading}>
              <h2 id="search-labels">Etiketter</h2>
            </div>
            <div className={styles.itemRow}>
              {filteredLabels.map((label) => (
                <SearchItem
                  key={label.id}
                  title={label.name}
                  icon={`/icons/${label.icon || "tag.svg"}`}
                  onClick={() => router.push(`/?label=${encodeURIComponent(label.id)}`)}
                />
              ))}
            </div>
          </section>
        )}

        {filteredTypes.length > 0 && (
          <section className={styles.section} aria-labelledby="search-types">
            <div className={styles.sectionHeading}>
              <h2 id="search-types">Typer</h2>
            </div>
            <div className={styles.itemRow}>
              {filteredTypes.map((type) => (
                <SearchItem
                  key={type.id}
                  title={type.name}
                  icon={type.icon}
                  onClick={() => router.push(`/?type=${encodeURIComponent(type.id)}`)}
                />
              ))}
            </div>
          </section>
        )}

        {filteredColors.length > 0 && (
          <section className={styles.colorSection} aria-labelledby="search-colors">
            <h2 id="search-colors">Farver</h2>
            <div className={styles.colorRow}>
              {filteredColors.map((color) => (
                <button
                  key={color.id}
                  className={styles.colorButton}
                  type="button"
                  aria-label={`Søg efter ${color.name}`}
                  onClick={() => router.push(`/?color=${encodeURIComponent(color.id)}`)}
                >
                  <span
                    className={styles.colorSwatch}
                    style={{ "--swatch-color": color.value }}
                  >
                    {color.icon && (
                      <img src={`/icons/${color.icon}`} alt="" width={24} height={24} />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        {filteredLabels.length === 0 && filteredTypes.length === 0 && filteredColors.length === 0 && (
          <p className={styles.emptyState} role="status">
            Ingen filtre matcher din søgning.
          </p>
        )}
      </div>
    </main>
  );
}
