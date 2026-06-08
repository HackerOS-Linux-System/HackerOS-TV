import { invoke } from "@tauri-apps/api/core";
import type { SystemInfo } from "./types";

// ─── Tauri Command Bridge ─────────────────────────────────────────────────────
// Wraps all Rust commands with typed promises.

export const tauriApi = {
  openStream: (url: string, label: string, cinema: boolean): Promise<void> =>
    invoke("open_stream", { url, label, cinema }),

  closeStream: (label: string): Promise<void> =>
    invoke("close_stream", { label }),

  launchCageSession: (): Promise<string> =>
    invoke("launch_cage_session"),

  toggleFullscreen: (): Promise<void> =>
    invoke("toggle_fullscreen"),

  getSystemInfo: (): Promise<SystemInfo> =>
    invoke("get_system_info"),
};

// ─── isTauri guard ────────────────────────────────────────────────────────────
export const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

// ─── Fallback for browser preview ─────────────────────────────────────────────
export const openStreamFallback = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};
