import { useState, useEffect, FC } from "react";
import styles from "./Topbar.module.css";

interface TopbarProps {
  view:             "home" | "browse" | "settings";
  onViewChange:     (v: "home" | "browse" | "settings") => void;
  onToggleFullscreen: () => void;
}

export const Topbar: FC<TopbarProps> = ({ view, onViewChange, onToggleFullscreen }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");

  return (
    <header className={styles.bar}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>◈</span>
        <span className={styles.logoText}>STREAM<em>BOX</em></span>
      </div>

      <nav className={styles.nav}>
        {(["home", "browse", "settings"] as const).map((v) => (
          <button
            key={v}
            className={`${styles.navBtn} ${view === v ? styles.navActive : ""}`}
            onClick={() => onViewChange(v)}
          >
            {v === "home" && "Główna"}
            {v === "browse" && "Przeglądaj"}
            {v === "settings" && "Ustawienia"}
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        <button className={styles.iconBtn} onClick={onToggleFullscreen} title="Pełny ekran (F)">⊞</button>
        <div className={styles.clock}>
          <span className={styles.clockH}>{hh}</span>
          <span className={styles.clockSep}>:</span>
          <span className={styles.clockM}>{mm}</span>
        </div>
      </div>
    </header>
  );
};
