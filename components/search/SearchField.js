import Link from "next/link";
import Image from "next/image";
import styles from "./SearchField.module.css";

// Viser et søgefelt med tilbage-link og sender formularen videre til søgeren.
export default function SearchField({
  placeholder = "Søg i Keep Noter",
  backHref = "/",
  value = "",
  onChange,
  onSubmit,
}) {
  return (
    <form
      className={styles.searchBar}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Link className={styles.backButton} href={backHref} aria-label="Tilbage">
        <Image src="/icons/arrow-left.svg" alt="" width={48} height={48} />
      </Link>
      <input
        className={styles.input}
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </form>
  );
}
