# StreamBox 🎬

Desktopowa sesja streamingowa inspirowana Google TV / Android TV.  
Zbudowana na **Tauri 2 + React + TypeScript + Rust**.

## Funkcje

- **Kafelkowe menu TV** z platformami streamingowymi (YouTube, Disney+, Prime Video, Netflix, Twitch, Eleven Sports, DAZN i więcej)
- **WebView** dla każdej platformy — każda otwiera się w osobnym oknie Tauri
- **Wyszukiwarka + dowolny URL** — wpisz frazę (→ Google) lub adres (→ bezpośrednio)
- **Tryb Kino** inspirowany Steam Big Picture Mode:
  - Pełnoekranowy WebView
  - Obsługa `cage -d` (Wayland kiosk compositor)
- Ciemny motyw TV z animacjami

## Wymagania

### Podstawowe (wszystkie platformy)
- **Node.js** 18+
- **Rust** (https://rustup.rs)
- **Tauri CLI v2**: `cargo install tauri-cli --version "^2"`

### Linux — zależności systemowe
```bash
# Debian/Ubuntu
sudo apt install \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Wayland support (dla cage)
sudo apt install cage
```

### DRM / Widevine (Netflix, Disney+, Prime Video)
Na Linuksie WebKit2GTK wymaga Widevine CDM dla treści DRM:
```bash
# Zainstaluj chromium i powiąż Widevine z WebKit
sudo apt install chromium-browser
# Niektóre dystrybucje wymagają dodatkowej konfiguracji
# Alternatywnie: używaj tych serwisów przez zewnętrzny Chromium
```

## Uruchomienie deweloperskie

```bash
# 1. Zainstaluj zależności Node
npm install

# 2. Uruchom w trybie dev (Vite + Tauri)
npm run tauri dev

# lub z cargo:
cargo tauri dev
```

## Build produkcyjny

```bash
npm run tauri build
# Binarny w: src-tauri/target/release/streambox
# Bundle w:  src-tauri/target/release/bundle/
```

## Tryb Kino z Cage

Cage to minimalistyczny kiosk-compositor Wayland — StreamBox będzie jedyną
aplikacją na ekranie, bez paska zadań i managera okien.

```bash
# Uruchom StreamBox bezpośrednio w Cage:
cage -d -- ./streambox

# Lub przez przycisk ◑ w interfejsie (wymaga Wayland DISPLAY)
```

Flaga `-d` wyłącza DPMS (wygaszanie ekranu) — idealne do długich sesji oglądania.

## Struktura projektu

```
streambox/
├── src/                     # Frontend React/TypeScript
│   ├── components/
│   │   ├── Topbar.tsx       # Górny pasek nawigacji + zegar
│   │   ├── HomeView.tsx     # Ekran główny (Google TV style)
│   │   ├── BrowseView.tsx   # Wszystkie platformy
│   │   ├── SourceCard.tsx   # Kafelek platformy
│   │   ├── SearchBar.tsx    # Wyszukiwarka / URL bar
│   │   ├── CinemaOverlay.tsx# Tryb kino (Cage launcher)
│   │   ├── SettingsView.tsx # Ustawienia + info systemowe
│   │   └── Toast.tsx        # Powiadomienia
│   ├── sources.ts           # Lista platform streamingowych
│   ├── tauriApi.ts          # Bridge do komend Rust
│   └── types.ts             # TypeScript typy
│
└── src-tauri/               # Backend Rust
    ├── src/
    │   ├── lib.rs           # Komendy Tauri + logika Cage
    │   └── main.rs          # Entry point
    └── tauri.conf.json      # Konfiguracja Tauri
```

## Dodanie własnej platformy

W pliku `src/sources.ts` dodaj obiekt do `STREAM_SOURCES`:

```typescript
{
  id: "moja-platforma",
  name: "Moja Platforma",
  url: "https://moja-platforma.pl",
  icon: "◎",          // emoji lub litera
  color: "#FF6600",   // kolor akcentu
  category: "streaming", // streaming | sports | social | custom
  featured: true,     // czy pokazać w "Polecane"
}
```

## Skróty klawiszowe

| Klawisz | Akcja |
|---------|-------|
| `F` | Pełny ekran |
| `ESC` | Zamknij overlay |
| `Enter` | Otwórz URL z wyszukiwarki |
