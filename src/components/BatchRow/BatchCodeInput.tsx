// src/components/BatchRow/BatchCodeInput.tsx

import React from "react";
import styles from "./BatchRow.module.scss";

interface BatchCodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const BatchCodeInput: React.FC<BatchCodeInputProps> = ({
  value,
  onChange,
}) => {
  // Genera automáticamente el placeholder dinámico del día actual (Ej: 2605/00)
  const getBatchPlaceholder = (): string => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    return `${dia}${mes}/00`;
  };

  return (
    <div className={styles.horizontalInputGroup}>
      <label className={styles.shortLabel}>Lote</label>
      <input
        type="text"
        className={styles.darkInput}
        placeholder={getBatchPlaceholder()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
