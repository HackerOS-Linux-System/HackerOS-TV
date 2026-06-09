import { FC } from "react";
import { SourceCard } from "./SourceCard";
import type { StreamSource, AppConfig, SourceCategory } from "../types";
import { CATEGORY_LABELS } from "../types";
import styles from "./BrowseView.module.css";

interface BrowseViewProps {
  config:       AppConfig;
  onOpenSource: (src: StreamSource) => void;
}

export const BrowseView: FC<BrowseViewProps> = ({ config, onOpenSource }) => {
  const categories = Array.from(new Set(config.sources.map((s) => s.category))) as SourceCategory[];
  return (
    <div className={styles.view}>
      <h1 className={styles.pageTitle}>PRZEGLĄDAJ</h1>
      {categories.map((cat) => {
        const items = config.sources.filter((s) => s.category === cat);
        return (
          <section key={cat} className={styles.section}>
            <h2 className={styles.catTitle}>{CATEGORY_LABELS[cat]}</h2>
            <div className={styles.grid}>
              {items.map((s, i) => (
                <SourceCard key={s.id} source={s} onOpen={onOpenSource} size="normal" animDelay={i * 40} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
