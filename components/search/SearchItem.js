import styles from "./SearchItem.module.css";
import Image from "next/image";

export default function SearchItem({ title, icon, color }) {
  return (
    <button className={styles.item} type="button" aria-label={title}>
      <span className={styles.iconCircle} style={color ? { "--item-color": color } : undefined}>
        <Image src={icon} alt="" width={24} height={24} />
      </span>
      <span className={styles.title}>{title}</span>
    </button>
  );
}
