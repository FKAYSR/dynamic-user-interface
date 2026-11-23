"use client";

import { useState } from "react";
import noteColors from "@/components/note/noteColors";
import styles from "./page.module.css";

// Styrer onboardingens trin, farvevalg og profilformular.
export default function PreboardingFlow({
  fromLogin,
  completionError,
  completePreboarding,
}) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);
  const [colorPanelOpen, setColorPanelOpen] = useState(false);

  // Gemmer farvevalget og lukker listen over farver.
  function selectColor(color) {
    setSelectedColor(color);
    setColorPanelOpen(false);
  }

  // Føjer valgene til formularen og gemmer farven lokalt til forhåndsvisning.
  function prepareColorPreference(formData) {
    formData.set("firstName", firstName);
    formData.set("defaultColorId", selectedColor.id);
    formData.set("defaultColorValue", selectedColor.value);
    document.documentElement.style.setProperty("--baggrund", selectedColor.value);
    window.localStorage.setItem("defaultNoteColor", selectedColor.value);
    window.localStorage.setItem("defaultNoteColorId", selectedColor.id);
  }

  return (
    <main className={`${styles.page} ${step === 2 ? styles.secondStep : ""}`}>
      {fromLogin && step === 1 && (
        <section
          className={styles.loginPreview}
          aria-label="Tidligere login-side"
          aria-hidden="true"
        >
          <h2>Log in</h2>
          <p>Skriv email og adgangskode for at logge ind</p>
          <div className={styles.previewField}>
            <span>Email</span>
            <div />
          </div>
          <div className={styles.previewField}>
            <span>Adgangskode</span>
            <div />
          </div>
        </section>
      )}

      {step === 1 ? (
        <section className={styles.welcomeCard} data-node-id="545:2464">
          <h1>Velkommen!</h1>
          <p>Vi er så glade for at du har valgt at bruge Notes.</p>
          <p>
            For at sikre den bedste oplevelse, skal du vælge dit personlige
            udseende til appen
          </p>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setStep(2)}
          >
            Næste
          </button>
        </section>
      ) : (
        <form
          className={styles.personalCard}
          action={async (formData) => {
            prepareColorPreference(formData);
            await completePreboarding(formData);
          }}
          data-node-id="737:5095"
        >
          <header className={styles.heading}>
            <h1>Dit personlige udtryk</h1>
            <p>Du kan altid ændre standardudtrykket i indstillinger</p>
          </header>

          {completionError && (
            <p className={styles.formError} role="alert">
              Fornavn og standardfarve skal vælges.
            </p>
          )}

          <label className={styles.nameField}>
            <span>Fornavn</span>
            <input
              name="firstName"
              type="text"
              placeholder="fx Jens"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              required
            />
          </label>

          <div className={styles.standardChoice}>
            <div>
              <strong>Vælg standardfarve</strong>
              <span>Systemfarve og papirfarve</span>
            </div>
            <button
              className={styles.colorChoice}
              type="button"
              aria-label={`Vælg standardfarve, ${selectedColor.name}`}
              aria-expanded={colorPanelOpen}
              aria-controls="onboarding-color-panel"
              onClick={() => setColorPanelOpen(true)}
            >
              <span className={styles.colorCircleFrame}>
                <span
                  className={styles.colorCircle}
                  style={{ backgroundColor: selectedColor.value }}
                />
              </span>
              <span className={styles.colorName}>{selectedColor.name}</span>
            </button>
          </div>

          <section className={styles.examples} aria-label="Eksempler">
            <p>Eksempler:</p>
            <div className={styles.exampleGrid}>
              <article
                className={styles.exampleCard}
                style={{ backgroundColor: selectedColor.value }}
              >
                <strong>Huskeliste</strong>
                <ul>
                  <li><span />Toilettaske</li>
                  <li><span />Børste</li>
                  <li><span />Nattøj</li>
                </ul>
                <small>+ 9 markerede elementer</small>
              </article>
              <article
                className={styles.exampleCard}
                style={{ backgroundColor: selectedColor.value }}
              >
                <strong>Mulige praktikpladser</strong>
                <p>
                  <del>Naturhistorisk museum UX/frontend</del>
                  <br />
                  Fairplan UX/Design
                </p>
              </article>
            </div>
          </section>

          <button
            className={styles.primaryButton}
            type="submit"
            style={{ backgroundColor: selectedColor.value }}
          >
            Færdig
          </button>
        </form>
      )}

      {colorPanelOpen && (
        <>
          <button
            className={styles.colorBackdrop}
            type="button"
            aria-label="Luk farvevalg"
            onClick={() => setColorPanelOpen(false)}
          />
          <section
            id="onboarding-color-panel"
            className={styles.colorPanel}
            aria-label="Vælg farve"
          >
            <h2>Farver</h2>
            <div className={styles.colorOptions}>
              {noteColors.map((color) => (
                <button
                  type="button"
                  key={color.id}
                  aria-label={color.name}
                  aria-pressed={selectedColor.id === color.id}
                  className={styles.colorOption}
                  style={{ backgroundColor: color.value }}
                  onClick={() => selectColor(color)}
                >
                  {selectedColor.id === color.id && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
