import styles from "./SearchItem.module.css";
import Image from "next/image";

export default function SearchItem({ title, icon, color, onClick }) {
  return (
    <button className={styles.item} type="button" aria-label={`Søg efter ${title}`} onClick={onClick}>
      <span className={styles.iconCircle} style={color ? { "--item-color": color } : undefined}>
        <Image
          className={title === "Tekst" ? styles.textIcon : undefined}
          src={icon}
          alt=""
          width={24}
          height={24}
        />
      </span>
      <span className={styles.title}>{title}</span>
    </button>
  );
}
