import Image from "next/image";
import Seachbar from "@/components/note/Seachbar";
import HomeSidePanel from "./HomeSidePanel";
import styles from "./HomeHeader.module.css";
import { iconPath } from "../iconPath";

// Samler sidemenuen med søgning eller overskriften for den aktuelle visning.
export default function HomeHeader({ boards, labels, navigationKey, title }) {
  return (
    <header className={styles.header}>
      <HomeSidePanel
        key={navigationKey}
        navigationKey={navigationKey}
        boards={boards}
        labels={labels}
      />
      {title ? (
        <h1 className={styles.pageTitle}>{title}</h1>
      ) : (
        <>
          <Seachbar />
          <Image src={iconPath("sort.svg")} alt="" width={48} height={48} />
          <div className={styles.touchArea}>
            <div className={styles.avatar} />
          </div>
        </>
      )}
    </header>
  );
}
