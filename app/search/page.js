import SearchField from "../../components/search/SearchField";
import SearchItem from "../../components/search/SearchItem";
import Image from "next/image";
import styles from "./page.module.css";

const sections = [
  {
    title: "Etiketter",
    more: true,
    items: [
      ["Pakkelister", "/icons/home/box-iso.svg"],
      ["Koder", "/icons/tag.svg"],
      ["Indkøbslister", "/icons/food/cart.svg"],
      ["Rejser", "/icons/transport/airplane.svg"],
      ["Kager", "/icons/activities/birthday-cake.svg"],
      ["Gaming", "/icons/gaming/gamepad.svg"],
    ],
  },
  {
    title: "Typer",
    items: [
      ["Lister", "/icons/checkbox.svg"],
      ["Billeder", "/icons/image.svg"],
      ["Tegninger", "/icons/tegning.svg"],
    ],
  },
  {
    title: "Ting",
    items: [
      ["Bøger", "/icons/activities/bookmark-book.svg"],
      ["Mad", "/icons/cutlery.svg"],
      ["Musik", "/icons/headset.svg"],
      ["Steder", "/icons/pin.svg"],
    ],
  },
  {
    title: "Boards",
    more: true,
    items: [
      ["Fastelavn", "/icons/activities/magic-wand.svg", "var(--colors-sticky-notes-beige)"],
      ["Madklub", "/icons/cutlery.svg", "var(--colors-sticky-notes-grøn)"],
      ["Gutterne", "/icons/activities/beer.svg", "var(--colors-sticky-notes-fersken)"],
      ["Stjernetegn", "/icons/activities/sea-waves.svg", "var(--colors-sticky-notes-støvblå)"],
      ["Fugle kiggeri", "/icons/animals/apple-swift.svg", "var(--colors-sticky-notes-gul)"],
      ["Quizzer", "/icons/activities/quiz.svg", "var(--colors-sticky-notes-lavendel)"],
    ],
  },
];

const colors = [
  { name: "Standard", color: "var(--colors-neutral-100)", icon: "/icons/droplet.svg" },
  { name: "Lyserød", color: "var(--colors-sticky-notes-lyserød)" },
  { name: "Fersken", color: "var(--colors-sticky-notes-fersken)" },
  { name: "Gul", color: "var(--colors-sticky-notes-gul)" },
  { name: "Grøn", color: "var(--colors-sticky-notes-grøn)" },
  { name: "Turkis", color: "var(--colors-sticky-notes-turkis)" },
  { name: "Støvblå", color: "var(--colors-sticky-notes-støvblå)" },
  { name: "Blå", color: "var(--colors-sticky-notes-blå)" },
  { name: "Lavendel", color: "var(--colors-sticky-notes-lavendel)" },
  { name: "Beige", color: "var(--colors-sticky-notes-beige)" },
];

function SearchSection({ title, items, more = false }) {
  return (
    <section className={styles.section} aria-labelledby={`search-${title}`}>
      <div className={styles.sectionHeading}>
        <h2 id={`search-${title}`}>{title}</h2>
        {more && <button className={styles.moreButton} type="button">Mere</button>}
      </div>
      <div className={styles.itemRow}>
        {items.map(([name, icon, color]) => (
          <SearchItem key={name} title={name} icon={icon} color={color} />
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  return (
    <main className={styles.page}>
      <SearchField />
      <div className={styles.sections}>
        {sections.map((section) => <SearchSection key={section.title} {...section} />)}
        <section className={styles.colorSection} aria-labelledby="search-colors">
          <h2 id="search-colors">Farver</h2>
          <div className={styles.colorRow}>
            {colors.map(({ name, color, icon }) => (
              <button key={name} className={styles.colorButton} type="button" aria-label={`Søg efter ${name}`}>
                <span className={styles.colorSwatch} style={{ "--swatch-color": color }}>
                  {icon && <Image src={icon} alt="" width={24} height={24} />}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
