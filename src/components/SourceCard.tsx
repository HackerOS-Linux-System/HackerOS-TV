import React from "react";
import type { StreamSource } from "../types";
import styles from "./SourceCard.module.css";

interface SourceCardProps {
  source: StreamSource;
  onOpen: (source: StreamSource) => void;
  size?: "featured" | "normal" | "small";
  animDelay?: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  onOpen,
  size = "normal",
  animDelay = 0,
}) => {
  return (
    <button
      className={`${styles.card} ${styles[size]}`}
      style={{
        "--card-color": source.color,
        "--card-glow": source.color + "44",
        animationDelay: `${animDelay}ms`,
      } as React.CSSProperties}
      onClick={() => onOpen(source)}
      title={`Otwórz ${source.name}`}
    >
      {/* Gradient BG */}
      <div className={styles.bg} />

      {/* Glow */}
      <div className={styles.glow} />

      {/* Icon */}
      <div className={styles.iconWrap}>
        <span className={styles.icon}>{source.icon}</span>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <span className={styles.name}>{source.name}</span>
        <span className={styles.category}>
          {categoryLabel(source.category)}
        </span>
      </div>

      {/* Play indicator */}
      <div className={styles.playHint}>▶</div>

      {/* Category tag */}
      {source.featured && <div className={styles.featuredDot} />}
    </button>
  );
};

function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    streaming: "Streaming",
    sports: "Sport",
    social: "Live",
    custom: "Własne",
  };
  return map[cat] ?? cat;
}
