import Image from "next/image";
import Searchbar from "@/components/note/Searchbar";
import HomeSidePanel from "./HomeSidePanel";
import styles from "./HomeHeader.module.css";
import { iconPath } from "@/lib/iconPath";

// Samler sidemenuen med søgning eller overskriften for den aktuelle visning.
export default function HomeHeader({ boards, labels, navigationKey, title, titleIcon }) {
  return (
    <header className={styles.header}>
      <HomeSidePanel
        key={navigationKey}
        navigationKey={navigationKey}
        boards={boards}
        labels={labels}
      />
      {title ? (
        <h1 className={styles.pageTitle}>
          {titleIcon && (
            <Image
              className={styles.pageTitleIcon}
              src={iconPath(titleIcon)}
              alt=""
              width={24}
              height={24}
            />
          )}
          {title}
        </h1>
      ) : (
        <>
          <Searchbar />
          <Image src={iconPath("sort.svg")} alt="" width={48} height={48} />
          <div className={styles.touchArea}>
            <div className={styles.avatar} />
          </div>
        </>
      )}
    </header>
  );
}
