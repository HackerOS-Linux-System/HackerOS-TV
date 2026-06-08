import React, { useState, useEffect } from "react";
import { tauriApi, isTauri } from "../tauriApi";
import type { SystemInfo } from "../types";
import styles from "./Topbar.module.css";

interface TopbarProps {
  cinemaMode: boolean;
  onToggleCinema: () => void;
  onToggleFullscreen: () => void;
  view: "home" | "browse" | "settings";
  onViewChange: (v: "home" | "browse" | "settings") => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  cinemaMode,
  onToggleCinema,
  onToggleFullscreen,
  view,
  onViewChange,
}) => {
  const [time, setTime] = useState(new Date());
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (isTauri()) {
      tauriApi.getSystemInfo().then(setSysInfo).catch(() => {});
    }
  }, []);

  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");

  return (
    <header className={styles.bar}>
      {/* ── Logo ── */}
      <div className={styles.logo}>
        <span className={styles.logoMark}>◈</span>
        <span className={styles.logoText}>STREAM<em>BOX</em></span>
      </div>

      {/* ── Nav ── */}
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

      {/* ── Right controls ── */}
      <div className={styles.right}>
        {sysInfo && (
          <span className={`${styles.badge} ${sysInfo.wayland ? styles.badgeGreen : styles.badgeGray}`}>
            {sysInfo.wayland ? "WAYLAND" : "X11"}
          </span>
        )}

        <button
          className={`${styles.iconBtn} ${cinemaMode ? styles.iconBtnActive : ""}`}
          onClick={onToggleCinema}
          title="Tryb kino"
        >
          ◑
        </button>

        <button
          className={styles.iconBtn}
          onClick={onToggleFullscreen}
          title="Pełny ekran (F)"
        >
          ⊞
        </button>

        <div className={styles.clock}>
          <span className={styles.clockH}>{hh}</span>
          <span className={styles.clockSep}>:</span>
          <span className={styles.clockM}>{mm}</span>
        </div>
      </div>
    </header>
  );
};
