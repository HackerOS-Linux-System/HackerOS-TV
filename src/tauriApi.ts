import { invoke } from "@tauri-apps/api/core";
import type { AppConfig, StreamSource } from "./types";

export const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export const api = {
  getConfig:           ():                              Promise<AppConfig>  => invoke("get_config"),
  isSessionMode:       ():                              Promise<boolean>    => invoke("is_session_mode"),
  openStream:          (url: string, label: string):   Promise<void>       => invoke("open_stream",           { url, label }),
  closeStream:         (label: string):                Promise<void>       => invoke("close_stream",          { label }),
  closeStreamAndBack:  (label: string):                Promise<void>       => invoke("close_stream_and_back", { label }),
  goBackToMain:        ():                              Promise<void>       => invoke("go_back_to_main"),
  switchToDesktop:     ():                              Promise<string>     => invoke("switch_to_desktop"),
  systemPoweroff:      ():                              Promise<void>       => invoke("system_poweroff"),
  systemReboot:        ():                              Promise<void>       => invoke("system_reboot"),
  systemSuspend:       ():                              Promise<void>       => invoke("system_suspend"),
  toggleFullscreen:    ():                              Promise<void>       => invoke("toggle_fullscreen"),
  saveConfig:          (cfg: AppConfig):               Promise<void>       => invoke("save_config_cmd",       { newConfig: cfg }),
  addSource:           (source: StreamSource):         Promise<void>       => invoke("add_source",            { source }),
  removeSource:        (id: string):                   Promise<void>       => invoke("remove_source",         { id }),
  getConfigPath:       ():                              Promise<string>     => invoke("get_config_path"),
};
