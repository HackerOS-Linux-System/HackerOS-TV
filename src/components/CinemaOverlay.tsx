import React, { useEffect } from "react";
import { tauriApi, isTauri } from "../tauriApi";
import styles from "./CinemaOverlay.module.css";

interface CinemaOverlayProps {
  onDismiss: () => void;
  onLaunchCage: () => void;
  cageAvailable: boolean;
}

export const CinemaOverlay: React.FC<CinemaOverlayProps> = ({
  onDismiss,
  onLaunchCage,
  cageAvailable,
}) => {
  // ESC to dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);

  const handleFullscreen = async () => {
    if (isTauri()) {
      await tauriApi.toggleFullscreen();
    }
    onDismiss();
  };

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Scanline effect */}
        <div className={styles.scanline} />

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerIcon}>◈</span>
          <div>
            <h2 className={styles.title}>TRYB KINO</h2>
            <p className={styles.subtitle}>Wybierz tryb wyświetlania</p>
          </div>
        </div>

        {/* Options */}
        <div className={styles.options}>
          {/* Fullscreen option */}
          <button className={styles.optionBtn} onClick={handleFullscreen}>
            <div className={styles.optionIcon}>⊞</div>
            <div className={styles.optionInfo}>
              <span className={styles.optionName}>Pełny ekran</span>
              <span className={styles.optionDesc}>
                Maximizuje okno Tauri — działa na X11 i Wayland
              </span>
            </div>
            <div className={styles.optionArrow}>→</div>
          </button>

          {/* Cage compositor option */}
          <button
            className={`${styles.optionBtn} ${!cageAvailable ? styles.optionDisabled : ""}`}
            onClick={cageAvailable ? onLaunchCage : undefined}
          >
            <div className={`${styles.optionIcon} ${styles.cageIcon}`}>⬡</div>
            <div className={styles.optionInfo}>
              <span className={styles.optionName}>
                Cage Compositor
                {!cageAvailable && (
                  <span className={styles.notAvail}> — nie znaleziono</span>
                )}
              </span>
              <span className={styles.optionDesc}>
                <code>cage -d</code> — dedykowany compositor Wayland,{" "}
                uruchamia StreamBox jako jedyną aplikację
              </span>
              {!cageAvailable && (
                <span className={styles.installHint}>
                  sudo apt install cage
                </span>
              )}
            </div>
            <div className={styles.optionArrow}>→</div>
          </button>
        </div>

        {/* Footer hint */}
        <div className={styles.footer}>
          <span className={styles.footerKey}>ESC</span>
          <span className={styles.footerLabel}>aby zamknąć</span>
        </div>
      </div>
    </div>
  );
};
