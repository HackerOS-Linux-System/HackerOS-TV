import { useState, useEffect, useCallback } from "react";
import { Topbar }       from "./components/Topbar";
import { HomeView }     from "./components/HomeView";
import { BrowseView }   from "./components/BrowseView";
import { SettingsView } from "./components/SettingsView";
import { SessionMenu }  from "./components/SessionMenu";
import { Toast }        from "./components/Toast";
import { api, isTauri } from "./tauriApi";
import type { StreamSource, AppConfig, ToastMsg } from "./types";
import styles from "./App.module.css";

// ─── Default config (używany przed załadowaniem z Rust) ────────────────────────
const DEFAULT_CONFIG: AppConfig = {
  sources: [], default_window_w: 1280, default_window_h: 720,
  remember_position: true, language: "pl",
  tls_accept_invalid: true,
  user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  session_switch_tty: 2,
};

let toastId = 0;

export default function App() {
  const [config,      setConfig]      = useState<AppConfig>(DEFAULT_CONFIG);
  const [sessionMode, setSessionMode] = useState(false);
  const [view,        setView]        = useState<"home" | "browse" | "settings">("home");
  const [search,      setSearch]      = useState("");
  const [toasts,      setToasts]      = useState<ToastMsg[]>([]);
  const [loaded,      setLoaded]      = useState(false);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((text: string, type: ToastMsg["type"] = "info") => {
    const id = `t${++toastId}`;
    setToasts((p) => [...p, { id, text, type }]);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // ── Load config + session mode from Rust ─────────────────────────────────
  useEffect(() => {
    if (!isTauri()) { setLoaded(true); return; }
    Promise.all([api.getConfig(), api.isSessionMode()])
      .then(([cfg, session]) => {
        setConfig(cfg);
        setSessionMode(session);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  const goBackToMain = useCallback(() => {
    if (!isTauri()) return;
    api.goBackToMain().catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // F — fullscreen (normalny tryb)
      if (e.key === "f" || e.key === "F") {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          if (isTauri()) api.toggleFullscreen();
        }
      }
      // Ctrl+Shift+B — back to main (session)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        if (sessionMode) goBackToMain();
      }
      // Ctrl+Shift+M — session menu (obsługiwane przez SessionMenu)
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sessionMode, goBackToMain]);

  // ── Open stream ──────────────────────────────────────────────────────────
  const handleOpenSource = useCallback(async (src: StreamSource) => {
    if (isTauri()) {
      try { await api.openStream(src.url, src.id); }
      catch (e) { addToast(`Błąd: ${e}`, "error"); }
    } else {
      window.open(src.url, "_blank", "noopener");
    }
  }, [addToast]);

  const handleOpenUrl = useCallback(async (url: string) => {
    const label = `custom_${Date.now()}`;
    if (isTauri()) {
      try { await api.openStream(url, label); }
      catch (e) { addToast(`Błąd: ${e}`, "error"); }
    } else {
      window.open(url, "_blank", "noopener");
    }
  }, [addToast]);

  // ── Save config ──────────────────────────────────────────────────────────
  const handleSaveConfig = useCallback(async (cfg: AppConfig) => {
    if (isTauri()) await api.saveConfig(cfg);
    setConfig(cfg);
  }, []);

  if (!loaded) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingIcon}>◈</span>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.grain} aria-hidden />

      {/* W session mode nie pokazujemy topbara */}
      {!sessionMode && (
        <Topbar
          view={view}
          onViewChange={setView}
          onToggleFullscreen={() => isTauri() && api.toggleFullscreen()}
        />
      )}

      <main className={styles.main}>
        {view === "home" && (
          <HomeView
            config={config}
            searchQuery={search}
            onSearchChange={setSearch}
            onOpenSource={handleOpenSource}
            onOpenUrl={handleOpenUrl}
          />
        )}
        {view === "browse" && (
          <BrowseView config={config} onOpenSource={handleOpenSource} />
        )}
        {view === "settings" && (
          <SettingsView
            config={config}
            onConfigSave={handleSaveConfig}
            addToast={addToast}
          />
        )}
      </main>

      {/* Session mode: menu w lewym dolnym rogu */}
      {sessionMode && (
        <SessionMenu onGoHome={goBackToMain} />
      )}

      <Toast messages={toasts} onDismiss={dismissToast} />
    </div>
  );
}
