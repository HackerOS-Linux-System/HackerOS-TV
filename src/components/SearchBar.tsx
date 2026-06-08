import React, { useRef, useState } from "react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onOpenUrl: (url: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onOpenUrl,
  placeholder = "Szukaj lub wpisz URL...",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      const v = value.trim();
      // If looks like URL, open directly; otherwise search Google
      const isUrl =
        v.startsWith("http") ||
        v.startsWith("www.") ||
        /^[a-z0-9-]+\.[a-z]{2,}/.test(v);
      onOpenUrl(isUrl ? v : `https://www.google.com/search?q=${encodeURIComponent(v)}`);
    }
    if (e.key === "Escape") {
      onChange("");
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`${styles.wrap} ${focused ? styles.focused : ""}`}>
      <span className={styles.searchIcon}>⌕</span>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
        >
          ✕
        </button>
      )}
      {value && (
        <button
          className={styles.goBtn}
          onClick={() => handleKeyDown({ key: "Enter" } as any)}
        >
          OTWÓRZ
        </button>
      )}
    </div>
  );
};
