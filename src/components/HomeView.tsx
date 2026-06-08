import React from "react";
import { SourceCard } from "./SourceCard";
import { SearchBar } from "./SearchBar";
import { STREAM_SOURCES, FEATURED, CATEGORY_LABELS } from "../sources";
import type { StreamSource } from "../types";
import styles from "./HomeView.module.css";

interface HomeViewProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onOpenSource: (source: StreamSource) => void;
  onOpenUrl: (url: string) => void;
  cinemaMode: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSource,
  onOpenUrl,
  cinemaMode,
}) => {
  // Filter by search
  const filtered = searchQuery.trim()
    ? STREAM_SOURCES.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Group non-featured by category
  const categories = Array.from(
    new Set(STREAM_SOURCES.map((s) => s.category))
  );

  return (
    <div className={styles.view}>
      {/* Hero / Search area */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            TWOJA<br />
            <em>SESJA</em>
          </h1>
          <p className={styles.heroSub}>Streaming · Sport · Dowolna strona</p>
        </div>
        <div className={styles.heroSearch}>
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onOpenUrl={onOpenUrl}
            placeholder="Szukaj platformy lub wpisz URL (np. twitch.tv)..."
          />
          {cinemaMode && (
            <div className={styles.cineTag}>
              <span>◑</span> TRYB KINO AKTYWNY
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className={styles.content}>
        {filtered ? (
          /* Search results */
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Wyniki ({filtered.length})
            </h2>
            <div className={styles.row}>
              {filtered.map((s, i) => (
                <SourceCard
                  key={s.id}
                  source={s}
                  onOpen={onOpenSource}
                  size="normal"
                  animDelay={i * 50}
                />
              ))}
              {filtered.length === 0 && (
                <div className={styles.noResults}>
                  <span>Nie znaleziono. Naciśnij Enter aby otworzyć URL.</span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Featured row */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleAccent}>◈</span>
                Polecane
              </h2>
              <div className={styles.row}>
                {FEATURED.map((s, i) => (
                  <SourceCard
                    key={s.id}
                    source={s}
                    onOpen={onOpenSource}
                    size="featured"
                    animDelay={i * 60}
                  />
                ))}
              </div>
            </section>

            {/* Category rows */}
            {categories.map((cat) => {
              const items = STREAM_SOURCES.filter((s) => s.category === cat);
              return (
                <section key={cat} className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <div className={styles.row}>
                    {items.map((s, i) => (
                      <SourceCard
                        key={s.id}
                        source={s}
                        onOpen={onOpenSource}
                        size="normal"
                        animDelay={i * 40}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* Custom URL quick-open */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Otwórz dowolną stronę</h2>
          <div className={styles.customUrlHint}>
            <span>Wpisz URL lub frazę w polu wyszukiwania powyżej i naciśnij</span>
            <span className={styles.keyHint}>Enter</span>
            <span>— strona otworzy się w nowym oknie WebView</span>
          </div>
        </section>
      </div>
    </div>
  );
};
