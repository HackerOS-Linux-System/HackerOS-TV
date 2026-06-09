import { useEffect, useState, FC } from "react";
import type { ToastMsg as ToastMessage } from "../types";
import styles from "./Toast.module.css";

// ToastMessage imported from types

interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: FC<ToastProps> = ({ messages, onDismiss }) => {
  return (
    <div className={styles.container}>
      {messages.map((m) => (
        <ToastItem key={m.id} message={m} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: FC<{ message: ToastMessage; onDismiss: (id: string) => void }> = ({
  message,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(message.id), 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [message.id, onDismiss]);

  return (
    <div
      className={`${styles.toast} ${styles[message.type]} ${!visible ? styles.exit : ""}`}
    >
      <span className={styles.toastIcon}>
        {message.type === "success" && "✓"}
        {message.type === "error" && "✕"}
        {message.type === "info" && "◈"}
      </span>
      <span className={styles.toastText}>{message.text}</span>
    </div>
  );
};
