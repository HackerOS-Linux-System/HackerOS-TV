import { useState, useEffect, useRef, FC } from "react";
import { api } from "../tauriApi";
import styles from "./SessionMenu.module.css";

interface SessionMenuProps {
  onGoHome: () => void;
}

export const SessionMenu: FC<SessionMenuProps> = ({ onGoHome }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Zamknij po kliknięciu poza menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const run = async (fn: () => Promise<unknown>) => {
    setOpen(false);
    try { await fn(); } catch (e) { console.error(e); }
  };

  return (
    <div className={styles.wrap} ref={ref}>
      {/* Menu popup — nad przyciskiem */}
      {open && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>StreamBox</div>

          <button className={styles.item} onClick={() => { setOpen(false); onGoHome(); }}>
            <span className={styles.itemIcon}>⌂</span>
            <span>Powrót do głównej</span>
            <span className={styles.itemHint}>Ctrl+Shift+B</span>
          </button>

          <div className={styles.divider} />

          <button className={styles.item} onClick={() => run(api.switchToDesktop)}>
            <span className={styles.itemIcon}>⬡</span>
            <span>Przełącz na środowisko graficzne</span>
            <span className={styles.itemHintSmall}>TTY2</span>
          </button>

          <div className={styles.divider} />

          <button className={styles.item} onClick={() => run(api.systemSuspend)}>
            <span className={styles.itemIcon}>◑</span>
            <span>Uśpij</span>
          </button>

          <button className={`${styles.item} ${styles.itemWarn}`} onClick={() => run(api.systemReboot)}>
            <span className={styles.itemIcon}>↺</span>
            <span>Uruchom ponownie</span>
          </button>

          <button className={`${styles.item} ${styles.itemDanger}`} onClick={() => run(api.systemPoweroff)}>
            <span className={styles.itemIcon}>⏻</span>
            <span>Wyłącz komputer</span>
          </button>
        </div>
      )}

      {/* Trigger button */}
      <button
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
        title="Menu (Ctrl+Shift+M)"
      >
        ☰
      </button>
    </div>
  );
};
