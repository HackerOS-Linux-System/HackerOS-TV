import { useState, useEffect, useCallback } from "react";
import { Topbar } from "./components/Topbar";
import { HomeView } from "./components/HomeView";
import { BrowseView } from "./components/BrowseView";
import { SettingsView } from "./components/SettingsView";
import { CinemaOverlay } from "./components/CinemaOverlay";
import { Toast, type ToastMessage } from "./components/Toast";
import { tauriApi, isTauri, openStreamFallback } from "./tauriApi";
import type { StreamSource, SystemInfo } from "./types";
import styles from "./App.module.css";

let toastCounter = 0;

export default function App() {
  // ── State ────────────────────────────────────────────────────────────────
  const [view, setView] = useState<"home" | "browse" | "settings">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showCinemaOverlay, setShowCinemaOverlay] = useState(false);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [cageAvailable, setCageAvailable] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const addToast = useCallback((text: string, type: ToastMessage["type"] = "info") => {
    const id = `t${++toastCounter}`;
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── System info ────────────────────────────────────────────────────────────
  const fetchSysInfo = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const info = await tauriApi.getSystemInfo();
      setSysInfo(info);
      // Check cage availability (heuristic: wayland available)
      setCageAvailable(info.wayland);
    } catch {
      console.warn("Cannot fetch system info");
    }
  }, []);

  useEffect(() => {
    fetchSysInfo();
  }, [fetchSysInfo]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        handleToggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Open platform ─────────────────────────────────────────────────────────
  const handleOpenSource = useCallback(
    async (source: StreamSource) => {
      if (isTauri()) {
        try {
          await tauriApi.openStream(source.url, source.id, cinemaMode);
          addToast(`Otwarto ${source.name}`, "success");
        } catch (err) {
          addToast(`Błąd: ${err}`, "error");
        }
      } else {
        openStreamFallback(source.url);
        addToast(`Otwarto ${source.name} (tryb przeglądarki)`, "info");
      }
    },
    [cinemaMode, addToast]
  );

  // ── Open URL ──────────────────────────────────────────────────────────────
  const handleOpenUrl = useCallback(
    async (url: string) => {
      const label = `custom_${Date.now()}`;
      if (isTauri()) {
        try {
          await tauriApi.openStream(url, label, cinemaMode);
          addToast("Otworzono URL", "success");
        } catch (err) {
          addToast(`Błąd: ${err}`, "error");
        }
      } else {
        openStreamFallback(url);
      }
    },
    [cinemaMode, addToast]
  );

  // ── Cinema mode ────────────────────────────────────────────────────────────
  const handleToggleCinema = () => {
    if (!cinemaMode) {
      setShowCinemaOverlay(true);
    } else {
      setCinemaMode(false);
      addToast("Tryb kino wyłączony", "info");
    }
  };

  const handleToggleFullscreen = async () => {
    if (isTauri()) {
      await tauriApi.toggleFullscreen();
    }
  };

  const handleLaunchCage = async () => {
    setShowCinemaOverlay(false);
    setCinemaMode(true);
    if (isTauri()) {
      try {
        const result = await tauriApi.launchCageSession();
        addToast(result, "success");
      } catch (err) {
        addToast(`Cage: ${err}`, "error");
        setCinemaMode(false);
      }
    } else {
      addToast("Cage dostępny tylko w Tauri", "error");
      setCinemaMode(false);
    }
  };

  const handleCinemaOverlayDismiss = () => {
    setShowCinemaOverlay(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.app} ${cinemaMode ? styles.cinemaActive : ""}`}>
      {/* Background noise/grain effect */}
      <div className={styles.grain} aria-hidden />

      {/* Top navigation bar */}
      <Topbar
        cinemaMode={cinemaMode}
        onToggleCinema={handleToggleCinema}
        onToggleFullscreen={handleToggleFullscreen}
        view={view}
        onViewChange={setView}
      />

      {/* Main content area */}
      <main className={styles.main}>
        {view === "home" && (
          <HomeView
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenSource={handleOpenSource}
            onOpenUrl={handleOpenUrl}
            cinemaMode={cinemaMode}
          />
        )}
        {view === "browse" && (
          <BrowseView onOpenSource={handleOpenSource} />
        )}
        {view === "settings" && (
          <SettingsView
            sysInfo={sysInfo}
            onRefreshSysInfo={fetchSysInfo}
          />
        )}
      </main>

      {/* Cinema mode overlay */}
      {showCinemaOverlay && (
        <CinemaOverlay
          onDismiss={handleCinemaOverlayDismiss}
          onLaunchCage={handleLaunchCage}
          cageAvailable={cageAvailable}
        />
      )}

      {/* Toasts */}
      <Toast messages={toasts} onDismiss={dismissToast} />
    </div>
  );
}
