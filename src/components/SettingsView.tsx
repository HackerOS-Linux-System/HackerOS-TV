import { useState, useEffect, FC } from "react";
import { api, isTauri } from "../tauriApi";
import type { AppConfig, StreamSource, SourceCategory } from "../types";
import styles from "./SettingsView.module.css";

interface SettingsViewProps {
  config:        AppConfig;
  onConfigSave:  (cfg: AppConfig) => Promise<void>;
  addToast:      (msg: string, type?: "info" | "success" | "error") => void;
}

const EMPTY_SOURCE: StreamSource = {
  id: "", name: "", url: "", icon: "◎", color: "#4f8eff", category: "custom", featured: false,
};

export const SettingsView: FC<SettingsViewProps> = ({ config, onConfigSave, addToast }) => {
  const [cfg, setCfg]             = useState<AppConfig>(config);
  const [configPath, setConfigPath] = useState("");
  const [newSrc, setNewSrc]       = useState<StreamSource>(EMPTY_SOURCE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { setCfg(config); }, [config]);
  useEffect(() => {
    if (isTauri()) api.getConfigPath().then(setConfigPath).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try { await onConfigSave(cfg); addToast("Zapisano ustawienia", "success"); }
    catch (e) { addToast(`Błąd zapisu: ${e}`, "error"); }
    finally { setSaving(false); }
  };

  const handleField = <K extends keyof AppConfig>(key: K, val: AppConfig[K]) =>
    setCfg((c) => ({ ...c, [key]: val }));

  // ── Sources CRUD ──────────────────────────────────────────────────────────
  const startEdit = (src: StreamSource) => { setNewSrc({ ...src }); setEditingId(src.id); };
  const cancelEdit = () => { setNewSrc(EMPTY_SOURCE); setEditingId(null); };

  const saveSource = async () => {
    if (!newSrc.id.trim() || !newSrc.url.trim() || !newSrc.name.trim()) {
      addToast("ID, Nazwa i URL są wymagane", "error"); return;
    }
    const clean = { ...newSrc, id: newSrc.id.replace(/[^a-z0-9_-]/gi, "_").toLowerCase() };
    const updated = editingId
      ? cfg.sources.map((s) => (s.id === editingId ? clean : s))
      : [...cfg.sources.filter((s) => s.id !== clean.id), clean];
    const next = { ...cfg, sources: updated };
    setCfg(next);
    try {
      await onConfigSave(next);
      addToast(editingId ? "Zaktualizowano źródło" : "Dodano źródło", "success");
    } catch (e) { addToast(`Błąd: ${e}`, "error"); }
    setNewSrc(EMPTY_SOURCE); setEditingId(null);
  };

  const removeSource = async (id: string) => {
    const next = { ...cfg, sources: cfg.sources.filter((s) => s.id !== id) };
    setCfg(next);
    try { await onConfigSave(next); addToast("Usunięto źródło", "info"); }
    catch (e) { addToast(`Błąd: ${e}`, "error"); }
  };

  return (
    <div className={styles.view}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>USTAWIENIA</h1>

        {/* ── Ogólne ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}><span>⚙</span> Ogólne</h2>

          <div className={styles.fieldRow}>
            <label className={styles.label}>Domyślna szerokość okna</label>
            <input className={styles.input} type="number" min={640} max={3840}
              value={cfg.default_window_w}
              onChange={(e) => handleField("default_window_w", Number(e.target.value))} />
            <span className={styles.unit}>px</span>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Domyślna wysokość okna</label>
            <input className={styles.input} type="number" min={400} max={2160}
              value={cfg.default_window_h}
              onChange={(e) => handleField("default_window_h", Number(e.target.value))} />
            <span className={styles.unit}>px</span>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Język interfejsu</label>
            <select className={styles.select} value={cfg.language}
              onChange={(e) => handleField("language", e.target.value)}>
              <option value="pl">Polski</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>Pamiętaj pozycję okna</label>
            <input type="checkbox" className={styles.checkbox}
              checked={cfg.remember_position}
              onChange={(e) => handleField("remember_position", e.target.checked)} />
          </div>
        </section>

        {/* ── Sieć ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}><span>🌐</span> Sieć i WebView</h2>

          <div className={styles.fieldRow}>
            <label className={styles.label}>Akceptuj nieważne certyfikaty TLS</label>
            <input type="checkbox" className={styles.checkbox}
              checked={cfg.tls_accept_invalid}
              onChange={(e) => handleField("tls_accept_invalid", e.target.checked)} />
          </div>
          <p className={styles.fieldHint}>
            Włącz jeśli widzisz błąd "Unacceptable TLS certificate" (np. Eleven Sports).
            Rozwiązuje problem z certyfikatami self-signed lub pinnedcert.
          </p>

          <div className={styles.fieldRow} style={{ marginTop: 12 }}>
            <label className={styles.label}>User-Agent WebView</label>
            <input className={`${styles.input} ${styles.inputWide}`} type="text"
              value={cfg.user_agent}
              onChange={(e) => handleField("user_agent", e.target.value)} />
          </div>
          <p className={styles.fieldHint}>
            YouTube TV wymaga user-agenta przeglądarki. Domyślna wartość działa dla większości serwisów.
            Jeśli YouTube przekierowuje na youtube.com zamiast wersji TV, zmień na UA Chrome'a.
          </p>
        </section>

        {/* ── Session / Cage ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}><span>⬡</span> Tryb sesji (--session)</h2>

          <div className={styles.fieldRow}>
            <label className={styles.label}>Numer TTY środowiska graficznego</label>
            <input className={styles.input} type="number" min={1} max={9}
              value={cfg.session_switch_tty}
              onChange={(e) => handleField("session_switch_tty", Number(e.target.value))} />
          </div>
          <p className={styles.fieldHint}>
            Używany przez opcję "Przełącz na środowisko graficzne" w menu sesji.
            Domyślnie TTY2 (Plasma/GNOME uruchamia się zazwyczaj na TTY2).
          </p>

          <div className={styles.codeBlock} style={{ marginTop: 12 }}>
            <span className={styles.codeLabel}>Uruchomienie trybu sesji</span>
            <code>cage -d -- streambox --session</code>
          </div>
          <div className={styles.shortcutList}>
            {[
              ["Ctrl+Shift+B", "Powrót do strony głównej"],
              ["Ctrl+Shift+M", "Otwórz menu sesji"],
            ].map(([k, l]) => (
              <div key={k} className={styles.shortcutRow}>
                <span className={styles.shortcutKey}>{k}</span>
                <span className={styles.shortcutLabel}>{l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Plik konfiguracyjny ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}><span>📄</span> Plik konfiguracyjny</h2>
          <div className={styles.codeBlock}>
            <span className={styles.codeLabel}>Ścieżka</span>
            <code>{configPath || "~/.config/desktop-streaming-session/config.hk"}</code>
          </div>
          <p className={styles.fieldHint}>
            Format .hk (HackerOS). Możesz edytować plik ręcznie — zmiany zostaną wczytane przy następnym uruchomieniu.
          </p>
        </section>

        {/* ── Skróty klawiszowe ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}><span>⌨</span> Skróty klawiszowe</h2>
          <div className={styles.shortcutList}>
            {[
              ["F",             "Pełny ekran (tryb normalny)"],
              ["ESC",           "Zamknij overlay / anuluj"],
              ["Enter",         "Otwórz URL z wyszukiwarki"],
              ["Ctrl+Shift+B",  "Powrót do głównej (tryb sesji)"],
              ["Ctrl+Shift+M",  "Menu sesji (tryb sesji)"],
              ["Ctrl+Q",        "Zamknij StreamBox"],
            ].map(([k, l]) => (
              <div key={k} className={styles.shortcutRow}>
                <span className={styles.shortcutKey}>{k}</span>
                <span className={styles.shortcutLabel}>{l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Zapisz ogólne ── */}
        <button className={styles.saveBtn} onClick={save} disabled={saving}>
          {saving ? "Zapisywanie…" : "Zapisz ustawienia"}
        </button>

        {/* ── Zarządzanie źródłami ── */}
        <section className={styles.card} style={{ marginTop: 8 }}>
          <h2 className={styles.cardTitle}><span>▶</span> Źródła streamingowe</h2>
          <p className={styles.fieldHint} style={{ marginBottom: 16 }}>
            Dodawaj, edytuj i usuwaj platformy. Zmiany są automatycznie zapisywane do config.hk.
          </p>

          {/* Lista istniejących */}
          <div className={styles.sourceList}>
            {cfg.sources.map((src) => (
              <div key={src.id} className={styles.sourceRow} style={{ "--src-color": src.color } as React.CSSProperties}>
                <span className={styles.sourceIcon} style={{ color: src.color }}>{src.icon}</span>
                <span className={styles.sourceName}>{src.name}</span>
                <span className={styles.sourceUrl}>{src.url}</span>
                <span className={styles.sourceCat}>{src.category}</span>
                <div className={styles.sourceActions}>
                  <button className={styles.editBtn} onClick={() => startEdit(src)}>Edytuj</button>
                  <button className={styles.delBtn}  onClick={() => removeSource(src.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Formularz dodaj/edytuj */}
          <div className={styles.srcForm}>
            <h3 className={styles.srcFormTitle}>
              {editingId ? "Edytuj źródło" : "Dodaj nowe źródło"}
            </h3>
            <div className={styles.srcFormGrid}>
              <div className={styles.srcField}>
                <label>ID (unikalne, bez spacji)</label>
                <input className={styles.input} placeholder="np. twoja-platforma"
                  value={newSrc.id} disabled={!!editingId}
                  onChange={(e) => setNewSrc((s) => ({ ...s, id: e.target.value }))} />
              </div>
              <div className={styles.srcField}>
                <label>Nazwa</label>
                <input className={styles.input} placeholder="np. Moja Platforma"
                  value={newSrc.name}
                  onChange={(e) => setNewSrc((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className={styles.srcField} style={{ gridColumn: "1/-1" }}>
                <label>URL</label>
                <input className={`${styles.input} ${styles.inputWide}`} placeholder="https://..."
                  value={newSrc.url}
                  onChange={(e) => setNewSrc((s) => ({ ...s, url: e.target.value }))} />
              </div>
              <div className={styles.srcField}>
                <label>Ikona (emoji lub znak)</label>
                <input className={styles.input} placeholder="◎"
                  value={newSrc.icon}
                  onChange={(e) => setNewSrc((s) => ({ ...s, icon: e.target.value }))} />
              </div>
              <div className={styles.srcField}>
                <label>Kolor akcentu</label>
                <div className={styles.colorWrap}>
                  <input type="color" className={styles.colorPicker}
                    value={newSrc.color}
                    onChange={(e) => setNewSrc((s) => ({ ...s, color: e.target.value }))} />
                  <input className={styles.input} placeholder="#4f8eff"
                    value={newSrc.color}
                    onChange={(e) => setNewSrc((s) => ({ ...s, color: e.target.value }))} />
                </div>
              </div>
              <div className={styles.srcField}>
                <label>Kategoria</label>
                <select className={styles.select}
                  value={newSrc.category}
                  onChange={(e) => setNewSrc((s) => ({ ...s, category: e.target.value as SourceCategory }))}>
                  <option value="streaming">Streaming</option>
                  <option value="sports">Sport</option>
                  <option value="social">Live & Social</option>
                  <option value="custom">Własne</option>
                </select>
              </div>
              <div className={styles.srcField}>
                <label>Polecane (featured)</label>
                <input type="checkbox" className={styles.checkbox}
                  checked={newSrc.featured}
                  onChange={(e) => setNewSrc((s) => ({ ...s, featured: e.target.checked }))} />
              </div>
            </div>
            <div className={styles.srcFormActions}>
              <button className={styles.saveBtn} onClick={saveSource}>
                {editingId ? "Zapisz zmiany" : "Dodaj źródło"}
              </button>
              {editingId && (
                <button className={styles.cancelBtn} onClick={cancelEdit}>Anuluj</button>
              )}
            </div>
          </div>
        </section>

        <div className={styles.version}>StreamBox v0.1.0 · Tauri 2 · React · Rust · .hk config</div>
      </div>
    </div>
  );
};
