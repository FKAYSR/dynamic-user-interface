import styles from "./Seachbar.module.css";

export default function Seachbar() {
  return (
    <div className={styles.container}>
      <span className={styles.text}>Søg i noter</span>
    </div>
  );
}
