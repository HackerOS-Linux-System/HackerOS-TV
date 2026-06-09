import { FC } from "react";
// BackButton — lewy górny róg okna streamu w session mode
// Wróć do strony głównej

import styles from "./BackButton.module.css";

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton: FC<BackButtonProps> = ({ onClick }) => (
  <button className={styles.btn} onClick={onClick} title="Wróć do głównej (Ctrl+Shift+B)">
    <span className={styles.arrow}>←</span>
    <span className={styles.label}>Wróć</span>
  </button>
);
