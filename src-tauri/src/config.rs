use std::collections::HashMap;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use crate::hk_parser::{parse_hk, serialize_hk, HkValue, HkConfig};

// ─── Struktury konfiguracji ───────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamSource {
    pub id:       String,
    pub name:     String,
    pub url:      String,
    pub icon:     String,
    pub color:    String,
    pub category: String,
    pub featured: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub sources:            Vec<StreamSource>,
    pub default_window_w:   u32,
    pub default_window_h:   u32,
    pub remember_position:  bool,
    pub language:           String,
    pub tls_accept_invalid: bool,
    pub user_agent:         String,
    pub session_switch_tty: u8,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            sources:            default_sources(),
            default_window_w:   1280,
            default_window_h:   720,
            remember_position:  true,
            language:           "pl".to_string(),
            tls_accept_invalid: true,
            user_agent:         "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36".to_string(),
            session_switch_tty: 2,
        }
    }
}

// ─── Ścieżka config ───────────────────────────────────────────────────────────

pub fn config_path() -> PathBuf {
    let base = std::env::var("HOME").unwrap_or_else(|_| "/root".to_string());
    PathBuf::from(base)
        .join(".config")
        .join("desktop-streaming-session")
        .join("config.hk")
}

// ─── Wczytaj config ───────────────────────────────────────────────────────────

pub fn load_config() -> AppConfig {
    let path = config_path();
    if !path.exists() {
        let cfg = AppConfig::default();
        let _ = save_config(&cfg); // wygeneruj domyślny
        return cfg;
    }
    let text = match std::fs::read_to_string(&path) {
        Ok(t) => t,
        Err(_) => return AppConfig::default(),
    };
    parse_config(&text)
}

fn parse_config(text: &str) -> AppConfig {
    let hk = parse_hk(text);
    let mut cfg = AppConfig::default();

    // [app]
    if let Some(app) = hk.get("app") {
        if let Some(v) = app.get("default_window_w") {
            if let Some(n) = v.as_f64() { cfg.default_window_w = n as u32; }
        }
        if let Some(v) = app.get("default_window_h") {
            if let Some(n) = v.as_f64() { cfg.default_window_h = n as u32; }
        }
        if let Some(v) = app.get("remember_position") {
            if let Some(b) = v.as_bool() { cfg.remember_position = b; }
        }
        if let Some(v) = app.get("language") {
            if let Some(s) = v.as_str() { cfg.language = s.to_string(); }
        }
        if let Some(v) = app.get("tls_accept_invalid") {
            if let Some(b) = v.as_bool() { cfg.tls_accept_invalid = b; }
        }
        if let Some(v) = app.get("user_agent") {
            if let Some(s) = v.as_str() { cfg.user_agent = s.to_string(); }
        }
        if let Some(v) = app.get("session_switch_tty") {
            if let Some(n) = v.as_f64() { cfg.session_switch_tty = n as u8; }
        }
    }

    // [sources] — każde source to podmapa
    if let Some(sources_section) = hk.get("sources") {
        let mut parsed: Vec<StreamSource> = Vec::new();
        for (id, val) in sources_section {
            if let Some(m) = val.as_map() {
                let src = StreamSource {
                    id:       id.clone(),
                    name:     get_str(m, "name").unwrap_or_else(|| id.clone()),
                    url:      get_str(m, "url").unwrap_or_default(),
                    icon:     get_str(m, "icon").unwrap_or_else(|| "◎".to_string()),
                    color:    get_str(m, "color").unwrap_or_else(|| "#4f8eff".to_string()),
                    category: get_str(m, "category").unwrap_or_else(|| "custom".to_string()),
                    featured: get_bool(m, "featured").unwrap_or(false),
                };
                if !src.url.is_empty() {
                    parsed.push(src);
                }
            }
        }
        if !parsed.is_empty() {
            // Sortuj według kolejności w pliku (alphabetycznie po id jako fallback)
            parsed.sort_by(|a, b| a.id.cmp(&b.id));
            cfg.sources = parsed;
        }
    }

    cfg
}

fn get_str(m: &HashMap<String, HkValue>, key: &str) -> Option<String> {
    m.get(key)?.as_str().map(|s| s.to_string())
}

fn get_bool(m: &HashMap<String, HkValue>, key: &str) -> Option<bool> {
    m.get(key)?.as_bool()
}

// ─── Zapisz config ────────────────────────────────────────────────────────────

pub fn save_config(cfg: &AppConfig) -> std::io::Result<()> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let text = render_config(cfg);
    std::fs::write(&path, text)
}

fn render_config(cfg: &AppConfig) -> String {
    let mut out = String::new();

    out.push_str("! StreamBox — konfiguracja\n");
    out.push_str("! ~/.config/desktop-streaming-session/config.hk\n");
    out.push_str("! Format .hk — dokumentacja: https://hackeros-linux-system.github.io/HackerOS-Website/tools-docs/hk.html\n\n");

    out.push_str("[app]\n");
    out.push_str(&format!("-> default_window_w   => {}\n", cfg.default_window_w));
    out.push_str(&format!("-> default_window_h   => {}\n", cfg.default_window_h));
    out.push_str(&format!("-> remember_position  => {}\n", cfg.remember_position));
    out.push_str(&format!("-> language           => {}\n", cfg.language));
    out.push_str(&format!("-> tls_accept_invalid => {}\n", cfg.tls_accept_invalid));
    out.push_str(&format!("-> user_agent         => \"{}\"\n", cfg.user_agent));
    out.push_str(&format!("-> session_switch_tty => {}\n", cfg.session_switch_tty));
    out.push('\n');

    out.push_str("[sources]\n");
    out.push_str("! Każde źródło to podmapa z kluczami: name, url, icon, color, category, featured\n");
    out.push_str("! category: streaming | sports | social | custom\n\n");
    for src in &cfg.sources {
        out.push_str(&format!("-> {}\n", src.id));
        out.push_str(&format!("--> name     => {}\n", src.name));
        out.push_str(&format!("--> url      => {}\n", src.url));
        out.push_str(&format!("--> icon     => {}\n", src.icon));
        out.push_str(&format!("--> color    => {}\n", src.color));
        out.push_str(&format!("--> category => {}\n", src.category));
        out.push_str(&format!("--> featured => {}\n", src.featured));
        out.push('\n');
    }

    out
}

// ─── Domyślne źródła ──────────────────────────────────────────────────────────

pub fn default_sources() -> Vec<StreamSource> {
    vec![
        StreamSource { id: "youtube".into(),    name: "YouTube".into(),       url: "https://www.youtube.com".into(),     icon: "▶".into(), color: "#FF0000".into(), category: "streaming".into(), featured: true  },
        StreamSource { id: "disney".into(),     name: "Disney+".into(),       url: "https://www.disneyplus.com".into(),  icon: "✦".into(), color: "#1133AA".into(), category: "streaming".into(), featured: true  },
        StreamSource { id: "prime".into(),      name: "Prime Video".into(),   url: "https://www.primevideo.com".into(),  icon: "⬡".into(), color: "#00A8E0".into(), category: "streaming".into(), featured: true  },
        StreamSource { id: "netflix".into(),    name: "Netflix".into(),       url: "https://www.netflix.com".into(),     icon: "N".into(), color: "#E50914".into(), category: "streaming".into(), featured: true  },
        StreamSource { id: "hbo".into(),        name: "Max".into(),           url: "https://www.max.com".into(),         icon: "◈".into(), color: "#5822B4".into(), category: "streaming".into(), featured: false },
        StreamSource { id: "apple".into(),      name: "Apple TV+".into(),     url: "https://tv.apple.com".into(),        icon: "".into(), color: "#555555".into(), category: "streaming".into(), featured: false },
        StreamSource { id: "mubi".into(),       name: "MUBI".into(),          url: "https://mubi.com".into(),            icon: "◉".into(), color: "#E85D3A".into(), category: "streaming".into(), featured: false },
        StreamSource { id: "twitch".into(),     name: "Twitch".into(),        url: "https://www.twitch.tv".into(),       icon: "◈".into(), color: "#9146FF".into(), category: "streaming".into(), featured: false },
        StreamSource { id: "eleven".into(),     name: "Eleven Sports".into(), url: "https://elevensports.com".into(),    icon: "⚽".into(), color: "#FF6B00".into(), category: "sports".into(),    featured: true  },
        StreamSource { id: "dazn".into(),       name: "DAZN".into(),          url: "https://www.dazn.com".into(),        icon: "⬟".into(), color: "#F8EC00".into(), category: "sports".into(),    featured: false },
        StreamSource { id: "canal".into(),      name: "Canal+ Sport".into(),  url: "https://sport.canalplus.com".into(), icon: "C".into(), color: "#00A0DC".into(), category: "sports".into(),    featured: false },
        StreamSource { id: "vimeo".into(),      name: "Vimeo".into(),         url: "https://vimeo.com".into(),           icon: "◎".into(), color: "#1AB7EA".into(), category: "social".into(),    featured: false },
    ]
}
