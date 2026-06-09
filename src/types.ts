export interface StreamSource {
  id:       string;
  name:     string;
  url:      string;
  icon:     string;
  color:    string;
  category: SourceCategory;
  featured: boolean;
}

export type SourceCategory = "streaming" | "sports" | "social" | "custom";

export interface AppConfig {
  sources:            StreamSource[];
  default_window_w:   number;
  default_window_h:   number;
  remember_position:  boolean;
  language:           string;
  tls_accept_invalid: boolean;
  user_agent:         string;
  session_switch_tty: number;
}

export const CATEGORY_LABELS: Record<SourceCategory | string, string> = {
  streaming: "Streaming",
  sports:    "Sport",
  social:    "Live & Social",
  custom:    "Własne",
};

export interface ToastMsg {
  id:   string;
  text: string;
  type: "info" | "success" | "error";
}
