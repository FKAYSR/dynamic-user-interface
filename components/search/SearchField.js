import Link from "next/link";
import Image from "next/image";
import styles from "./SearchField.module.css";

export default function SearchField({ placeholder = "Søg i Keep Noter", backHref = "/" }) {
  return (
    <form className={styles.searchBar} role="search">
      <Link className={styles.backButton} href={backHref} aria-label="Tilbage">
        <Image src="/icons/arrow-left.svg" alt="" width={24} height={24} />
      </Link>
      <input className={styles.input} type="search" placeholder={placeholder} aria-label={placeholder} />
    </form>
  );
}
