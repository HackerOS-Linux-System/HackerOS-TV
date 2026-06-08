import React from "react";
import type { SystemInfo } from "../types";
import styles from "./SettingsView.module.css";

interface SettingsViewProps {
  sysInfo: SystemInfo | null;
  onRefreshSysInfo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  sysInfo,
  onRefreshSysInfo,
}) => {
  return (
    <div className={styles.view}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>USTAWIENIA</h1>

        {/* System info */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span>⬡</span> Informacje systemowe
          </h2>
          {sysInfo ? (
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>System</span>
                <span className={styles.infoVal}>{sysInfo.os} / {sysInfo.arch}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Wyświetlacz</span>
                <span className={styles.infoVal}>{sysInfo.display}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Protokół</span>
                <span className={`${styles.infoVal} ${sysInfo.wayland ? styles.green : styles.muted}`}>
                  {sysInfo.wayland ? "✓ Wayland" : "X11 (brak Wayland)"}
                </span>
              </div>
            </div>
          ) : (
            <p className={styles.noInfo}>Brak danych — uruchom w Tauri</p>
          )}
          <button className={styles.refreshBtn} onClick={onRefreshSysInfo}>
            ↺ Odśwież
          </button>
        </section>

        {/* Cage info */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span>◎</span> Cage Compositor
          </h2>
          <p className={styles.cardDesc}>
            <strong>Cage</strong> to minimalistyczny compositor Wayland (kiosk-mode),
            idealny do sesji streamingowej. W trybie kino StreamBox uruchamia:
          </p>
          <div className={styles.codeBlock}>
            <code>cage -d -- streambox</code>
          </div>
          <ul className={styles.infoList}>
            <li><span className={styles.dot}>·</span> <code>-d</code> wyłącza DPMS (wygaszanie ekranu)</li>
            <li><span className={styles.dot}>·</span> Cage izoluje sesję — brak paska zadań, brak alt+tab</li>
            <li><span className={styles.dot}>·</span> Działa na GPU via DRM/KMS (bez XWayland)</li>
          </ul>
          <div className={styles.installBlock}>
            <span className={styles.installLabel}>Instalacja</span>
            <code className={styles.installCmd}>sudo apt install cage</code>
          </div>
        </section>

        {/* WebView info */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span>▶</span> WebView / Platformy
          </h2>
          <p className={styles.cardDesc}>
            Każda platforma otwiera się w osobnym oknie Tauri WebView (WebKit2GTK na Linuksie,
            WKWebView na macOS). WebView ma pełny dostęp do DRM — Disney+, Netflix i Prime Video
            wymagają <strong>Widevine CDM</strong>.
          </p>
          <div className={styles.infoGrid} style={{ marginTop: 12 }}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Linux / DRM</span>
              <span className={styles.infoVal}>Wymaga <code>chromium</code> lub <code>ungoogled-chromium</code> z Widevine</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>YouTube / Twitch</span>
              <span className={`${styles.infoVal} ${styles.green}`}>✓ Działa od razu</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Dowolny URL</span>
              <span className={`${styles.infoVal} ${styles.green}`}>✓ Wpisz w wyszukiwarce</span>
            </div>
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span>⌨</span> Skróty klawiszowe
          </h2>
          <div className={styles.shortcuts}>
            {[
              ["F", "Pełny ekran"],
              ["ESC", "Wyjście z trybu / zamknij overlay"],
              ["Enter", "Otwórz URL z wyszukiwarki"],
              ["Ctrl+Q", "Zamknij StreamBox"],
            ].map(([key, label]) => (
              <div key={key} className={styles.shortcutRow}>
                <span className={styles.shortcutKey}>{key}</span>
                <span className={styles.shortcutLabel}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.version}>
          StreamBox v0.1.0 · Tauri 2 · React · Rust
        </div>
      </div>
    </div>
  );
};
