import React from "react";
import { STREAM_SOURCES, CATEGORY_LABELS } from "../sources";
import { SourceCard } from "./SourceCard";
import type { StreamSource } from "../types";
import styles from "./BrowseView.module.css";

interface BrowseViewProps {
  onOpenSource: (source: StreamSource) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({ onOpenSource }) => {
  const categories = Array.from(new Set(STREAM_SOURCES.map((s) => s.category)));

  return (
    <div className={styles.view}>
      <h1 className={styles.pageTitle}>PRZEGLĄDAJ</h1>

      {categories.map((cat) => {
        const items = STREAM_SOURCES.filter((s) => s.category === cat);
        return (
          <section key={cat} className={styles.section}>
            <h2 className={styles.catTitle}>{CATEGORY_LABELS[cat]}</h2>
            <div className={styles.grid}>
              {items.map((s, i) => (
                <SourceCard
                  key={s.id}
                  source={s}
                  onOpen={onOpenSource}
                  size="normal"
                  animDelay={i * 40}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
