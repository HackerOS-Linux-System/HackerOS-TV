import { FC } from "react";
import { SearchBar } from "./SearchBar";
import { SourceCard } from "./SourceCard";
import type { StreamSource, AppConfig, SourceCategory } from "../types";
import { CATEGORY_LABELS } from "../types";
import styles from "./HomeView.module.css";

interface HomeViewProps {
  config:         AppConfig;
  searchQuery:    string;
  onSearchChange: (v: string) => void;
  onOpenSource:   (src: StreamSource) => void;
  onOpenUrl:      (url: string) => void;
}

export const HomeView: FC<HomeViewProps> = ({
  config, searchQuery, onSearchChange, onOpenSource, onOpenUrl,
}) => {
  const sources  = config.sources;
  const featured = sources.filter((s) => s.featured);
  const categories = Array.from(new Set(sources.map((s) => s.category))) as SourceCategory[];

  const filtered = searchQuery.trim()
    ? sources.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className={styles.view}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>TWOJA<br /><em>SESJA</em></h1>
          <p className={styles.heroSub}>Streaming · Sport · Dowolna strona</p>
        </div>
        <div className={styles.heroSearch}>
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onOpenUrl={onOpenUrl}
            placeholder="Szukaj platformy lub wpisz URL..."
          />
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filtered ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Wyniki ({filtered.length})</h2>
            <div className={styles.row}>
              {filtered.length === 0 ? (
                <div className={styles.noResults}>Nie znaleziono. Naciśnij Enter aby otworzyć jako URL.</div>
              ) : (
                filtered.map((s, i) => (
                  <SourceCard key={s.id} source={s} onOpen={onOpenSource} size="normal" animDelay={i * 50} />
                ))
              )}
            </div>
          </section>
        ) : (
          <>
            {featured.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}><span className={styles.titleAccent}>◈</span> Polecane</h2>
                <div className={styles.row}>
                  {featured.map((s, i) => (
                    <SourceCard key={s.id} source={s} onOpen={onOpenSource} size="featured" animDelay={i * 60} />
                  ))}
                </div>
              </section>
            )}
            {categories.map((cat) => (
              <section key={cat} className={styles.section}>
                <h2 className={styles.sectionTitle}>{CATEGORY_LABELS[cat]}</h2>
                <div className={styles.row}>
                  {sources.filter((s) => s.category === cat).map((s, i) => (
                    <SourceCard key={s.id} source={s} onOpen={onOpenSource} size="normal" animDelay={i * 40} />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Otwórz dowolną stronę</h2>
          <div className={styles.customUrlHint}>
            <span>Wpisz URL lub frazę w polu wyszukiwania i naciśnij</span>
            <span className={styles.keyHint}>Enter</span>
          </div>
        </section>
      </div>
    </div>
  );
};
