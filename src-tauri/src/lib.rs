use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use std::process::Command;

// ─── Tauri Commands ────────────────────────────────────────────────────────────

/// Opens a streaming URL in a dedicated borderless WebView window.
/// In Cinema Mode the window goes fullscreen and we hint Cage compositor.
#[tauri::command]
fn open_stream(app: AppHandle, url: String, label: String, cinema: bool) {
    let parsed = if url.starts_with("http://") || url.starts_with("https://") {
        url.clone()
    } else {
        format!("https://{}", url)
    };

    // Build or focus existing webview window
    let win_label = sanitize_label(&label);

    if let Some(existing) = app.get_webview_window(&win_label) {
        let _ = existing.set_focus();
        let _ = existing.navigate(tauri::Url::parse(&parsed).unwrap());
        if cinema {
            let _ = existing.set_fullscreen(true);
            let _ = existing.set_decorations(false);
        }
        return;
    }

    let mut builder = WebviewWindowBuilder::new(
        &app,
        &win_label,
        WebviewUrl::External(tauri::Url::parse(&parsed).unwrap()),
    )
    .title(&label)
    .inner_size(1280.0, 720.0)
    .resizable(true)
    .center();

    if cinema {
        builder = builder
            .fullscreen(true)
            .decorations(false);
    }

    match builder.build() {
        Ok(win) => {
            if cinema {
                let _ = win.set_fullscreen(true);
            }
        }
        Err(e) => eprintln!("StreamBox: failed to open window: {e}"),
    }
}

/// Closes a named stream window.
#[tauri::command]
fn close_stream(app: AppHandle, label: String) {
    let win_label = sanitize_label(&label);
    if let Some(win) = app.get_webview_window(&win_label) {
        let _ = win.close();
    }
}

/// Launches Cage (Wayland compositor) for kiosk/cinema mode.
/// cage -d — disables dpms; runs the tauri app inside it.
#[tauri::command]
fn launch_cage_session(_app: AppHandle) -> Result<String, String> {
    // Get current executable path to re-launch inside Cage
    let exe = std::env::current_exe()
        .map_err(|e| format!("Cannot find exe: {e}"))?;

    // Check if cage is available
    let cage_check = Command::new("which").arg("cage").output();
    if cage_check.map(|o| !o.status.success()).unwrap_or(true) {
        return Err("Cage compositor not found. Install: sudo apt install cage".to_string());
    }

    // Spawn cage -d -- <this binary>
    // -d disables DPMS (display power management) — good for watching
    let status = Command::new("cage")
        .arg("-d")
        .arg("--")
        .arg(exe)
        .arg("--cinema")
        .spawn()
        .map_err(|e| format!("Failed to spawn cage: {e}"))?;

    // Optionally close main window (session handed off to Cage)
    // app.get_webview_window("main").map(|w| w.close());
    let _ = status; // detached

    Ok("Cage session launched".to_string())
}

/// Toggle fullscreen on the main window
#[tauri::command]
fn toggle_fullscreen(app: AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let is_full = win.is_fullscreen().unwrap_or(false);
        let _ = win.set_fullscreen(!is_full);
        let _ = win.set_decorations(is_full); // hide decorations in fullscreen
    }
}

/// Returns system info for display
#[tauri::command]
fn get_system_info() -> serde_json::Value {
    let wayland = std::env::var("WAYLAND_DISPLAY").is_ok();
    let display = std::env::var("WAYLAND_DISPLAY")
        .or_else(|_| std::env::var("DISPLAY"))
        .unwrap_or_else(|_| "unknown".to_string());

    serde_json::json!({
        "wayland": wayland,
        "display": display,
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
    })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn sanitize_label(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>()
        .to_lowercase()
}

// ─── App Entry ────────────────────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_stream,
            close_stream,
            launch_cage_session,
            toggle_fullscreen,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("StreamBox: tauri application failed");
}
