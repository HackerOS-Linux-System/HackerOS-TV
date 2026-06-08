export interface StreamSource {
  id: string;
  name: string;
  url: string;
  icon: string;          // emoji or icon name
  color: string;         // accent color hex
  category: SourceCategory;
  featured?: boolean;
}

export type SourceCategory = "streaming" | "sports" | "social" | "custom";

export interface RecentItem {
  id: string;
  sourceId: string;
  sourceName: string;
  url: string;
  timestamp: number;
  title?: string;
}

export interface AppState {
  activeSource: StreamSource | null;
  cinemaMode: boolean;
  searchQuery: string;
  systemInfo: SystemInfo | null;
  recentItems: RecentItem[];
  customUrl: string;
  view: "home" | "browse" | "settings";
  cageAvailable: boolean;
}

export interface SystemInfo {
  wayland: boolean;
  display: string;
  os: string;
  arch: string;
}

// ─── Tauri Command Wrappers ────────────────────────────────────────────────────

export interface TauriCommands {
  open_stream: (args: { url: string; label: string; cinema: boolean }) => Promise<void>;
  close_stream: (args: { label: string }) => Promise<void>;
  launch_cage_session: () => Promise<string>;
  toggle_fullscreen: () => Promise<void>;
  get_system_info: () => Promise<SystemInfo>;
}
