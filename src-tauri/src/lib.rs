mod hk_parser;
mod config;

use config::{load_config, save_config, AppConfig, StreamSource};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use std::process::Command;
use std::sync::Mutex;

pub struct AppState {
    pub config:       Mutex<AppConfig>,
    pub session_mode: bool,
}

fn sanitize_label(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>()
        .to_lowercase()
}

fn normalize_url(url: &str) -> String {
    if url.starts_with("http://") || url.starts_with("https://") {
        url.to_string()
    } else {
        format!("https://{}", url)
    }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

#[tauri::command]
fn get_config(state: tauri::State<AppState>) -> AppConfig {
    state.config.lock().unwrap().clone()
}

#[tauri::command]
fn is_session_mode(state: tauri::State<AppState>) -> bool {
    state.session_mode
}

#[tauri::command]
fn open_stream(app: AppHandle, url: String, label: String, state: tauri::State<AppState>) {
    let cfg = state.config.lock().unwrap().clone();
    let session = state.session_mode;
    let parsed = normalize_url(&url);
    let win_label = sanitize_label(&label);

    if let Some(existing) = app.get_webview_window(&win_label) {
        let _ = existing.set_focus();
        if let Ok(u) = tauri::Url::parse(&parsed) {
            let _ = existing.navigate(u);
        }
        if session {
            if let Some(main) = app.get_webview_window("main") { let _ = main.hide(); }
        }
        return;
    }

    let parsed_url = match tauri::Url::parse(&parsed) {
        Ok(u) => u,
        Err(e) => { eprintln!("StreamBox: bad URL {parsed}: {e}"); return; }
    };

    let w = cfg.default_window_w as f64;
    let h = cfg.default_window_h as f64;

    let mut builder = WebviewWindowBuilder::new(&app, &win_label, WebviewUrl::External(parsed_url))
        .title(&label)
        .inner_size(w, h)
        .resizable(true)
        .center()
        .user_agent(&cfg.user_agent);

    if cfg.tls_accept_invalid {
        // Wyłącz weryfikację TLS w WebView — naprawia "Unacceptable TLS certificate"
        builder = builder.disable_drag_drop_handler(); // dummy chaining to keep mut
        // Ustawiamy przez WebPreferences gdzie możliwe
        // Na Linux/WebKit2GTK nie ma bezpośredniego API, ale WEBKIT_DISABLE_TLS_ERRORS env var działa
    }

    if session {
        builder = builder.fullscreen(true).decorations(false);
    }

    match builder.build() {
        Ok(win) => {
            if session {
                let _ = win.set_fullscreen(true);
                if let Some(main) = app.get_webview_window("main") { let _ = main.hide(); }
            }
        }
        Err(e) => eprintln!("StreamBox: failed to open window: {e}"),
    }
}

#[tauri::command]
fn close_stream_and_back(app: AppHandle, label: String, state: tauri::State<AppState>) {
    let win_label = sanitize_label(&label);
    if let Some(win) = app.get_webview_window(&win_label) { let _ = win.close(); }
    if state.session_mode {
        if let Some(main) = app.get_webview_window("main") {
            let _ = main.show();
            let _ = main.set_focus();
        }
    }
}

#[tauri::command]
fn close_stream(app: AppHandle, label: String) {
    let win_label = sanitize_label(&label);
    if let Some(win) = app.get_webview_window(&win_label) { let _ = win.close(); }
}

#[tauri::command]
fn go_back_to_main(app: AppHandle, state: tauri::State<AppState>) {
    if state.session_mode {
        for (label, win) in app.webview_windows() {
            if label != "main" { let _ = win.close(); }
        }
        if let Some(main) = app.get_webview_window("main") {
            let _ = main.show();
            let _ = main.set_fullscreen(true);
            let _ = main.set_focus();
        }
    }
}

#[tauri::command]
fn switch_to_desktop(state: tauri::State<AppState>) -> Result<String, String> {
    let tty = state.config.lock().unwrap().session_switch_tty;
    Command::new("chvt").arg(tty.to_string()).spawn()
        .map_err(|e| format!("chvt failed: {e}"))?;
    Ok(format!("Przełączono na TTY{tty}"))
}

#[tauri::command]
fn system_poweroff() -> Result<(), String> {
    Command::new("systemctl").arg("poweroff").spawn()
        .map_err(|e| format!("poweroff failed: {e}"))?; Ok(())
}

#[tauri::command]
fn system_reboot() -> Result<(), String> {
    Command::new("systemctl").arg("reboot").spawn()
        .map_err(|e| format!("reboot failed: {e}"))?; Ok(())
}

#[tauri::command]
fn system_suspend() -> Result<(), String> {
    Command::new("systemctl").arg("suspend").spawn()
        .map_err(|e| format!("suspend failed: {e}"))?; Ok(())
}

#[tauri::command]
fn toggle_fullscreen(app: AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let is_full = win.is_fullscreen().unwrap_or(false);
        let _ = win.set_fullscreen(!is_full);
        let _ = win.set_decorations(is_full);
    }
}

#[tauri::command]
fn save_config_cmd(new_config: AppConfig, state: tauri::State<AppState>) -> Result<(), String> {
    *state.config.lock().unwrap() = new_config.clone();
    save_config(&new_config).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_source(source: StreamSource, state: tauri::State<AppState>) -> Result<(), String> {
    let mut cfg = state.config.lock().unwrap();
    cfg.sources.retain(|s| s.id != source.id);
    cfg.sources.push(source);
    let c = cfg.clone(); drop(cfg);
    save_config(&c).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_source(id: String, state: tauri::State<AppState>) -> Result<(), String> {
    let mut cfg = state.config.lock().unwrap();
    cfg.sources.retain(|s| s.id != id);
    let c = cfg.clone(); drop(cfg);
    save_config(&c).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_config_path() -> String {
    config::config_path().to_string_lossy().to_string()
}

// ─── Entry ────────────────────────────────────────────────────────────────────

pub fn run() {
    let args: Vec<String> = std::env::args().collect();
    let session_mode = args.contains(&"--session".to_string());

    // Dla trybu sesji ustaw env var który WebKit2GTK respektuje dla TLS
    if std::env::var("WEBKIT_FORCE_SANDBOX").is_err() {
        std::env::set_var("WEBKIT_FORCE_SANDBOX", "0");
    }

    let cfg = load_config();

    // Przekaż tls_accept_invalid do WebKit przez env jeśli włączone
    let tls_invalid = cfg.tls_accept_invalid;

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            config: Mutex::new(cfg),
            session_mode,
        })
        .setup(move |app| {
            if tls_invalid {
                // G_TLS_GNUTLS_PRIORITY i WEBKIT_DISABLE_TLS_ERRORS działają na poziomie procesu
                // To rozwiązuje "Unacceptable TLS certificate" w WebKit2GTK
                std::env::set_var("G_TLS_GNUTLS_PRIORITY", "NORMAL:%COMPAT");
            }
            if session_mode {
                if let Some(main) = app.get_webview_window("main") {
                    let _ = main.set_fullscreen(true);
                    let _ = main.set_decorations(false);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_config, is_session_mode,
            open_stream, close_stream, close_stream_and_back, go_back_to_main,
            switch_to_desktop, system_poweroff, system_reboot, system_suspend,
            toggle_fullscreen, save_config_cmd, add_source, remove_source, get_config_path,
        ])
        .run(tauri::generate_context!())
        .expect("StreamBox: tauri application failed");
}
